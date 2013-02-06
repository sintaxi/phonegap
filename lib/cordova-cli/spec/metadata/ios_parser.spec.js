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

var ios_parser = require('../../src/metadata/ios_parser'),
    config_parser = require('../../src/config_parser'),
    cordova = require('../../cordova'),
    util = require('../../src/util'),
    path = require('path'),
    shell = require('shelljs'),
    fs = require('fs'),
    et = require('elementtree'),
    projects_path = path.join(__dirname, '..', 'fixtures', 'projects')
    ios_path = path.join(projects_path, 'native', 'ios_fixture'),
    project_path = path.join(projects_path, 'cordova'),
    ios_project_path = path.join(project_path, 'platforms', 'ios');

var www_config = path.join(project_path, 'www', 'config.xml');
var original_www_config = fs.readFileSync(www_config, 'utf-8');

describe('ios project parser', function() {
    it('should throw an exception with a path that is not a native ios project', function() {
        expect(function() {
            var project = new ios_parser(process.cwd());
        }).toThrow();
    });
    it('should accept a proper native ios project path as construction parameter', function() {
        var project;
        expect(function() {
            project = new ios_parser(ios_path);
        }).not.toThrow();
        expect(project).toBeDefined();
    });

    describe('update_from_config method', function() {
        var project, config;

        var ios_plist = path.join(ios_path, 'cordovaExample', 'cordovaExample-Info.plist'),
            ios_pbx = path.join(ios_path, 'cordovaExample.xcodeproj', 'project.pbxproj'),
            ios_config_xml = path.join(ios_path, 'cordovaExample', 'config.xml');

        var original_pbx = fs.readFileSync(ios_pbx, 'utf-8');
        var original_plist = fs.readFileSync(ios_plist, 'utf-8');
        var original_ios_config = fs.readFileSync(ios_config_xml, 'utf-8');

        beforeEach(function() {
            project = new ios_parser(ios_path);
            config = new config_parser(www_config);
        });
        afterEach(function() {
            fs.writeFileSync(ios_pbx, original_pbx, 'utf-8');
            fs.writeFileSync(ios_config_xml, original_ios_config, 'utf-8');
            fs.writeFileSync(ios_plist, original_plist, 'utf-8');
            fs.writeFileSync(www_config, original_www_config, 'utf-8');
        });
        it('should throw an exception if a non config_parser object is passed into it', function() {
            expect(function() {
                project.update_from_config({});
            }).toThrow();
        });
        it('should update the application name properly', function(done) {
            config.name('bond. james bond.');
            project.update_from_config(config, function() {
                var pbx_contents = fs.readFileSync(ios_pbx, 'utf-8');
                expect(pbx_contents.match(/PRODUCT_NAME\s*=\s*"bond. james bond."/)[0]).toBe('PRODUCT_NAME = "bond. james bond."');
                done();
            });
        });
        it('should update the application package name (bundle identifier) properly', function(done) {
            config.packageName('ca.filmaj.dewd');
            project.update_from_config(config, function() {
                var plist_contents = fs.readFileSync(ios_plist, 'utf-8');
                expect(plist_contents).toMatch(/<string>ca.filmaj.dewd/);
                done();
            });
        });
        it('should update the whitelist in the project config.xml', function(done) {
            project.update_from_config(config, function() {
                var config_contents = fs.readFileSync(ios_config_xml, 'utf-8');
                expect(config_contents).toMatch(/<access origin="\*" \/>/);
                done();
            });
        });
        describe('preferences', function() {
            it('should not change default project preferences and copy over additional project preferences to platform-level config.xml', function(done) {
                config.preference.add({name:'henrik',value:'sedin'});
                project.update_from_config(config, function() {
                    var native_config = new et.ElementTree(et.XML(fs.readFileSync(ios_config_xml, 'utf-8')));
                    var ps = native_config.findall('preference');
                    expect(ps.length).toEqual(17);
                    expect(ps[0].attrib.name).toEqual('KeyboardDisplayRequiresUserAction');
                    expect(ps[0].attrib.value).toEqual('true');
                    expect(ps[16].attrib.name).toEqual('henrik');
                    expect(ps[16].attrib.value).toEqual('sedin');
                    done();
                });
            });
            it('should override a default project preference if applicable', function(done) {
                config.preference.add({name:'UIWebViewBounce',value:'false'});
                project.update_from_config(config, function() {
                    var native_config = new et.ElementTree(et.XML(fs.readFileSync(ios_config_xml, 'utf-8')));
                    var ps = native_config.findall('preference');
                    expect(ps.length).toEqual(16);
                    expect(ps[2].attrib.name).toEqual('UIWebViewBounce');
                    expect(ps[2].attrib.value).toEqual('false');
                    done();
                });
            });
        });
    });

    describe('cross-platform project level methods', function() {
        var parser, config;
        var ios_plist = path.join(ios_project_path, 'cordovaExample', 'cordovaExample-Info.plist'),
            ios_pbx = path.join(ios_project_path, 'cordovaExample.xcodeproj', 'project.pbxproj'),
            ios_config_xml = path.join(ios_project_path, 'cordovaExample', 'config.xml');

        var original_pbx = fs.readFileSync(ios_pbx, 'utf-8');
        var original_plist = fs.readFileSync(ios_plist, 'utf-8');
        var original_ios_config = fs.readFileSync(ios_config_xml, 'utf-8');

        beforeEach(function() {
            parser = new ios_parser(ios_project_path);
            config = new config_parser(www_config);
        });
        afterEach(function() {
            fs.writeFileSync(ios_pbx, original_pbx, 'utf-8');
            fs.writeFileSync(ios_config_xml, original_ios_config, 'utf-8');
            fs.writeFileSync(ios_plist, original_plist, 'utf-8');
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
                expect(fs.existsSync(path.join(ios_project_path, 'www', 'somescript.js'))).toBe(true);
            });
            it('should write out ios js to cordova.js', function() {
                parser.update_www();
                expect(fs.readFileSync(path.join(ios_project_path, 'www', 'cordova.js'),'utf-8')).toBe(fs.readFileSync(path.join(util.libDirectory, 'cordova-ios', 'CordovaLib', 'cordova.ios.js'), 'utf-8'));
            });
            it('should call out to util.deleteSvnFolders', function() {
                var spy = spyOn(util, 'deleteSvnFolders');
                parser.update_www();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('update_project method', function() {
            it('should invoke update_www', function(done) {
                var spyWww = spyOn(parser, 'update_www');
                parser.update_project(config, function() {
                    expect(spyWww).toHaveBeenCalled();
                    done();
                });
            });
            it('should invoke update_from_config', function(done) {
                var spyConfig = spyOn(parser, 'update_from_config').andCallThrough();
                parser.update_project(config, function() {
                    expect(spyConfig).toHaveBeenCalled();
                    done();
                });
            });
        });
    });
});
