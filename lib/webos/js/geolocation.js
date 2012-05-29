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

/*
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
    this.lastPosition = null;
    this.lastError = null;
    this.callbacks = {
        onLocationChanged: [],
        onError: []
    };
};

/*
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    /*
	var referenceTime = 0;
    if (this.lastPosition)
        referenceTime = this.lastPosition.timestamp;
    else
        this.start(options);
	*/

    var timeout = 20000;
    if (typeof(options) == 'object' && options.timeout)
    timeout = options.timeout;

    if (typeof(successCallback) != 'function')
    successCallback = function() {};
    if (typeof(errorCallback) != 'function')
    errorCallback = function() {};

    /*
    var dis = this;
    var delay = 0;
    var timer = setInterval(function() {
        delay += interval;
		
		//if we have a new position, call success and cancel the timer
        if (dis.lastPosition && typeof(dis.lastPosition) == 'object' && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) { //else if timeout has occured then call error and cancel the timer
            errorCallback();
            clearInterval(timer);
        }
		//else the interval gets called again
    }, interval);
	*/

    var responseTime;
    if (timeout <= 5000)
    responseTime = 1;
    else if (5000 < timeout <= 20000)
    responseTime = 2;
    else
    responseTime = 3;

    var timer = setTimeout(function() {
        errorCallback({
            message: "timeout"
        });
    },
    timeout);

    var startTime = (new Date()).getTime();

    var alias = this;

    // It may be that getCurrentPosition is less reliable than startTracking ... but
    // not sure if we want to be starting and stopping the tracker if we're not watching.
    //new Mojo.Service.Request('palm://com.palm.location', {
    navigator.service.Request('palm://com.palm.location', {
        method: "getCurrentPosition",
        parameters: {
            responseTime: responseTime
        },
        onSuccess: function(event) {
            alias.lastPosition = {
                coords: {
                    latitude: event.latitude,
                    longitude: event.longitude,
                    altitude: (event.altitude >= 0 ? event.altitude: null),
                    speed: (event.velocity >= 0 ? event.velocity: null),
                    heading: (event.heading >= 0 ? event.heading: null),
                    accuracy: (event.horizAccuracy >= 0 ? event.horizAccuracy: null),
                    altitudeAccuracy: (event.vertAccuracy >= 0 ? event.vertAccuracy: null)
                },
                timestamp: new Date().getTime()
            };

            var responseTime = alias.lastPosition.timestamp - startTime;
            if (responseTime <= timeout)
            {
                clearTimeout(timer);
                successCallback(alias.lastPosition);
            }
        },
        onFailure: function() {
            errorCallback();
        }
    });

};

/*
 * Asynchronously aquires the position repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout and the frequency of the watch.
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
    // Invoke the appropriate callback with a new Position object every time the implementation
    // determines that the position of the hosting device has changed.
    var frequency = 10000;
    if (typeof(options) == 'object' && options.frequency)
    frequency = options.frequency;

    this.start(options, errorCallback);

    var referenceTime = 0;
    if (this.lastPosition)
    referenceTime = this.lastPosition.timestamp;

    var alias = this;
    return setInterval(function() {
        // check if we have a new position, if so call our successcallback
        if (!alias.lastPosition)
        return;

        if (alias.lastPosition.timestamp > referenceTime)
        successCallback(alias.lastPosition);
    },
    frequency);
};


/*
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function(watchId) {
    clearInterval(watchId);
    this.stop();
};

Geolocation.prototype.start = function(options, errorCallback) {
    //options.timeout;
    //options.interval;
    if (typeof(errorCallback) != 'function')
    errorCallback = function() {};

    var that = this;
    var frequency = 10000;
    if (typeof(options) == 'object' && options.frequency)
    frequency = options.frequency;

    var responseTime;
    if (frequency <= 5000)
    responseTime = 1;
    else if (5000 < frequency <= 20000)
    responseTime = 2;
    else
    responseTime = 3;

    //location tracking does not support setting a custom interval :P
    this.trackingHandle = navigator.service.Request('palm://com.palm.location', {
        method: 'startTracking',
        parameters: {
            subscribe: true
        },
        onSuccess: function(event) {
            that.lastPosition = {
                coords: {
                    latitude: event.latitude,
                    longitude: event.longitude,
                    altitude: (event.altitude >= 0 ? event.altitude: null),
                    speed: (event.velocity >= 0 ? event.velocity: null),
                    heading: (event.heading >= 0 ? event.heading: null),
                    accuracy: (event.horizAccuracy >= 0 ? event.horizAccuracy: null),
                    altitudeAccuracy: (event.vertAccuracy >= 0 ? event.vertAccuracy: null)
                },
                timestamp: new Date().getTime()
            };
        },
        onFailure: function() {
            errorCallback();
        }
    });
};

Geolocation.prototype.stop = function() {
    this.trackingHandle.cancel();
};

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();

