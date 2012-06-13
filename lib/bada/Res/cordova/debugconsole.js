/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * This class provides access to the debugging console.
 * @constructor
 */
function DebugConsole(isDeprecated) {
    this.logLevel = DebugConsole.INFO_LEVEL;
    this.isDeprecated = isDeprecated ? true : false;
}

// from most verbose, to least verbose
DebugConsole.ALL_LEVEL    = 1; // same as first level
DebugConsole.INFO_LEVEL   = 1;
DebugConsole.WARN_LEVEL   = 2;
DebugConsole.ERROR_LEVEL  = 4;
DebugConsole.NONE_LEVEL   = 8;
													
DebugConsole.prototype.setLevel = function(level) {
    this.logLevel = level;
}

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
DebugConsole.prototype.processMessage = function(message, maxDepth) {
	if (maxDepth === undefined) maxDepth = 0;
    if (typeof(message) != 'object') {
        return (this.isDeprecated ? "WARNING: debug object is deprecated, please use console object " + message : message);
    } else {
        /**
         * @function
         * @ignore
         */
        function indent(str) {
            return str.replace(/^/mg, "    ");
        }
        /**
         * @function
         * @ignore
         */
        function makeStructured(obj, depth) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object' && depth < maxDepth) {
                        str += i + ": " + indent(makeStructured(obj[i])) + "   ";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "   ";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "   ";
                }
            }
            return str;
        }
        
        return ((this.isDeprecated ? "WARNING: debug object is deprecated, please use console object   " :  "") + "Object: " + makeStructured(message, maxDepth));
    }
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message, maxDepth) {
    if (Cordova.available && this.logLevel <= DebugConsole.INFO_LEVEL)
        Cordova.exec(null, null, 'org.apache.cordova.DebugConsole', 'log',
            [this.processMessage(message, maxDepth), 'INFO']
        );
    else
        console.log(message);
};

/**
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message, maxDepth) {
    if (Cordova.available && this.logLevel <= DebugConsole.WARN_LEVEL)
        Cordova.exec(null, null, 'org.apache.cordova.DebugConsole', 'log',
            [this.processMessage(message, maxDepth), 'WARN']
        );
    else
        console.error(message);
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message, maxDepth) {
    if (Cordova.available && this.logLevel <= DebugConsole.ERROR_LEVEL)
        Cordova.exec(null, null, 'org.apache.cordova.DebugConsole', 'log',
            [this.processMessage(message, maxDepth), 'ERROR']
        );
    else
        console.error(message);
};

Cordova.addConstructor(function() {
    window.console = new DebugConsole();
    window.debug = new DebugConsole(true);
});
