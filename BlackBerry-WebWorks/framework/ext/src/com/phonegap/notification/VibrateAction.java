/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.notification;

import net.rim.device.api.system.Alert;

import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;

/**
 * Vibrate Action
 *
 * Vibrates the device for specified duration.
 */
public class VibrateAction {
	
	private static final int DEFAULT_DURATION = 1000;
	
	/**
	 * Vibrates the device for a given amount of time.
	 *
	 * @param args JSONArray formatted as [ duration ]
	 *             duration: specifies the vibration length in milliseconds (default: 1000).
	 * @return A PluginResult object with the success or failure state for vibrating the device.
	 */
	public static PluginResult execute(JSONArray args) {
		PluginResult result = null;
		
		if (Alert.isVibrateSupported()) {
			try {
				int duration = (args.length() >= 1) ? args.getInt(0) : DEFAULT_DURATION;
				
				Alert.startVibrate(duration); 
			}
			catch (JSONException e) {
				result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
			}
			
			result = new PluginResult(PluginResult.Status.OK, "OK");
		}
		else {
			result = new PluginResult(PluginResult.Status.ILLEGALACCESSEXCEPTION, "Vibrate not supported");
		}
		
		return result;
	}
}