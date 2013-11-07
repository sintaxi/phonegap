var channel = require('cordova/channel'),
    exec = require('cordova/exec');

function Device() {

    this.version = null;
    this.uuid = null;
    this.name = null;
    this.cordova = this.phonegap = '1.8.0';
    this.platform = null;

    var me = this;

    channel.onCordovaReady.subscribeOnce(function() {
        me.getInfo(function(info) {
            me.platform = info.platform;
            me.version = info.version;
            me.name = info.name;
            me.uuid = info.uuid;
            me.cordova = info.cordova;
            channel.onCordovaInfoReady.fire();
        },function(e) {
            console.log('Error initializing Cordova: ' + e);
        });
    });
};

Device.prototype.getInfo = function (successCallback, errorCallback) {

    // Get info
    exec(successCallback, errorCallback, 'Device', 'getDeviceInfo', []);
};

module.exports = new Device();