
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
var hooker = require('../src/hooker'),
    shell  = require('shelljs'),
    path   = require('path'),
    fs     = require('fs'),
    tempDir= path.join(__dirname, '..', 'temp'),
    hooks  = path.join(__dirname, 'fixtures', 'hooks'),
    cordova= require('../cordova');

var cwd = process.cwd();

describe('hooker', function() {
    it('should throw if provided directory is not a cordova project', function() {
        shell.rm('-rf', tempDir);
        shell.mkdir('-p', tempDir); 
        this.after(function() {
            shell.rm('-rf', tempDir);
        });

        expect(function() {
            var h = new hooker(tempDir);
        }).toThrow();
    });
    it('should not throw if provided directory is a cordova project', function() {
        cordova.create(tempDir);
        this.after(function() {
            shell.rm('-rf', tempDir);
        });

        expect(function() {
            var h = new hooker(tempDir);
        }).not.toThrow();
    });

    describe('fire method', function() {
        var h;

        beforeEach(function() {
            cordova.create(tempDir);
            h = new hooker(tempDir);
        });
        afterEach(function() {
            shell.rm('-rf', tempDir);
        });

        describe('failure', function() {
            it('should not throw if the hook is unrecognized', function() {
                expect(function() {
                    h.fire('CLEAN YOUR SHORTS GODDAMNIT LIKE A BIG BOY!');
                }).not.toThrow();
            });
            it('should throw if any script exits with non-zero code', function() {
                var script = path.join(tempDir, '.cordova', 'hooks', 'before_build', 'fail.sh');
                shell.cp(path.join(hooks, 'fail', 'fail.sh'), script);
                fs.chmodSync(script, '754');
                expect(function() {
                    h.fire('before_build');
                }).toThrow();
            });
        });

        describe('success', function() {
            it('should execute all scripts in order and return true', function() {
                var hook = path.join(tempDir, '.cordova', 'hooks', 'before_build');
                shell.cp(path.join(hooks, 'test', '*'), path.join(hook, '.'));
                fs.readdirSync(hook).forEach(function(script) {
                    fs.chmodSync(path.join(hook, script), '754');
                });
                var returnValue;
                var s = spyOn(shell, 'exec').andReturn({code:0});
                expect(function() {
                    returnValue = h.fire('before_build');
                }).not.toThrow();
                expect(returnValue).toBe(true);
                expect(s.calls[0].args[0]).toMatch(/0.sh$/);
                expect(s.calls[1].args[0]).toMatch(/1.sh$/);
            });
        });
    });
});
