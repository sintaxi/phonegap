/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
function Acceleration(x, y, z, timestamp) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.timestamp = timestamp || new Date().getTime();
};

/**
 * Class provides access to device accelerometer data.
 * @constructor
 */
function Accelerometer() {

    /**
     * The last known acceleration.  type=Acceleration()
     */
    this.lastAcceleration = null;
    this.id = null;
};

/**
 * Asynchronously acquires the current acceleration.
 *
 * @param {Function} successCallback    The function to call when the acceleration data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
 * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
 */
Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {

    // successCallback required
    if (typeof successCallback != "function") {
        console.log("Accelerometer Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback != "function")) {
        console.log("Accelerometer Error: errorCallback is not a function");
        return;
    }

    // Get acceleration
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Accelerometer", "getCurrentAcceleration", []);
};

/**
 * Asynchronously acquires the device acceleration at a given interval.
 *
 * @param {Function} successCallback    The function to call each time the acceleration data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
 * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
 * @return String                       The watch id that must be passed to #clearWatch to stop watching.
 */
Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {

    // Default interval (10 sec)
    var frequency = (options != undefined) ? options.frequency : 10000;

    // successCallback required
    if (typeof successCallback != "function") {
        console.log("Accelerometer Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback != "function")) {
        console.log("Accelerometer Error: errorCallback is not a function");
        return;
    }
    // Start watch timer
    this.id = PhoneGap.createUUID();
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Accelerometer", "watchAcceleration", []);
    return this.id;
};

/**
 * Clears the specified accelerometer watch.
 *
 * @param {String} id The id of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(id) {

    // Stop javascript timer & remove from timer list
    if (id == this.id) {
        PhoneGap.exec(null, null, "com.phonegap.Accelerometer", "clearWatch", []);
    }
};

/*
 * Native callback when watchAcceleration has a new acceleration.
 */
Accelerometer.prototype.success = function(id, result) {
	try {
        var accel = new Acceleration(result.x, result.y, result.z, result.timestamp);
        navigator.accelerometer.lastAcceleration = accel;
        navigator.accelerometer.listeners[id].success(accel);
    }
    catch (e) {
        debugPrint("Geolocation Error: "+e.message);
        console.log("Geolocation Error: Error calling success callback function.");
    }

    if (id == "global") {
        delete navigator.accelerometer.listeners["global"];
    }
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();
});
