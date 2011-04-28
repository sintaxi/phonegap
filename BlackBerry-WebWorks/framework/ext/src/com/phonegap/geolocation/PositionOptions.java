/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.geolocation;

import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;

public class PositionOptions {
	private static final int START_ARG_MAX_AGE = 1;
	private static final int START_ARG_TIMEOUT = 2;
	private static final int START_ARG_HIGH_ACCURACY = 3;
	
	public int maxAge;
	public int timeout;
	public boolean enableHighAccuracy;

	public static PositionOptions fromJSONArray(JSONArray args) throws NumberFormatException, JSONException {
		PositionOptions po = new PositionOptions();

		po.maxAge = Integer.parseInt(args.getString(START_ARG_MAX_AGE));
		po.timeout = Integer.parseInt(args.getString(START_ARG_TIMEOUT));
		po.enableHighAccuracy = args.getBoolean(START_ARG_HIGH_ACCURACY);

		return po;
	}
}
