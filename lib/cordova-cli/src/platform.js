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
var config_parser     = require('./config_parser'),
    cordova_util      = require('./util'),
    util              = require('util'),
    fs                = require('fs'),
    path              = require('path'),
    hooker            = require('./hooker'),
    n                 = require('ncallbacks'),
    android_parser    = require('./metadata/android_parser'),
    ios_parser        = require('./metadata/ios_parser'),
    blackberry_parser = require('./metadata/blackberry_parser'),
    shell             = require('shelljs');

module.exports = function platform(command, targets, callback) {
    var projectRoot = cordova_util.isCordova(process.cwd());

    if (!projectRoot) {
        throw 'Current working directory is not a Cordova-based project.';
    }

    var hooks = new hooker(projectRoot),
        end;

    if (arguments.length === 0) command = 'ls';
    if (targets) {
        if (!(targets instanceof Array)) targets = [targets];
        end = n(targets.length, function() {
            if (callback) callback();
        });
    }

    var xml = path.join(projectRoot, 'www', 'config.xml');
    var cfg = new config_parser(xml);

    switch(command) {
        case 'ls':
        case 'list':
            // TODO before+after hooks here are awkward
            hooks.fire('before_platform_ls');
            hooks.fire('after_platform_ls');
            return fs.readdirSync(path.join(projectRoot, 'platforms'));
            break;
        case 'add':
            targets.forEach(function(target) {
                hooks.fire('before_platform_add');
                var output = path.join(projectRoot, 'platforms', target);

                // Check if output directory already exists.
                if (fs.existsSync(output)) {
                    throw new Error('Platform "' + target + '" already exists' );
                }

                // Make sure we have minimum requirements to work with specified platform
                require('./metadata/' + target + '_parser').check_requirements(function(err) {
                    if (err) {
                        throw new Error('Your system does not meet the requirements to create ' + target + ' projects: ' + err);
                    } else {
                        // Create a platform app using the ./bin/create scripts that exist in each repo.
                        // TODO: eventually refactor to allow multiple versions to be created.
                        // Run platform's create script
                        var bin = path.join(cordova_util.libDirectory, 'cordova-' + target, 'bin', 'create');
                        var pkg = cfg.packageName().replace(/[^\w.]/g,'_');
                        var name = cfg.name().replace(/\W/g,'_');
                        // TODO: PLATFORM LIBRARY INCONSISTENCY: order/number of arguments to create
                        // TODO: keep tabs on CB-2300
                        var command = util.format('"%s" "%s" "%s" "%s"', bin, output, (target=='blackberry'?name:pkg), name);

                        shell.exec(command, {silent:true,async:true}, function(code, create_output) {
                            if (code > 0) {
                                throw new Error('An error occured during creation of ' + target + ' sub-project. ' + create_output);
                            }

                            switch(target) {
                                case 'android':
                                    var android = new android_parser(output);
                                    android.update_project(cfg);
                                    hooks.fire('after_platform_add');
                                    end();
                                    break;
                                case 'ios':
                                    var ios = new ios_parser(output);
                                    ios.update_project(cfg, function() {
                                        hooks.fire('after_platform_add');
                                        end();
                                    });
                                    break;
                                case 'blackberry':
                                    var bb = new blackberry_parser(output);
                                    bb.update_project(cfg, function() {
                                        hooks.fire('after_platform_add');
                                        end();
                                    });
                                    break;
                            }
                        });
                    }
                });
            });
            break;
        case 'rm':
        case 'remove':
            targets.forEach(function(target) {
                hooks.fire('before_platform_rm');
                shell.rm('-rf', path.join(projectRoot, 'platforms', target));
                hooks.fire('after_platform_rm');
            });
            break;
        default:
            throw ('Unrecognized command "' + command + '". Use either `add`, `remove`, or `list`.');
    }
};
