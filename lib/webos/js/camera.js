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
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
};

/*
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {

	var filename = "";

	if (typeof options != 'undefined' && typeof options.filename != 'undefined') {
		filename = options.filename;
	}	

	this.service = navigator.service.Request('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
		id: 'com.palm.app.camera',
		params: {
				appId: 'com.palm.app.camera',
				name: 'capture',
				sublaunch: true,
				filename: filename
			}
		},
		onSuccess: successCallback,
		onFailure: errorCallback
	});	
};

if (typeof navigator.camera == 'undefined') navigator.camera = new Camera();

