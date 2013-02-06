
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
var blackberry_parser = require('../../src/metadata/blackberry_parser'),
    config_parser = require('../../src/config_parser'),
    path = require('path'),
    util = require('../../src/util'),
    et = require('elementtree'),
    shell = require('shelljs'),
    cordova = require('../../cordova'),
    fs = require('fs'),
    projects_path = path.join(__dirname, '..', 'fixtures', 'projects'),
    blackberry_path = path.join(projects_path, 'native', 'blackberry_fixture'),
    project_path = path.join(projects_path, 'cordova'),
    blackberry_project_path = path.join(project_path, 'platforms', 'blackberry');

var www_config = path.join(project_path, 'www', 'config.xml');
var original_www_config = fs.readFileSync(www_config, 'utf-8');

describe('blackberry project parser', function() {
    it('should throw an exception with a path that is not a native blackberry project', function() {
        expect(function() {
            var project = new blackberry_parser(process.cwd());
        }).toThrow();
    });
    it('should accept a proper native blackberry project path as construction parameter', function() {
        var project;
        expect(function() {
            project = new blackberry_parser(blackberry_path);
        }).not.toThrow();
        expect(project).toBeDefined();
    });

    describe('update_from_config method', function() {
        var project, config;

        var blackberry_config = path.join(blackberry_path, 'www', 'config.xml');
        var original_blackberry_config = fs.readFileSync(blackberry_config, 'utf-8');

        beforeEach(function() {
            project = new blackberry_parser(blackberry_path);
            config = new config_parser(www_config);
        });
        afterEach(function() {
            fs.writeFileSync(blackberry_config, original_blackberry_config, 'utf-8');
            fs.writeFileSync(www_config, original_www_config, 'utf-8');
        });
        it('should throw an exception if a non config_parser object is passed into it', function() {
            expect(function() {
                project.update_from_config({});
            }).toThrow();
        });
        it('should update the application name properly', function() {
            config.name('bond. james bond.');
            project.update_from_config(config);

            var bb_cfg = new config_parser(blackberry_config);

            expect(bb_cfg.name()).toBe('bond. james bond.');
        });
        it('should update the application package name properly', function() {
            config.packageName('sofa.king.awesome');
            project.update_from_config(config);

            var bb_cfg = new config_parser(blackberry_config);
            expect(bb_cfg.packageName()).toBe('sofa.king.awesome');
        });
        describe('whitelist', function() {
            it('should update the whitelist when using access elements with origin attribute', function() {
                config.access.remove('*');
                config.access.add('http://blackberry.com');
                config.access.add('http://rim.com');
                project.update_from_config(config);

                var bb_cfg = new et.ElementTree(et.XML(fs.readFileSync(blackberry_config, 'utf-8')));
                var as = bb_cfg.getroot().findall('access');
                expect(as.length).toEqual(2);
                expect(as[0].attrib.uri).toEqual('http://blackberry.com');
                expect(as[1].attrib.uri).toEqual('http://rim.com');
            });
            it('should update the whitelist when using access elements with uri attributes', function() {
                fs.writeFileSync(www_config, fs.readFileSync(www_config, 'utf-8').replace(/origin="\*/,'uri="http://rim.com'), 'utf-8');
                config = new config_parser(www_config);
                project.update_from_config(config);

                var bb_cfg = new et.ElementTree(et.XML(fs.readFileSync(blackberry_config, 'utf-8')));
                var as = bb_cfg.getroot().findall('access');
                expect(as.length).toEqual(1);
                expect(as[0].attrib.uri).toEqual('http://rim.com');
            });
        });
    });

    describe('cross-platform project level methods', function() {
        var parser, config;

        var blackberry_config = path.join(blackberry_project_path, 'www', 'config.xml');
        var original_blackberry_config = fs.readFileSync(blackberry_config, 'utf-8');

        beforeEach(function() {
            parser = new blackberry_parser(blackberry_project_path);
            config = new config_parser(www_config);
        });
        afterEach(function() {
            fs.writeFileSync(blackberry_config, original_blackberry_config, 'utf-8');
            fs.writeFileSync(www_config, original_www_config, 'utf-8');
        });

        describe('update_www method', function() {
            it('should update all www assets', function() {
                var newFile = path.join(project_path, 'www', 'somescript.js');
                this.after(function() {
                    shell.rm('-f', newFile);
                });
                fs.writeFileSync(newFile, 'alert("sup");', 'utf-8');
                parser.update_www();
                expect(fs.existsSync(path.join(blackberry_project_path, 'www', 'somescript.js'))).toBe(true);
            });
            it('should not overwrite the blackberry-specific config.xml', function() {
                var www_cfg = fs.readFileSync(path.join(project_path, 'www', 'config.xml'), 'utf-8');
                parser.update_www();
                var bb_cfg = fs.readFileSync(blackberry_config, 'utf-8');
                expect(bb_cfg).not.toBe(www_cfg);
            });
            it('should inject a reference to webworks.js in index.html', function() {
                parser.update_www();
                var index = fs.readFileSync(path.join(blackberry_project_path, 'www', 'index.html'), 'utf-8');
                expect(index).toMatch(/<script type="text\/javascript" src="js\/webworks.js">/i);
            });
            it('should call out to util.deleteSvnFolders', function() {
                var spy = spyOn(util, 'deleteSvnFolders');
                parser.update_www();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('update_project method', function() {
            var cordova_config_path = path.join(project_path, '.cordova', 'config.json');
            var original_config_json = fs.readFileSync(cordova_config_path, 'utf-8');

            describe('with stubbed out config for BlackBerry SDKs', function() {
                beforeEach(function() {
                    fs.writeFileSync(cordova_config_path, JSON.stringify({
                        blackberry:{
                            qnx:{
                            }
                        }
                    }), 'utf-8');
                });
                afterEach(function() {
                    fs.writeFileSync(cordova_config_path, original_config_json, 'utf-8');
                });
                it('should invoke update_www', function() {
                    var spyWww = spyOn(parser, 'update_www');
                    parser.update_project(config);
                    expect(spyWww).toHaveBeenCalled();
                });
                it('should invoke update_from_config', function() {
                    var spyConfig = spyOn(parser, 'update_from_config');
                    parser.update_project(config);
                    expect(spyConfig).toHaveBeenCalled();
                });
                it('should not invoke get_blackberry_environment', function() {
                    var spyEnv = spyOn(parser, 'get_blackberry_environment');
                    parser.update_project(config);
                    expect(spyEnv).not.toHaveBeenCalled();
                });
                it('should write out project properties', function() {
                    var spyProps = spyOn(parser, 'write_project_properties');
                    parser.update_project(config, function() { 
                        expect(spyProps).toHaveBeenCalled();
                    });
                });
            });
            describe('with empty BlackBerry SDKs in config', function() {
                afterEach(function() {
                    fs.writeFileSync(cordova_config_path, original_config_json, 'utf-8');
                });
                it('should invoke get_blackberry_environment', function() {
                    var spyEnv = spyOn(parser, 'get_blackberry_environment');
                    var promptSpy = spyOn(require('prompt'), 'get');
                    parser.update_project(config);
                    expect(spyEnv).toHaveBeenCalled();
                });
                it('should write out project properties', function(done) {
                    var spyProps = spyOn(parser, 'write_project_properties');
                    var promptSpy = spyOn(require('prompt'), 'get');
                    parser.update_project(config, function() {
                        expect(spyProps).toHaveBeenCalled();
                        done();
                    });
                    promptSpy.mostRecentCall.args[1](null, {});
                });
            });
        });
    });

    describe('write_project_properties method', function() {
    });

    describe('get_blackberry_environment method', function() {
    });
});
