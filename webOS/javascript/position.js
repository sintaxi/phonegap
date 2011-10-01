
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * This class contains position information.
 * @param {Object} lat The latitude of the position.
 * @param {Object} lng The longitude of the position.
 * @param {Object} alt The altitude of the position.
 * @param {Object} acc The accuracy of the position.
 * @param {Object} head The direction the device is moving at the position.
 * @param {Object} vel The velocity with which the device is moving at the position.
 * @param {Object} altacc The altitude accuracy of the position.
 */
function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
    this.latitude = lat;
    this.longitude = lng;
    this.accuracy = acc;
    this.altitude = alt;
    this.heading = head;
    this.speed = vel;
    this.altitudeAccuracy = (altacc != 'undefined') ? altacc : null;
};

function Position(coords, timestamp) {
    this.coords = coords;
    this.timestamp = timestamp;
};
