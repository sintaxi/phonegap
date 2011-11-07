/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 * Copyright (c) 2011, Microsoft Corporation
 */

if (!PhoneGap.hasResource("compass")) {
PhoneGap.addResource("compass");

/**
 * This class provides access to device Compass data.
 * @constructor
 */
var Compass = function() {
    /**
     * The last known Compass position.
     */
    this.lastHeading = null;
	this.isCompassSupported = true; // default assumption
};

Compass.ERROR_MSG = ["Not running", "Starting", "", "Failed to start", "Not Supported"];

/**
 * Asynchronously aquires the current heading.
 *
 * @param {Function} successCallback The function to call when the heading data is available
 * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
 * @param {PositionOptions} options The options for getting the heading data such as timeout. (OPTIONAL)
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {

    // successCallback required
    if (typeof successCallback !== "function") {
        console.log("Compass Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Compass Error: errorCallback is not a function");
        //return;
		
		errorCallback = function(){};
    }
	
	if(this.isCompassSupported)
	{	
		var self = this;
		var onSuccess = function(result)
		{
			//var compassResult = JSON.parse(result);
			console.log("compassResult = " + result);
			self.lastHeading = result;
			successCallback(self.lastHeading);
		}
		
		var onError = function(err)
		{
			if(err == 4)
			{
				self.isCompassSupported = false;	
			}
			errorCallback(err);
		}
	
		// Get heading
		PhoneGap.exec(onSuccess, onError, "Compass", "getHeading", []);
	}
	else
	{
		var funk = function()
		{
			errorCallback(4);
		};
		window.setTimeout(funk,0);
	}
};

/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 *
 * @param {Function} successCallback    The function to call each time the heading data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the heading data. (OPTIONAL)
 * @param {HeadingOptions} options      The options for getting the heading data such as timeout and the frequency of the watch. (OPTIONAL)
 * @return String                       The watch id that must be passed to #clearWatch to stop watching.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) {

    // Default interval (100 msec)
    var frequency = (options !== undefined) ? options.frequency : 100;

    // successCallback required
    if (typeof successCallback !== "function") {
        console.log("Compass Error: successCallback is not a function");
        return -1; // in case caller later calls clearWatch with this id
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Compass Error: errorCallback is not a function");
        return -1; // in case caller later calls clearWatch with this id
    }
	
	if(this.isCompassSupported)
	{	
		var self = this;
		var onInterval = function()
		{
			self.getCurrentHeading(successCallback,errorCallback,options);
		}
		return window.setInterval(onInterval,frequency);
	}
	else
	{
		var funk = function()
		{
			errorCallback(4);
		};
		window.setTimeout(funk,0);
		return -1;
	}
};


/**
 * Clears the specified heading watch.
 *
 * @param {String} id       The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(id) {

    // Stop javascript timer
	clearInterval(id);

};

PhoneGap.addConstructor(
function()
{
    if (!navigator.compass) 
	{
        navigator.compass = new Compass();
    }
});
}
