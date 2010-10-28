/**
 * This class provides access to device Compass data.
 * @constructor
 */
function Compass() {
    /**
     * The last known Compass position.
     */
	this.lastHeading = null;
    this.lastError = null;
	this.callbacks = {
		onHeadingChanged: [],
        onError:           []
    };
}

/**
 * Asynchronously aquires the current heading.
 * @param {Function} successCallback The function to call when the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {PositionOptions} options The options for getting the heading data
 * such as timeout.
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
	if (this.lastHeading === null) {
		this.start(options);
	}
	else 
	if (typeof successCallback === "function") {
		successCallback(this.lastHeading);
	}
};

/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	var frequency = 100, self;
	
	this.getCurrentHeading(successCallback, errorCallback, options);
    if (typeof(options) === 'object' && options.frequency) {
        frequency = options.frequency;
	}

	return setInterval(function() {
		self.getCurrentHeading(successCallback, errorCallback, options);
	}, frequency);
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};


/**
 * Called by the geolocation framework when the current heading is found.
 * @param {HeadingOptions} position The current heading.
 */
Compass.prototype.setHeading = function(heading) {
	var i = 0;
    this.lastHeading = heading;
    for (; i < this.callbacks.onHeadingChanged.length; i++) {
        this.callbacks.onHeadingChanged.shift()(heading);
    }
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Compass.prototype.setError = function(message) {
    var i = 0;
    this.lastError = message;
    for (; i < this.callbacks.onError.length; i++) {
        this.callbacks.onError.shift()(message);
    }
};

if (typeof navigator.compass === "undefined") { navigator.compass = new Compass(); }

Compass.prototype.start = function(args) {
    alert('Compass support not implemented - yet.');
};

Compass.prototype.stop = function() {
    alert('Compass support not implemented - yet.');
};
