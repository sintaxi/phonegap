/*
 *  Copyright 2013 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var wrench = require('wrench'),
    path = require('path'),
    fs = require('fs');

module.exports = function (done, custom) {
    var jasmine = require('jasmine-node'),
        verbose = false,
        coloured = false,
        specs = [
            "framework/test",
            "bin/test/cordova/integration",
            "bin/test/cordova/unit",
            "bin/test/plugins"
        ];
        key = {};

    if (typeof custom !== "undefined" && fs.existsSync(custom)) {
        specs = [custom];
    }

    for (key in jasmine) {
        if (Object.prototype.hasOwnProperty.call(jasmine, key)) {
            global[key] = jasmine[key];
        }
    }

    function execSpecs(folders) {
        var failed = 0;
        if (folders.length > 0) {
            console.log("Running tests in: " + folders[folders.length - 1]);
            jasmine.executeSpecsInFolder(path.resolve(folders.pop()), function (runner) {
                execSpecs(folders);
                failed = runner.results().failedcount === 0 ? 0 : 1;
            }, verbose, coloured);
        }
        else {
            (typeof done !== "function" ? process.exit : done)(failed);
        }
    }

    execSpecs(specs);
};
