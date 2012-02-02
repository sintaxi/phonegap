
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * This class contains position information.
 * @param {Object} lat
 * @param {Object} lng
 * @param {Object} acc
 * @param {Object} alt
 * @param {Object} altacc
 * @param {Object} head
 * @param {Object} vel
 * @constructor
 */
function Position(coords, timestamp) {
	this.coords = coords;
    this.timestamp = timestamp;
}

function PositionOptions(enableHighAccuracy, timeout, maximumAge, minimumAccuracy) {
    this.enableHighAccuracy = enableHighAccuracy || false;
    this.timeout = timeout || 10000000;
    this.maximumAge = maximumAge || 0;
    this.minimumAccuracy = minimumAccuracy || 10000000;
}

function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
	/**
	 * The latitude of the position.
	 */
	this.latitude = lat || 0;
	/**
	 * The longitude of the position,
	 */
	this.longitude = lng || 0;
	/**
	 * The accuracy of the position.
	 */
	this.accuracy = acc || 0;
	/**
	 * The altitude of the position.
	 */
	this.altitude = alt || 0;
	/**
	 * The direction the device is moving at the position.
	 */
	this.heading = head || 0;
	/**
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel || 0;
	/**
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (altacc != 'undefined') ? altacc : null; 
}
