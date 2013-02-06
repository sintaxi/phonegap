
/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/
var fs            = require('fs'),
    path          = require('path'),
    et            = require('elementtree'),
    util          = require('../util'),
    shell         = require('shelljs'),
    config_parser = require('../config_parser');

var default_prefs = {
    "useBrowserHistory":"true",
    "exit-on-suspend":"false"
};

module.exports = function android_parser(project) {
    if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
        throw new Error('The provided path "' + project + '" is not an Android project.');
    }
    this.path = project;
    this.strings = path.join(this.path, 'res', 'values', 'strings.xml');
    this.manifest = path.join(this.path, 'AndroidManifest.xml');
    this.android_config = path.join(this.path, 'res', 'xml', 'config.xml');
};

module.exports.check_requirements = function(callback) {
    shell.exec('android list target', {silent:true, async:true}, function(code, output) {
        if (code != 0) {
            callback('The command `android` failed. Make sure you have the latest Android SDK installed, and the `android` command (inside the tools/ folder) added to your path.');
        } else {
            if (output.indexOf('android-17') == -1) {
                callback('Please install Android target 17 (the Android 4.2 SDK). Make sure you have the latest Android tools installed as well. Run `android` from your command-line to install/update any missing SDKs or tools.');
            } else {
                var cmd = 'android update project -p ' + path.join(__dirname, '..', '..', 'lib', 'cordova-android', 'framework') + ' -t android-17';
                shell.exec(cmd, {silent:true, async:true}, function(code, output) {
                    if (code != 0) {
                        callback('Error updating the Cordova library to work with your Android environment. Command run: "' + cmd + '", output: ' + output);
                    } else {
                        callback(false);
                    }
                });
            }
        }
    });
};

module.exports.prototype = {
    update_from_config:function(config) {
        if (config instanceof config_parser) {
        } else throw 'update_from_config requires a config_parser object';

        // Update app name by editing res/values/strings.xml
        var name = config.name();
        var strings = new et.ElementTree(et.XML(fs.readFileSync(this.strings, 'utf-8')));
        strings.find('string[@name="app_name"]').text = name;
        fs.writeFileSync(this.strings, strings.write({indent: 4}), 'utf-8');

        // Update package name by changing the AndroidManifest id and moving the entry class around to the proper package directory
        var manifest = new et.ElementTree(et.XML(fs.readFileSync(this.manifest, 'utf-8')));
        var pkg = config.packageName();
        var orig_pkg = manifest.getroot().attrib.package;
        manifest.getroot().attrib.package = pkg;
        fs.writeFileSync(this.manifest, manifest.write({indent: 4}), 'utf-8');
        var orig_pkgDir = path.join(this.path, 'src', path.join.apply(null, orig_pkg.split('.')));
        var orig_java_class = fs.readdirSync(orig_pkgDir).filter(function(f) {return f.indexOf('.svn') == -1;})[0];
        var pkgDir = path.join(this.path, 'src', path.join.apply(null, pkg.split('.')));
        shell.mkdir('-p', pkgDir);
        var orig_javs = path.join(orig_pkgDir, orig_java_class);
        var new_javs = path.join(pkgDir, orig_java_class);
        var javs_contents = fs.readFileSync(orig_javs, 'utf-8');
        javs_contents = javs_contents.replace(/package [\w\.]*;/, 'package ' + pkg + ';');
        fs.writeFileSync(new_javs, javs_contents, 'utf-8');

        // Update whitelist by changing res/xml/config.xml
        var android_cfg_xml = new config_parser(this.android_config);
        // clean out all existing access elements first
        android_cfg_xml.access.remove();
        // add only the ones specified in the www/config.xml file
        config.access.get().forEach(function(uri) {
            android_cfg_xml.access.add(uri);
        });
        
        // Update preferences
        android_cfg_xml.preference.remove();
        var prefs = config.preference.get();
        // write out defaults, unless user has specifically overrode it
        for (var p in default_prefs) if (default_prefs.hasOwnProperty(p)) {
            var override = prefs.filter(function(pref) { return pref.name == p; });
            var value = default_prefs[p];
            if (override.length) {
                // override exists
                value = override[0].value;
                // remove from prefs list so we dont write it out again below
                prefs = prefs.filter(function(pref) { return pref.name != p });
            }
            android_cfg_xml.preference.add({
                name:p,
                value:value
            });
        }
        prefs.forEach(function(pref) {
            android_cfg_xml.preference.add({
                name:pref.name,
                value:pref.value
            });
        });
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.path, 'assets', 'www');
    },

    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var www = path.join(projectRoot, 'www');
        var platformWww = path.join(this.path, 'assets');
        // remove stock platform assets
        shell.rm('-rf', path.join(platformWww, 'www'));
        // copy over all app www assets
        shell.cp('-rf', www, platformWww);
        platformWww = path.join(platformWww, 'www');

        // write out android lib's cordova.js
        var jsPath = path.join(util.libDirectory, 'cordova-android', 'framework', 'assets', 'js', 'cordova.android.js');
        fs.writeFileSync(path.join(platformWww, 'cordova.js'), fs.readFileSync(jsPath, 'utf-8'), 'utf-8');

        // delete any .svn folders copied over
        util.deleteSvnFolders(platformWww);
    },
    update_project:function(cfg) {
        this.update_from_config(cfg);
        this.update_www();
    }
};

