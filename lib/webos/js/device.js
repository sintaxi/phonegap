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
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.platform = "palm";
    this.version  = null;
    this.name     = null;
    this.uuid     = null;
    this.deviceInfo = null;
};

/*
 * A direct call to return device information.
 * Example:
 *		var deviceinfo = JSON.stringify(navigator.device.getDeviceInfo()).replace(/,/g, ', ');
 */
Device.prototype.getDeviceInfo = function() {
	return this.deviceInfo;//JSON.parse(PalmSystem.deviceInfo);
};

/*
 * needs to be invoked in a <script> nested within the <body> it tells WebOS that the app is ready
        TODO: see if we can get this added as in a document.write so that the user doesn't have to explicitly call this method
 * Dependencies: Mojo.onKeyUp
 * Example:
 *		navigator.device.deviceReady();
 */	
Device.prototype.deviceReady = function() {

	// tell webOS this app is ready to show
	if (window.PalmSystem) {
		// setup keystroke events for forward and back gestures
		document.body.addEventListener("keyup", Mojo.onKeyUp, true);

		setTimeout(function() { PalmSystem.stageReady(); PalmSystem.activate(); }, 1);
		alert = this.showBanner;
	}

    // fire deviceready event; taken straight from phonegap-iphone
    // put on a different stack so it always fires after DOMContentLoaded
    window.setTimeout(function () {
        var e = document.createEvent('Events');
        e.initEvent('deviceready');
        document.dispatchEvent(e);
    }, 10);
	
	this.setUUID();
	this.setDeviceInfo();
};

Device.prototype.setDeviceInfo = function() {
    var parsedData = JSON.parse(PalmSystem.deviceInfo);
    
    this.deviceInfo = parsedData;
    this.version = parsedData.platformVersion;
    this.name = parsedData.modelName;
};

Device.prototype.setUUID = function() {
	//this is the only system property webos provides (may change?)
	var that = this;
	this.service = navigator.service.Request('palm://com.palm.preferences/systemProperties', {
	    method:"Get",
	    parameters:{"key": "com.palm.properties.nduid" },
	    onSuccess: function(result) {
			that.uuid = result["com.palm.properties.nduid"];
		}
    });	


};


if (typeof window.device == 'undefined') window.device = navigator.device = new Device();

