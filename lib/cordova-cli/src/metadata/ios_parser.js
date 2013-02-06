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
    xcode         = require('xcode'),
    util          = require('../util'),
    shell         = require('shelljs'),
    plist         = require('plist'),
    semver        = require('semver'),
    et            = require('elementtree'),
    config_parser = require('../config_parser');

var MIN_XCODE_VERSION = '4.5.x';

var default_prefs = {
    "KeyboardDisplayRequiresUserAction":"true",
    "SuppressesIncrementalRendering":"false",
    "UIWebViewBounce":"true",
    "TopActivityIndicator":"gray",
    "EnableLocation":"false",
    "EnableViewportScale":"false",
    "AutoHideSplashScreen":"true",
    "ShowSplashScreenSpinner":"true",
    "MediaPlaybackRequiresUserAction":"false",
    "AllowInlineMediaPlayback":"false",
    "OpenAllWhitelistURLsInWebView":"false",
    "BackupWebStorage":"cloud"
};

module.exports = function ios_parser(project) {
    try {
        var xcodeproj_dir = fs.readdirSync(project).filter(function(e) { return e.match(/\.xcodeproj$/i); })[0];
        if (!xcodeproj_dir) throw new Error('The provided path "' + project + '" is not a Cordova iOS project.');
        this.xcodeproj = path.join(project, xcodeproj_dir);
        this.originalName = this.xcodeproj.substring(this.xcodeproj.lastIndexOf('/'), this.xcodeproj.indexOf('.xcodeproj'));
        this.cordovaproj = path.join(project, this.originalName);
    } catch(e) {
        throw new Error('The provided path is not a Cordova iOS project.');
    }
    this.path = project;
    this.pbxproj = path.join(this.xcodeproj, 'project.pbxproj');
    this.config = new config_parser(path.join(this.cordovaproj, 'config.xml'));
};

module.exports.check_requirements = function(callback) {
    // Check xcode + version.
    shell.exec('xcodebuild -version', {silent:true, async:true}, function(code, output) {
        if (code != 0) {
            callback('Xcode is not installed. Cannot add iOS platform.');
        } else {
            var xc_version = output.split('\n')[0].split(' ')[1];
            if (semver.lt(xc_version, MIN_XCODE_VERSION)) {
                callback('Xcode version installed is too old. Minimum: ' + MIN_XCODE_VERSION + ', yours: ' + xc_version);
            } else callback(false);
        }
    });
};

module.exports.prototype = {
    update_from_config:function(config, callback) {
        if (config instanceof config_parser) {
        } else throw new Error('update_from_config requires a config_parser object');
        var name = config.name();
        var pkg = config.packageName();

        // Update package id (bundle id)
        var plistFile = path.join(this.cordovaproj, this.originalName + '-Info.plist');
        var infoPlist = plist.parseFileSync(plistFile);
        infoPlist['CFBundleIdentifier'] = pkg;
        var info_contents = plist.build(infoPlist);
        info_contents = info_contents.replace(/<string>[\s\r\n]*<\/string>/g,'<string></string>');
        fs.writeFileSync(plistFile, info_contents, 'utf-8');

        // Update whitelist
        var self = this;
        this.config.access.remove();
        config.access.get().forEach(function(uri) {
            self.config.access.add(uri);
        });
        
        // Update preferences
        this.config.preference.remove();
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
            this.config.preference.add({
                name:p,
                value:value
            });
        }
        prefs.forEach(function(pref) {
            self.config.preference.add({
                name:pref.name,
                value:pref.value
            });
        });
        
        // Update product name
        var proj = new xcode.project(this.pbxproj);
        var parser = this;
        proj.parse(function(err,hash) {
            if (err) throw new Error('An error occured during parsing of project.pbxproj. Start weeping.');
            else {
                proj.updateProductName(name);
                fs.writeFileSync(parser.pbxproj, proj.writeSync(), 'utf-8');
                if (callback) callback();
            }
        });
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        return path.join(this.path, 'www');
    },

    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var www = path.join(projectRoot, 'www');
        var project_www = path.join(this.path, 'www');

        // remove the stock www folder
        shell.rm('-rf', project_www);

        // copy over project www assets
        shell.cp('-rf', www, this.path);

        // write out proper cordova.js
        shell.cp('-f', path.join(util.libDirectory, 'cordova-ios', 'CordovaLib', 'cordova.ios.js'), path.join(project_www, 'cordova.js'));

        util.deleteSvnFolders(project_www);
    },
    update_project:function(cfg, callback) {
        var self = this;
        this.update_from_config(cfg, function() {
            self.update_www();
            if (callback) callback();
        });
    }
};
