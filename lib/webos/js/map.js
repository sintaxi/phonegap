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
 * This class provides access to native mapping applications on the device.
 */
function Map() {
	
};

/*
 * Shows a native map on the device with pins at the given positions.
 * @param {Array} positions
 */
Map.prototype.show = function(positions) {

	var jsonPos = {};
	var pos = null;
	if (typeof positions == 'object') {
		// If positions is an array, then get the first only, since google's query
		// can't take more than one marker (believe it or not).
		// Otherwise we assume its a single position object.
		if (positions.length) {
			pos = positions[0];
		} else {
			pos = positions;
		}
	} 
	else if (navigator.geolocation.lastPosition) {
		pos = navigator.geolocation.lastPosition;
	} else {
		// If we don't have a position, lets use nitobi!
		pos = { coords: { latitude: 49.28305, longitude: -123.10689 } };
	}

	this.service = navigator.service.Request('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
		id: 'com.palm.app.maps',
		params: {
			query: "@" + pos.coords.latitude + "," + pos.coords.longitude
			}
		}
	});

};

if (typeof navigator.map == "undefined") navigator.map = new Map();

