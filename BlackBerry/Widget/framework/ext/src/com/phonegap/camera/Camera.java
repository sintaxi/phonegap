/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.camera;

import org.json.me.JSONArray;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

/**
 * The Camera plugin interface.
 *
 * The Camera class can invoke the following actions:
 *
 *   - takePicture: takes photo and returns base64 encoded image or image file URI
 *   
 *   future?
 *   - captureVideo...
 *
 */
public class Camera extends Plugin 
{
	public static final String ACTION_TAKE_PICTURE = "takePicture";

	/**
	 * Executes the requested action and returns a PluginResult.
	 * 
	 * @param action The action to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the action.
	 * @return A PluginResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) 
	{
		PluginResult result = null;
		
		if (action != null && action.equals(ACTION_TAKE_PICTURE)) 
		{			
			result = new CapturePhotoAction(callbackId).execute(args);
		}
		else 
		{
			result = new PluginResult(PluginResult.Status.INVALIDACTION, "Camera: Invalid action:" + action);
		}
		
		return result;
	}	
}
