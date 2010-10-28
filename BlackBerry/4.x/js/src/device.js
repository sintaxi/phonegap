/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = false;
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.phonegap = null;
    this.uuid     = null;
}

navigator.device = window.device = new Device();

Device.prototype.poll = function() {
    var cookie = document.cookie;
    if (cookie != '') {
        eval(cookie);
        PhoneGap.available = (typeof device.name === "string");
        if (PhoneGap.available) {
            PhoneGap.onNativeReady.fire();
        }
    }
    setTimeout(function() {
        device.poll();
    },250);
};

Device.prototype.init = function() {
    this.isIPhone = false;
    this.isIPod = false;
    this.isBlackBerry = true;
    try {
        PhoneGap.exec("initialize");
        this.poll();
    } catch(e) {
        alert("[PhoneGap Error] Error initializing.");
    }
};

window.device.init();