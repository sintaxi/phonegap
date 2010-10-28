
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

    // Geolocation listeners
    this.listeners = {};
};

/**
 * Position error object
 *
 * @param code
 * @param message
 */
function PositionError(code, message) {
    this.code = code;
    this.message = message;
};

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

    var id = "global";
	if (navigator.geolocation.listeners[id]) {
        console.log("Geolocation Error: Still waiting for previous getCurrentPosition() request.");
        try {
            errorCallback(new PositionError(PositionError.TIMEOUT, "Geolocation Error: Still waiting for previous getCurrentPosition() request."));
        } catch (e) {
        }
        return;
    }

	var maximumAge = 10000;
    var enableHighAccuracy = false;
    var timeout = 10000;
    if (typeof options != "undefined") {
        if (typeof options.maximumAge != "undefined") {
            maximumAge = options.maximumAge;
        }
        if (typeof options.enableHighAccuracy != "undefined") {
            enableHighAccuracy = options.enableHighAccuracy;
        }
        if (typeof options.timeout != "undefined") {
            timeout = options.timeout;
        }
    }
    navigator.geolocation.listeners[id] = {"success" : successCallback, "fail" : errorCallback };
    PhoneGap.exec(null, errorCallback, "Geolocation", "getCurrentPosition", [id, maximumAge, timeout, enableHighAccuracy]);
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

	var maximumAge = 10000;
    var enableHighAccuracy = false;
    var timeout = 10000;
    if (typeof options != "undefined") {
        if (typeof options.maximumAge != "undefined") {
            maximumAge = options.maximumAge;
        }
        if (typeof options.enableHighAccuracy != "undefined") {
            enableHighAccuracy = options.enableHighAccuracy;
        }
        if (typeof options.timeout != "undefined") {
            timeout = options.timeout;
        }
    }
    var id = PhoneGap.createUUID();
    navigator.geolocation.listeners[id] = {"success" : successCallback, "fail" : errorCallback };
    PhoneGap.exec(null, errorCallback, "Geolocation", "watchPosition", [id, maximumAge, timeout, enableHighAccuracy]);
    return id;
};

/*
 * Native callback when watch position has a new position.
 */
Geolocation.prototype.success = function(id, result) {

	var p = result.message;
    var coords = new Coordinates(p.latitude, p.longitude, p.altitude, p.accuracy, p.heading, p.speed, p.alt_accuracy);
    var position = new Position(coords, p.timestamp);
	try {
        navigator.geolocation.lastPosition = position;
        navigator.geolocation.listeners[id].success(position);
    }
    catch (e) {
        console.log("Geolocation Error: Error calling success callback function.");
    }

    if (id == "global") {
        delete navigator.geolocation.listeners["global"];
    }
};

/**
 * Native callback when watch position has an error.
 *
 * @param {String} id       The ID of the watch
 * @param {Object} result   The result containing status and message
 */
Geolocation.prototype.fail = function(id, result) {
    var code = result.status;
    var msg = result.message;
	try {
        navigator.geolocation.listeners[id].fail(new PositionError(code, msg));
    }
    catch (e) {
        console.log("Geolocation Error: Error calling error callback function.");
    }
};

/**
 * Clears the specified position watch.
 *
 * @param {String} id       The ID of the watch returned from #watchPosition
 */
Geolocation.prototype.clearWatch = function(id) {
    PhoneGap.exec(null, null, "Geolocation", "stop", [id]);
    delete navigator.geolocation.listeners[id];
};

PhoneGap.addConstructor(function() {
	if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();
});
