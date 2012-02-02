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

if (!PhoneGap.hasResource("accelerometer")) 
{
PhoneGap.addResource("accelerometer");

/** @constructor */
var Acceleration = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.timestamp = new Date().getTime();
};

/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
var Accelerometer = function() {

    /**
     * The last known acceleration.  type=Acceleration()
     */
    this.lastAcceleration = null;

    /**
     * List of accelerometer watch timers
     */
    this.timers = {};
};

Accelerometer.ERROR_MSG = ["Not running", "Starting", "", "Failed to start"];

/**
 * Asynchronously aquires the current acceleration.
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
	
	var self = this;
	
	var onSuccess = function(result)
	{
		var accResult = JSON.parse(result);
		self.lastAcceleration = new Acceleration(accResult.x,accResult.y,accResult.z);
		successCallback(self.lastAcceleration);
	}
	
	var onError = function(err)
	{
		errorCallback(err);
	}

    // Get acceleration
    PhoneGap.exec(onSuccess, onError, "Accelerometer", "getAcceleration",options);
};


/**
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 *
 * @param {Function} successCallback    The function to call each time the acceleration data is available
 * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
 * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
 * @return String                       The watch id that must be passed to #clearWatch to stop watching.
 */
Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) 
{
	var self = this;
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
	
    var onSuccess = function (result) {
        var accResult = JSON.parse(result);
        self.lastAcceleration = new Acceleration(accResult.x, accResult.y, accResult.z);
        successCallback(self.lastAcceleration);
    }

    var onError = function (err) {
        errorCallback(err);
    }

    var id = PhoneGap.createUUID();

    var params = new Object();
    params.id = id;
    // Default interval (10 sec)
    params.frequency = (options && options.frequency) ? options.frequency : 10000;

    PhoneGap.exec(onSuccess, onError, "Accelerometer", "startWatch", params);

    return id; 
};

/**
 * Clears the specified accelerometer watch.
 *
 * @param {String} id       The id of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(id) {

    PhoneGap.exec(null, null, "Accelerometer", "stopWatch", { id: id });
};

PhoneGap.onPhoneGapInit.subscribeOnce(
function()
{
    if (!navigator.accelerometer) 
	{
        navigator.accelerometer = new Accelerometer();
    }
});
}
