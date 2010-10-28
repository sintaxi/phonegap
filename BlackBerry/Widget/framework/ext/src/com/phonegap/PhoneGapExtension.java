/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap;

import org.w3c.dom.Document;

import com.phonegap.api.PluginManagerFeature;
import com.phonegap.api.PluginResult;
import com.phonegap.device.DeviceFeature;
import com.phonegap.util.LogFeature;
import com.phonegap.util.Logger;

import net.rim.device.api.browser.field2.BrowserField;
import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.web.WidgetConfig;
import net.rim.device.api.web.WidgetExtension;

public final class PhoneGapExtension implements WidgetExtension {

	protected static ScriptEngine script;
	
	// Called when the BlackBerry Widget references this extension for the first time.
	// It provides a list of feature IDs exposed by this extension.
	//
	public String[] getFeatureList() {
		String[] result = new String[1];
		result[0] = "phonegap";
		return result;
	}

	// Called whenever a widget loads a resource that requires a feature ID that is supplied
	// in the getFeatureList
	//
	public void loadFeature(String feature, String version, Document doc,
			ScriptEngine scriptEngine) throws Exception {
		
		script = scriptEngine;
		
		if (feature.equals("phonegap")) {
			scriptEngine.addExtension("phonegap.device",         new DeviceFeature());
			scriptEngine.addExtension("phonegap.PluginManager",  new PluginManagerFeature(this));
			scriptEngine.addExtension("phonegap.Logger",         new LogFeature());
			
			// let PhoneGap JavaScript know that extensions have been loaded
			// if this is premature, we at least set the _nativeReady flag to true
			// so that when the JS side is ready, it knows native side is too
			Logger.log(this.getClass().getName() + ": invoking PhoneGap.onNativeReady.fire()");
			scriptEngine.executeScript("try {PhoneGap.onNativeReady.fire();} catch(e) {_nativeReady = true;}", null);			
		}
	}

	// Called so that the extension can get a reference to the configuration or browser field object
	//
	public void register(WidgetConfig widgetConfig, BrowserField browserField) {
		// TODO Auto-generated method stub
	}

	// Called to clean up any features when the extension is unloaded
	//
	public void unloadFeatures(Document doc) {
		// TODO Auto-generated method stub

	}

	public static void invokeScript(String js) {
		script.executeScript(js, null);
	}
	
	public static void invokeSuccessCallback(String callbackId, PluginResult result) {
		invokeScript(result.toSuccessCallbackString(callbackId));
	}

	public static void invokeErrorCallback(String callbackId, PluginResult result) {
		invokeScript(result.toErrorCallbackString(callbackId));
	}
}
