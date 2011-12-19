/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
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

PhoneGap.onPhoneGapInit.subscribeOnce(
function()
{
    if (!navigator.compass) 
	{
        navigator.compass = new Compass();
    }
});
}
