/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.api;

import com.phonegap.PhoneGapExtension;
import com.phonegap.json4j.JSONArray;

/**
 * Plugin interface must be implemented by any plugin classes.
 *
 * The execute method is called by the PluginManager.
 */
public abstract class Plugin implements IPlugin {

    public PhoneGapExtension ctx;					// Main application object

	/**
	 * Executes the request and returns PluginResult.
	 * 
	 * @param action 		The action to execute.
	 * @param args 			JSONArry of arguments for the plugin.
	 * @param callbackId	The callback id used when calling back into JavaScript.
	 * @return 				A PluginResult object with a status and message.
	 */
	public abstract PluginResult execute(String action, JSONArray args, String callbackId);

	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		return false;
	}

	/**
	 * Sets the context of the Plugin. This can then be used to do things like
	 * get file paths associated with the Activity.
	 * 
	 * @param ctx The context of the main Activity.
	 */
	public void setContext(PhoneGapExtension ctx) {
		this.ctx = ctx;
	}
	
    /**
     * Called when Plugin is paused. 
     */
    public void onPause() {
    }

    /**
     * Called when Plugin is resumed. 
     */
    public void onResume() {
    }
    
    /**
     * Called when Plugin is destroyed. 
     */
    public void onDestroy() {
    }

    /**
     * Send generic JavaScript statement back to JavaScript.
     * success(...) and error(...) should be used instead where possible.
     * 
     * @param statement
     */
    public void invokeScript(String statement) {
    	PhoneGapExtension.invokeScript(statement);
    }

    /**
     * Call the JavaScript success callback for this plugin.
     * 
     * This can be used if the execute code for the plugin is asynchronous meaning
     * that execute should return null and the callback from the async operation can
     * call success(...) or error(...)
     * 
     * @param pluginResult		The result to return.
	 * @param callbackId		The callback id used when calling back into JavaScript.
     */
    public static void success(PluginResult pluginResult, String callbackId) {
    	PhoneGapExtension.invokeSuccessCallback(callbackId, pluginResult);
    }

    /**
     * Call the JavaScript error callback for this plugin.
     * 
     * @param pluginResult		The result to return.
	 * @param callbackId		The callback id used when calling back into JavaScript.
     */
    public static void error(PluginResult pluginResult, String callbackId) {
    	PhoneGapExtension.invokeErrorCallback(callbackId, pluginResult);
    }
}
