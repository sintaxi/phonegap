var jsHandler = require('cordova/plugin/win7/jsHandler'),
    cordova = require('cordova');

module.exports = function exec(success, fail, service, action, args) {
    try {
        // Try JS implementation
        var v = jsHandler.exec(success, fail, service, action, args);

        // If status is OK, then return value back to caller
        if (v.status == cordova.callbackStatus.OK) {

            // If there is a success callback, then call it now with returned value
            if (success) {
                try {
                    success(v.message);
                }
                catch (e) {
                    console.log("Error in success callback: " + service + "." + action + " = " + e);
                }

            }
            return v.message;
        } else if (v.status == cordova.callbackStatus.NO_RESULT) {
            // Nothing to do here
        } else if (v.status == cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION) {
            // Try native implementation
            var callbackId = service + cordova.callbackId++;
            if (typeof success == 'function' || typeof fail == 'function') {
                cordova.callbacks[callbackId] = { success: success, fail: fail };
            }

            try {
                if (window.external) {
                    return window.external.CordovaExec(callbackId, service, action, JSON.stringify(args));
                }
                else {
                    console.log('window.external not available');
                }
            }
            catch (e) {
                console.log('Exception calling native with for ' + service + '/' + action + ' - exception = ' + e);
                // Clear callback
                delete cordova.callbacks[callbackId];
            }
        } else {
            // If error, then display error
            console.log("Error: " + service + "." + action + " Status=" + v.status + " Message=" + v.message);

            // If there is a fail callback, then call it now with returned value
            if (fail) {
                try {
                    fail(v.message);
                }
                catch (e) {
                    console.log("Error in error callback: " + service + "." + action + " = " + e);
                }
            }
            return null;
        }
    } catch (e) {
        console.log('Exception calling native with for ' + service + '/' + action + ' - exception = ' + e);
    }
};