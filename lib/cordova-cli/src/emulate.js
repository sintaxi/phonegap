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
var cordova_util = require('./util'),
    path = require('path'),
    shell = require('shelljs'),
    config_parser = require('./config_parser'),
    android_parser = require('./metadata/android_parser'),
    ios_parser = require('./metadata/ios_parser'),
    blackberry_parser = require('./metadata/blackberry_parser'),
    platform = require('./platform'),
    fs = require('fs'),
    ls = fs.readdirSync,
    n = require('ncallbacks'),
    hooker = require('../src/hooker'),
    util = require('util');

function shell_out_to_emulate(root, platform, callback) {
    var cmd = path.join(root, 'platforms', platform, 'cordova', 'emulate');
    // TODO: PLATFORM LIBRARY INCONSISTENCY 
    if (platform == 'blackberry') {
        cmd = 'ant -f "' + path.join(root, 'platforms', platform, 'build.xml') + '" qnx load-simulator';
    } else if (platform.indexOf('android') > -1) {
        cmd = path.join(root, 'platforms', platform, 'cordova', 'run');
    }
    shell.exec(cmd, {silent:true, async:true}, function(code, output) {
        if (code > 0) {
            throw new Error('An error occurred while emulating/deploying the ' + platform + ' project.' + output);
        } else {
            callback();
        }
    });
}

module.exports = function emulate (platforms, callback) {
    var projectRoot = cordova_util.isCordova(process.cwd());

    if (!projectRoot) {
        throw 'Current working directory is not a Cordova-based project.';
    }

    var xml = path.join(projectRoot, 'www', 'config.xml');
    var cfg = new config_parser(xml);

    if (arguments.length === 0 || (platforms instanceof Array && platforms.length === 0)) {
        platforms = ls(path.join(projectRoot, 'platforms'));
    } else if (typeof platforms == 'string') platforms = [platforms];
    else if (platforms instanceof Function && callback === undefined) {
        callback = platforms;
        platforms = ls(path.join(projectRoot, 'platforms'));
    }

    if (platforms.length === 0) throw new Error('No platforms added to this project. Please use `cordova platform add <platform>`.');

    var hooks = new hooker(projectRoot);
    if (!(hooks.fire('before_emulate'))) {
        throw new Error('before_emulate hooks exited with non-zero code. Aborting build.');
    }

    var end = n(platforms.length, function() {
        if (!(hooks.fire('after_emulate'))) {
            throw new Error('after_emulate hooks exited with non-zero code. Aborting.');
        }
        if (callback) callback();
    });

    // Iterate over each added platform and shell out to debug command
    platforms.forEach(function(platform) {
        var parser, platformPath;
        switch (platform) {
            case 'android':
                platformPath = path.join(projectRoot, 'platforms', 'android');
                parser = new android_parser(platformPath);

                // Update the related platform project from the config
                parser.update_project(cfg);
                shell_out_to_emulate(projectRoot, 'android', end);
                break;
            case 'blackberry':
                platformPath = path.join(projectRoot, 'platforms', 'blackberry');
                parser = new blackberry_parser(platformPath);
                
                // Update the related platform project from the config
                parser.update_project(cfg, function() {
                    // Shell it
                    shell_out_to_emulate(projectRoot, 'blackberry', end);
                });
                break;
            case 'ios':
                platformPath = path.join(projectRoot, 'platforms', 'ios');
                parser = new ios_parser(platformPath);
                // Update the related platform project from the config
                parser.update_project(cfg, function() {
                    shell_out_to_emulate(projectRoot, 'ios', end);
                });
                break;
        }
    });
};

