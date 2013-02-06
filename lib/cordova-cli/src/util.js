
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
var fs         = require('fs'),
    path       = require('path'),
    shell      = require('shelljs');

var lib_path = path.join(__dirname, '..', 'lib')

function chmod(path) {
    shell.exec('chmod +x "' + path + '"', {silent:true});
}

module.exports = {
    libDirectory:lib_path,
    // Runs up the directory chain looking for a .cordova directory.
    // IF it is found we are in a Cordova project.
    // If not.. we're not.
    isCordova: function isCordova(dir) {
        if (dir) {
            var contents = fs.readdirSync(dir);
            if (contents && contents.length && (contents.indexOf('.cordova') > -1)) {
                return dir;
            } else {
                var parent = path.join(dir, '..');
                if (parent && parent.length > 1) {
                    return isCordova(parent);
                } else return false;
            }
        } else return false;
    },
    // Recursively deletes .svn folders from a target path
    deleteSvnFolders:function(dir) {
        var contents = fs.readdirSync(dir);
        contents.forEach(function(entry) {
            var fullpath = path.join(dir, entry);
            if (fs.statSync(fullpath).isDirectory()) {
                if (entry == '.svn') {
                    shell.rm('-rf', fullpath);
                } else module.exports.deleteSvnFolders(fullpath);
            }
        });
    }
};
