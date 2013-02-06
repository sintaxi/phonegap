
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
var shell = require('shelljs'),
    util  = require('./util'),
    fs    = require('fs'),
    events= require('./events'),
    path  = require('path');

module.exports = function hooker(root) {
    var r = util.isCordova(root);
    if (!r) throw "Not a Cordova project, can't use hooks.";
    else this.root = r;
}

module.exports.prototype = {
    fire:function fire(hook) {
        var dir = path.join(this.root, '.cordova', 'hooks', hook);
        if (!(fs.existsSync(dir))) return true; // hooks directory got axed post-create; ignore.

        // Fire JS hook/event
        events.emit(hook);

        // Fire script-based hooks
        var contents = fs.readdirSync(dir);
        contents.forEach(function(script) {
            var fullpath = path.join(dir, script);
            if (fs.statSync(fullpath).isDirectory()) return; // skip directories if they're in there.
            var status = shell.exec(fullpath);
            if (status.code != 0) throw 'Script "' + path.basename(script) + '"' + 'in the ' + hook + ' hook exited with non-zero status code. Aborting.';
        });
        return true;
    }
}
