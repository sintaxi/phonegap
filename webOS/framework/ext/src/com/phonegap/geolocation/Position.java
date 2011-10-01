/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.geolocation;

import javax.microedition.location.Location;

import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;

/**
 * Stores geo location variables.
 */
public class Position {

	private double _lat = 0;
    private double _lng = 0;
	private float altitude = 0;
	private float accuracy = 0;
	private float alt_accuracy = 0;
    private float heading = 0;
	private float velocity = 0;
	private long timestamp = 0;

	public Position(double lat, double lng, float altitude, float accuracy, float alt_accuracy, 
			float heading, float speed, long timestamp) {
		this._lat = lat;
		this._lng = lng;
		this.altitude = altitude;
		this.accuracy = accuracy;
		this.alt_accuracy = alt_accuracy;
		this.heading = heading;
		this.velocity = speed;
		this.timestamp = timestamp;
	}
	
	public static Position fromLocation(Location location) {
		double latitude = location.getQualifiedCoordinates().getLatitude();
        double longitude = location.getQualifiedCoordinates().getLongitude();
        float altitude = location.getQualifiedCoordinates().getAltitude();
        float accuracy = location.getQualifiedCoordinates().getHorizontalAccuracy();
        float alt_accuracy = location.getQualifiedCoordinates().getVerticalAccuracy();
        float heading = location.getCourse();
        float speed = location.getSpeed();
        long time = location.getTimestamp();

		return new Position(latitude, longitude, altitude, accuracy, alt_accuracy, heading, speed, time);
	}
	
    public double getLatitude() {
		return _lat;
	}

	public void setLatitude(double _lat) {
		this._lat = _lat;
	}

	public double getLongitude() {
		return _lng;
	}

	public void setLongitude(double _lng) {
		this._lng = _lng;
	}

	public float getAltitude() {
		return altitude;
	}

	public void setAltitude(float altitude) {
		this.altitude = altitude;
	}

	public float getAccuracy() {
		return accuracy;
	}

	public void setAccuracy(float accuracy) {
		this.accuracy = accuracy;
	}

	public float getAltitudeAccuracy() {
		return alt_accuracy;
	}

	public void setAltitudeAccuracy(float alt_accuracy) {
		this.alt_accuracy = alt_accuracy;
	}

	public float getHeading() {
		return heading;
	}

	public void setHeading(float heading) {
		this.heading = heading;
	}

	public float getVelocity() {
		return velocity;
	}

	public void setVelocity(float velocity) {
		this.velocity = velocity;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public JSONObject toJSONObject() throws JSONException {
		return new JSONObject("{latitude:" + String.valueOf(_lat) + ", longitude:" + String.valueOf(_lng) + ", altitude:" + altitude + ", accuracy:" + accuracy + ", heading:" + heading + ", speed:" + velocity + ", alt_accuracy:" + alt_accuracy + ", timestamp:" + timestamp + "}");
	}

}
