
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.accelerometer
 * 
 * Provides access to device accelerometer data.
 */
(function() {
    /**
     * Check that navigator.accelerometer has not been initialized.
     */
    if (typeof navigator.accelerometer !== "undefined") {
        return;
    }

    /**
     * Acceleration object has 3D coordinates and timestamp.
     */
    function Acceleration(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.timestamp = new Date().getTime();
    };
    
    /**
     * @constructor
     */
    function Accelerometer() {
        /**
         * The last known acceleration. type=Acceleration()
         */
        this.lastAcceleration = null;

        /**
         * List of accelerometer watch timers
         */
        this.timers = {};
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
        if (typeof successCallback !== "function") {
            console.log("Accelerometer Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console.log("Accelerometer Error: errorCallback is not a function");
            return;
        }

        // Get acceleration
        PhoneGap.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
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
        var frequency = (options != undefined)? options.frequency : 10000;

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

        // Make sure accelerometer timeout > frequency + 10 sec
        PhoneGap.exec(
                function(timeout) {
                    if (timeout < (frequency + 10000)) {
                        PhoneGap.exec(null, null, "Accelerometer", "setTimeout", [frequency + 10000]);
                    }
                },
                function(e) { }, "Accelerometer", "getTimeout", []);

        // Start watch timer
        var id = PhoneGap.createUUID();
        navigator.accelerometer.timers[id] = setInterval(function() {
            PhoneGap.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
        }, (frequency ? frequency : 1));

        return id;
    };

    /**
     * Clears the specified accelerometer watch.
     *
     * @param {String} id The id of the watch returned from #watchAcceleration.
     */
    Accelerometer.prototype.clearWatch = function(id) {
        // Stop timer & remove from timer list
        if (id && navigator.accelerometer.timers[id] != undefined) {
            clearInterval(navigator.accelerometer.timers[id]);
            delete navigator.accelerometer.timers[id];
        }
    };

    /**
     * Define navigator.accelerometer object.
     */
    PhoneGap.addConstructor(function() {
        navigator.accelerometer = new Accelerometer();
    });
}());
