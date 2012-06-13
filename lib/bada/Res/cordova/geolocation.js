/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
    this.id = Cordova.createUUID();
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
    Cordova.exec(successCallback, errorCallback, "org.apache.cordova.Geolocation", "getCurrentPosition", [maximumAge, timeout, enableHighAccuracy]);
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
    this.id = Cordova.createUUID();
    Cordova.exec(successCallback, errorCallback, "org.apache.cordova.Geolocation", "watchPosition", [maximumAge, timeout, enableHighAccuracy]);
    return this.id;
};

/**
 * Clears the specified position watch.
 *
 * @param {String} id       The ID of the watch returned from #watchPosition
 */
Geolocation.prototype.clearWatch = function(id) {
    Cordova.exec(null, null, "org.apache.cordova.Geolocation", "stop", []);
    this.id = null;
};

/**
 * Force the Cordova geolocation to be used instead of built-in.
 */
Geolocation.usingCordova = false;
Geolocation.useCordova = function() {
    if (Geolocation.usingCordova) {
        return;
    }
    Geolocation.usingCordova = true;

    // Set built-in geolocation methods to our own implementations
    // (Cannot replace entire geolocation, but can replace individual methods)
    navigator.geolocation.getCurrentPosition = navigator._geo.getCurrentPosition;
    navigator.geolocation.watchPosition = navigator._geo.watchPosition;
    navigator.geolocation.clearWatch = navigator._geo.clearWatch;
    navigator.geolocation.success = navigator._geo.success;
    navigator.geolocation.fail = navigator._geo.fail;
};

Cordova.addConstructor(function() {
    navigator._geo = new Geolocation();

    // if no native geolocation object, use Cordova geolocation
    if (typeof navigator.geolocation == 'undefined') {
        navigator.geolocation = navigator._geo;
        Geolocation.usingCordova = true;
    }
});
