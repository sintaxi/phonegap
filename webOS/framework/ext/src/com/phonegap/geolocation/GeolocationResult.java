/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.geolocation;

import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONObject;
import com.phonegap.util.Logger;

/**
 * Extends PluginResult for the purposes of overriding the success and error 
 * callback invocations.
 */
public class GeolocationResult extends PluginResult {

	/**
	 * Constructor.
	 * @param status
	 */
	public GeolocationResult(Status status) {
		super(status);
	}
	
	/**
	 * Constructor.
	 * @param status
	 * @param message
	 */
	public GeolocationResult(Status status, String message) {
		super(status, message);
	}

	/**
	 * Constructor.
	 * @param status
	 * @param message
	 */
	public GeolocationResult(Status status, JSONObject message) {
		super(status, message);
	}

	/**
	 * Produces the invocation string for the specified geolocation success callback.
	 * @param callbackId callback identifier
	 */
	public String toSuccessCallbackString(String callbackId) {
		Logger.log(this.getClass().getName() + ": invoking success callback: " + callbackId + ", with args: " + this.getJSONString());
		return "try { navigator.geolocation.success('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in success callback:' + e.message); }";
	}
	
	/**
	 * Produces the invocation string for the specified geolocation error callback.
	 * @param callbackId callback identifier
	 */
	public String toErrorCallbackString(String callbackId) {
		return "try { navigator.geolocation.fail('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in error callback:' + e.message); }";
	}	
}
