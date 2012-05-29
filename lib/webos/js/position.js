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

function Position(coords) {
	this.coords = coords;
    this.timestamp = new Date().getTime();
};

function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
	/*
	 * The latitude of the position.
	 */
	this.latitude = lat;
	/*
	 * The longitude of the position,
	 */
	this.longitude = lng;
	/*
	 * The accuracy of the position.
	 */
	this.accuracy = acc;
	/*
	 * The altitude of the position.
	 */
	this.altitude = alt;
	/*
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/*
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
	/*
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (typeof(altacc) != 'undefined') ? altacc : null;
};

/*
 * This class specifies the options for requesting position data.
 * @constructor
 */
function PositionOptions() {
	/*
	 * Specifies the desired position accuracy.
	 */
	this.enableHighAccuracy = true;
	/*
	 * The timeout after which if position data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
};

/*
 * This class contains information about any GSP errors.
 * @constructor
 */
function PositionError() {
	this.code = null;
	this.message = "";
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

