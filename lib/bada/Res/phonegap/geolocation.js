
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {

    // The last known GPS position.
    this.lastPosition = null;
    this.id = null;
};

/**
 * Position error object
 *
 * @param code
 * @param message
 */
function PositionError(code, message) {
    this.code = code || 0;
    this.message = message || '';
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

/**
 * Asynchronously aquires the current position.
 *
 * @param {Function} successCallback    The function to call when the position data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the heading position. (OPTIONAL)
 * @param {PositionOptions} options     The options for getting the position data. (OPTIONAL)
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    this.id = PhoneGap.createUUID();
    // default maximumAge value should be 0, and set if positive 
    var maximumAge = 0;

    // default timeout value should be infinity, but that's a really long time
    var timeout = 3600000; 

    var enableHighAccuracy = false;
    if (options) {
        if (options.maximumAge && (options.maximumAge > 0)) {
            maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy) {
            enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout) {
            timeout = (options.timeout < 0) ? 0 : options.timeout;
        }
    }
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Geolocation", "getCurrentPosition", [maximumAge, timeout, enableHighAccuracy]);
}

/**
 * Asynchronously watches the geolocation for changes to geolocation.  When a change occurs,
 * the successCallback is called with the new location.
 *
 * @param {Function} successCallback    The function to call each time the location data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
 * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
 * @return String                       The watch id that must be passed to #clearWatch to stop watching.
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {

    // default maximumAge value should be 0, and set if positive 
    var maximumAge = 0;

    // DO NOT set timeout to a large value for watchPosition in BlackBerry.  
    // The interval used for updates is half the timeout value, so a large 
    // timeout value will mean a long wait for the first location.
    var timeout = 10000; 

    var enableHighAccuracy = false;
    if (options) {
        if (options.maximumAge && (options.maximumAge > 0)) {
            maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy) {
            enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout) {
            timeout = (options.timeout < 0) ? 0 : options.timeout;
        }
    }
    this.id = PhoneGap.createUUID();
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Geolocation", "watchPosition", [maximumAge, timeout, enableHighAccuracy]);
    return this.id;
};

/**
 * Clears the specified position watch.
 *
 * @param {String} id       The ID of the watch returned from #watchPosition
 */
Geolocation.prototype.clearWatch = function(id) {
    PhoneGap.exec(null, null, "com.phonegap.Geolocation", "stop", []);
    this.id = null;
};

/**
 * Force the PhoneGap geolocation to be used instead of built-in.
 */
Geolocation.usingPhoneGap = false;
Geolocation.usePhoneGap = function() {
    if (Geolocation.usingPhoneGap) {
        return;
    }
    Geolocation.usingPhoneGap = true;

    // Set built-in geolocation methods to our own implementations
    // (Cannot replace entire geolocation, but can replace individual methods)
    navigator.geolocation.getCurrentPosition = navigator._geo.getCurrentPosition;
    navigator.geolocation.watchPosition = navigator._geo.watchPosition;
    navigator.geolocation.clearWatch = navigator._geo.clearWatch;
    navigator.geolocation.success = navigator._geo.success;
    navigator.geolocation.fail = navigator._geo.fail;
};

PhoneGap.addConstructor(function() {
    navigator._geo = new Geolocation();

    // if no native geolocation object, use PhoneGap geolocation
    if (typeof navigator.geolocation == 'undefined') {
        navigator.geolocation = navigator._geo;
        Geolocation.usingPhoneGap = true;
    }
});
