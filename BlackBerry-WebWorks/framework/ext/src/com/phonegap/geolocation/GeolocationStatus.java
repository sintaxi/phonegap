/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.geolocation;

import com.phonegap.api.PluginResult;

public class GeolocationStatus extends PluginResult.Status {

	protected GeolocationStatus(int status, String message) {
		super(status, message);
	}
	
	public static final GeolocationStatus GPS_NOT_AVAILABLE = new GeolocationStatus(101, "GPS not available");
	public static final GeolocationStatus GPS_OUT_OF_SERVICE = new GeolocationStatus(102, "GPS out of service");
	public static final GeolocationStatus GPS_TEMPORARILY_UNAVAILABLE = new GeolocationStatus(103, "GPS temporarily unavailable");
	public static final GeolocationStatus GPS_TIMEOUT = new GeolocationStatus(104, "GPS location acquisition timed out");
	public static final GeolocationStatus GPS_INTERUPTED_EXCEPTION = new GeolocationStatus(105, "GPS location acquisition interrupted");
	public static final GeolocationStatus GPS_INVALID_LOCATION = new GeolocationStatus(106, "GPS returned an invalid location");
	public static final GeolocationStatus GPS_ILLEGAL_ARGUMENT_EXCEPTION = new GeolocationStatus(107, "An illegal argument was passed to the location listener");
}
