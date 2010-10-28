/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
	this.started = false;
    this.lastPosition = null;
    this.lastError = null;
    this.callbacks = {
        onLocationChanged: [],
        onError:           []
    };
}

/**
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    var referenceTime = 0, timeout = 20000, interval = 500, delay = 0, dis = this, timer;
    if (this.lastPosition) {
        referenceTime = this.lastPosition.timeout;
    } else {
        this.start(options);
    }

    if (typeof(options) === 'object' && options.interval) {
        interval = options.interval;
    }

    if (typeof(successCallback) !== 'function') {
        successCallback = function() {};
    }
    if (typeof(errorCallback) !== 'function') {
        errorCallback = function() {};
    }

    timer = setInterval(function() {
        delay += interval;
        if (dis.lastPosition !== null && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) {
            errorCallback();
            clearInterval(timer);
        }
    }, interval);
};

/**
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
	var frequency = 10000, that = this;

	this.getCurrentPosition(successCallback, errorCallback, options);

    if (typeof(options) === 'object' && options.frequency) {
        frequency = options.frequency;
    }

	return setInterval(function() {
		that.getCurrentPosition(successCallback, errorCallback, options);
	}, frequency);
};


/**
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

/**
 * Called by the geolocation framework when the current location is found.
 * @param {PositionOptions} position The current position.
 */
Geolocation.prototype.setLocation = function(position) {
    var i = 0;
    this.lastPosition = position;
    for (; i < this.callbacks.onLocationChanged.length; i++) {
        this.callbacks.onLocationChanged.shift()(position);
    }
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Geolocation.prototype.setError = function(message) {
    var i = 0;
    this.lastError = message;
    for (; i < this.callbacks.onError.length; i++) {
        this.callbacks.onError.shift()(message);
    }
};

if (typeof navigator.geolocation === "undefined") { navigator.geolocation = new Geolocation(); }

/**
 * Starts the GPS of the device
 */
Geolocation.prototype.start = function() {
	if (this.started) {
		return;
	} else {
		PhoneGap.exec("location", ["start"]);
	}
};

/**
 * Stops the GPS of the device
 */
Geolocation.prototype.stop = function() {
	if (!this.started) {
		return;
	} else {
		PhoneGap.exec("location", ["stop"]);
	}
};

/**
 * Maps current location
 */
if (typeof navigator.map === "undefined") { navigator.map = {}; }

navigator.map.show = function() {
	if (navigator.geolocation.lastPosition === null) {
		alert("[PhoneGap] No position to map yet.");
		return;
	} else {
		PhoneGap.exec("location", ["map"]);
	}
};
