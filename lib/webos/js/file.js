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
 * This class provides generic read and write access to the mobile device file system.
 */
function File() {
	/**
	 * The data of a file.
	 */
	this.data = "";
	/**
	 * The name of the file.
	 */
	this.name = "";
};

/*
 * Reads a file from the mobile device. This function is asyncronous.
 * @param {String} fileName The name (including the path) to the file on the mobile device. 
 * The file name will likely be device dependant.
 * @param {Function} successCallback The function to call when the file is successfully read.
 * @param {Function} errorCallback The function to call when there is an error reading the file from the device.
 */
File.prototype.read = function(fileName, successCallback, errorCallback) {
	//Mojo has no file i/o yet, so we use an xhr. very limited
	var path = fileName;	//incomplete
	//Mojo.Log.error(path);
	navigator.debug.error(path);
	
	if (typeof successCallback != 'function')
		successCallback = function () {};
	if (typeof errorCallback != 'function')
		errorCallback = function () {};
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200 && xhr.responseText != null) {
				this.data = xhr.responseText;
				this.name = path;
				successCallback(this.data);
			} else {
				errorCallback({ name: xhr.status, message: "could not read file: " + path });
			}
		}
	};
	xhr.open("GET", path, true);
	xhr.send();
};

/*
 * Writes a file to the mobile device. 
 * @param {File} file The file to write to the device.
 */
File.prototype.write = function(file) {
	//Palm does not provide file i/o
};

if (typeof navigator.file == "undefined") navigator.file = new File();

