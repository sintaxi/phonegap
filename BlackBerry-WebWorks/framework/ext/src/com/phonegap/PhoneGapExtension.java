/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap;

import net.rim.device.api.browser.field2.BrowserField;
import net.rim.device.api.script.ScriptEngine;
import net.rim.device.api.web.WidgetConfig;
import net.rim.device.api.web.WidgetExtension;

import org.w3c.dom.Document;

import com.phonegap.api.PluginManager;
import com.phonegap.api.PluginResult;
import com.phonegap.device.Device;
import com.phonegap.notification.Notification;
import com.phonegap.util.Log;
import com.phonegap.util.Logger;

/**
 * PhoneGapExtension is a BlackBerry WebWorks JavaScript extension.  It 
 * represents a single feature that can be used to access device capabilities. 
 */
public final class PhoneGapExtension implements WidgetExtension {

    // BrowserField object used to display the application
    //
    protected static BrowserField browser = null;
    
    // Browser script engine
    //
    protected static ScriptEngine script;

    // Application name
    //
    protected static String appName;

    // Application GUID
    //
    protected static long appID;

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
			scriptEngine.addExtension("phonegap.device",         new Device());
			scriptEngine.addExtension("phonegap.PluginManager",  new PluginManager(this));
			scriptEngine.addExtension("phonegap.Logger",         new Log());			
			
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
        browser = browserField;

        // grab widget application name and use it to generate a unique ID
        appName = widgetConfig.getName();
        appID = Long.parseLong(Math.abs(("com.phonegap."+appName).hashCode())+"",16);
        
        // create a notification profile for the application
        Notification.registerProfile();
    }

	// Called to clean up any features when the extension is unloaded
	//
	public void unloadFeatures(Document doc) {
		// TODO Auto-generated method stub
	}

	public static void invokeScript(String js) {
		script.executeScript(js, null);
	}
	
	/**
	 * Invokes the PhoneGap success callback specified by callbackId.
	 * @param callbackId   unique callback ID
	 * @param result       PhoneGap PluginResult containing result
	 */
	public static void invokeSuccessCallback(String callbackId, PluginResult result) {
		invokeScript(result.toSuccessCallbackString(callbackId));
	}

	/**
	 * Invokes the PhoneGap error callback specified by callbackId.
	 * @param callbackId   unique callback ID
	 * @param result       PhoneGap PluginResult containing result
	 */
	public static void invokeErrorCallback(String callbackId, PluginResult result) {
		invokeScript(result.toErrorCallbackString(callbackId));
	}
	
	/**
	 * Provides access to the browser instance for the application.
	 */
	public static BrowserField getBrowserField() {
	    return browser;
    }

    /**
     * Returns the widget application name.
     */
    public static String getAppName() {
        return appName;
    }

    /**
     * Returns unique ID of the widget application.
     */
    public static long getAppID() {
        return appID;
    }
}
