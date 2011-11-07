
/****************************** DEBUGCONSOLE ******************************/

/**
 * This class provides access to the debugging console.
 * @constructor
 */
function DebugConsole() {
}

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
DebugConsole.prototype.processMessage = function(message) {
    if (typeof(message) != 'object') {
        return message;
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
        function makeStructured(obj) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object') {
                        str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "\n";
                }
            }
            return str;
        }
        return "Object:\n" + makeStructured(message);
    }
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message) {
  if (PhoneGap.available) {
    PhoneGap.exec('DebugConsole;INFO;' + this.processMessage(message));
  }
};

DebugConsole.prototype.log = function(message) 
{
    if (PhoneGap.available && this.logLevel <= DebugConsole.INFO_LEVEL)
	{
        PhoneGap.exec(null, null, 'com.phonegap.debugconsole', 'log', message);
    }     
    else
	{
        this.winConsole.log(message);
	}
};

/**
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message) {
  if (PhoneGap.available) {
    PhoneGap.exec('DebugConsole;WARN;' + this.processMessage(message));
  }
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message) {
  if (PhoneGap.available) {
    PhoneGap.exec('DebugConsole;ERROR;' + this.processMessage(message));
  }
};

if (typeof window.debug == "undefined") {
  window.debug = new DebugConsole();
}
