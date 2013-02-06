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
var cordova = require('../cordova'),
    path = require('path'),
    shell = require('shelljs'),
    fs = require('fs'),
    hooker = require('../src/hooker'),
    tempDir = path.join(__dirname, '..', 'temp'),
    fixturesDir = path.join(__dirname, 'fixtures'),
    testPlugin = path.join(fixturesDir, 'plugins', 'test'),
    cordova_project = path.join(fixturesDir, 'projects', 'cordova'),
    androidPlugin = path.join(fixturesDir, 'plugins', 'android');

var cwd = process.cwd();

describe('plugin command', function() {
    beforeEach(function() {
        // Make a temp directory
        shell.rm('-rf', tempDir);
        shell.mkdir('-p', tempDir);
    });

    it('should run inside a Cordova-based project', function() {
        this.after(function() {
            process.chdir(cwd);
        });

        cordova.create(tempDir);

        process.chdir(tempDir);

        expect(function() {
            cordova.plugin();
        }).not.toThrow();
    });
    it('should not run outside of a Cordova-based project', function() {
        this.after(function() {
            process.chdir(cwd);
        });

        process.chdir(tempDir);

        expect(function() {
            cordova.plugin();
        }).toThrow();
    });

    describe('`ls`', function() {
        beforeEach(function() {
            cordova.create(tempDir);
        });

        afterEach(function() {
            process.chdir(cwd);
        });

        it('should list out no plugins for a fresh project', function() {
            process.chdir(tempDir);

            expect(cordova.plugin('list')).toEqual('No plugins added. Use `cordova plugin add <plugin>`.');
        });
    });

    describe('`add`', function() {
        beforeEach(function() {
            cordova.create(tempDir);
            process.chdir(tempDir);
        });

        afterEach(function() {
            process.chdir(cwd);
        });
        describe('failure', function() {
            it('should throw if your app has no platforms added', function() {
                expect(function() {
                    cordova.plugin('add', testPlugin);
                }).toThrow('You need at least one platform added to your app. Use `cordova platform add <platform>`.');
            });
            it('should throw if plugin does not support any app platforms', function() {
                process.chdir(cordova_project);
                shell.mv('-f', path.join(cordova_project, 'platforms', 'android'), tempDir);
                shell.mv('-f', path.join(cordova_project, 'platforms', 'blackberry'), tempDir);
                this.after(function() {
                    process.chdir(cwd);
                    shell.mv('-f', path.join(tempDir, 'android'), path.join(cordova_project, 'platforms'));
                    shell.mv('-f', path.join(tempDir, 'blackberry'), path.join(cordova_project, 'platforms'));
                });
                expect(function() {
                    cordova.plugin('add', androidPlugin);
                }).toThrow('Plugin "android" does not support any of your application\'s platforms. Plugin platforms: android; your application\'s platforms: ios');
            });
            it('should throw if plugin is already added to project', function() {
                process.chdir(cordova_project);
                var cb = jasmine.createSpy();
                this.after(function() {
                    process.chdir(cordova_project);
                    cordova.plugin('rm', "test");
                    process.chdir(cwd);
                });
                runs(function() {
                    cordova.plugin('add', testPlugin, cb);
                });
                waitsFor(function() { return cb.wasCalled; }, 'frst add plugin');
                runs(function(){
                    expect(function() {
                        cordova.plugin('add', testPlugin);
                    }).toThrow('Plugin "test" already added to project.');
                });
            });
            it('should throw if plugin does not have a plugin.xml', function() {
                process.chdir(cordova_project);
                this.after(function() {
                    process.chdir(cwd);
                });
                expect(function() {
                    cordova.plugin('add', fixturesDir);
                }).toThrow('Plugin "fixtures" does not have a plugin.xml in the root. Plugin must support the Cordova Plugin Specification: https://github.com/alunny/cordova-plugin-spec');
            });
        });
    });
});

