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
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	this.started = false;
};

/*
 * Manually sets the orientation of the application window. 
 * 'up', 'down', 'left' or 'right' used to specify fixed window orientation
 * 'free' WebOS will change the window orientation to match the device orientation
 * @param {String} orientation
 * Example:
 *		navigator.orientation.setOrientation('up');
 */
Orientation.prototype.setOrientation = function(orientation) {
	PalmSystem.setWindowOrientation(orientation);   
};

/*
 * Returns the current window orientation
 */
Orientation.prototype.getCurrentOrientation = function() {
  	return PalmSystem.windowOrientation;
};

/*
 * Starts the native orientationchange event listener.
 */  
Orientation.prototype.start = function (successCallback) {
	var that = this;
	// This subscribes the callback once for the successCallback function
	that.callback = function (e) {
		document.removeEventListener("orientationChanged", that.callback);
		successCallback(e.orientation);
	}
	
	document.addEventListener("orientationChanged", that.callback);
	
	// This subscribes setOrientation to be constantly updating the currentOrientation property
	document.addEventListener("orientationchange", function(event) {
		var orient = null;
		switch (event.position) {
			case 0: orient = DisplayOrientation.FACE_UP; break;
			case 1: orient = DisplayOrientation.FACE_DOWN; break;
			case 2: orient = DisplayOrientation.PORTRAIT; break;
			case 3: orient = DisplayOrientation.REVERSE_PORTRAIT; break;
			case 4: orient = DisplayOrientation.LANDSCAPE_RIGHT_UP; break;
			case 5: orient = DisplayOrientation.LANDSCAPE_LEFT_UP; break;
			default: return; 	//orientationchange event seems to get thrown sometimes with a null event position
		}
		that.setOrientation(orient);
	});
	this.started = true;
};

/*
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */             
Orientation.prototype.watchOrientation = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentOrientation(successCallback, errorCallback);
	var interval = 1000;
	if (options && !isNaN(options.interval))
		interval = options.interval;
	var that = this;
	return setInterval(function() {
		that.getCurrentOrientation(successCallback, errorCallback);
	}, interval);
};
       
/*
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */     
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};
  
/*
 * This class encapsulates the possible orientation values.
 * @constructor
 */  
function DisplayOrientation() {
	this.code = null;
	this.message = "";
};

DisplayOrientation.PORTRAIT = 0;
DisplayOrientation.REVERSE_PORTRAIT = 1;
DisplayOrientation.LANDSCAPE_LEFT_UP = 2;
DisplayOrientation.LANDSCAPE_RIGHT_UP = 3;
DisplayOrientation.FACE_UP = 4;
DisplayOrientation.FACE_DOWN = 5;

if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();

