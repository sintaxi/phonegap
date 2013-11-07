var device = require('cordova/plugin/win7/device');

module.exports = {
    id: device.platform,
    initialize: function () {
        var channel = require("cordova/channel"),
            storage = require('cordova/plugin/win7/storage');

        // Inject a lsitener for the backbutton, and tell native to override the flag (true/false) when we have 1 or more, or 0, listeners
        var backButtonChannel = cordova.addDocumentEventHandler('backbutton', {
            onSubscribe: function () {
                if (this.numHandlers === 1) {
                    exec(null, null, "Platform", "backButtonEventOn", []);
                }
            },
            onUnsubscribe: function () {
                if (this.numHandlers === 0) {
                    exec(null, null, "Platform", "backButtonEventOff", []);
                }
            }
        });

        channel.onDestroy.subscribe(function () {
            // Remove session storage database 
            storage.removeDatabase(device.uuid);
        });

        if (typeof window.openDatabase == 'undefined') {
            window.openDatabase = storage.openDatabase;
        }

        if (typeof window.localStorage == 'undefined' || window.localStorage === null) {
            Object.defineProperty(window, "localStorage", {
                writable: false,
                configurable: false,
                value: new storage.WinStorage('CordovaLocalStorage')
            });
        }

        channel.join(function () {
            if (typeof window.sessionStorage == 'undefined' || window.sessionStorage === null) {
                Object.defineProperty(window, "sessionStorage", {
                    writable: false,
                    configurable: false,
                    value: new storage.WinStorage(device.uuid) // uuid is actually unique for application
                });
            }
        }, [channel.onCordovaInfoReady]);
    },
    objects: {
        device: {
            path: 'cordova/plugin/win7/device'
        },
        SQLError: {
            path: 'cordova/plugin/win7/SQLError'
        }
    }
};
