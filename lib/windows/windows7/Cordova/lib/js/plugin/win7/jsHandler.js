var cordova = require('cordova');

module.exports = {
    exec: function (successCallback, errorCallback, clazz, action, args) {
        try {
            var plugin = require('cordova/plugin/win7/' + clazz);

            if (plugin && typeof plugin[action] === 'function') {
                var result = plugin[action](successCallback, errorCallback, args);
                return result || { status: cordova.callbackStatus.NO_RESULT };
            }
            // action not found
            return { "status": cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message": "Function " + clazz + "::" + action + " cannot be found" };
        } catch (e) {
            // clazz not found
            return { "status": cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message": "Function " + clazz + "::" + action + " cannot be found" };
        }
    }
};