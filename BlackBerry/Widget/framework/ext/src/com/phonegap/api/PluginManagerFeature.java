/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.api;

import com.phonegap.PhoneGapExtension;

import net.rim.device.api.script.Scriptable;

/**
 * PluginManagerFeature provides the plugin feature to the PhoneGap widget 
 * extension.  This feature is registered with the script engine as extension
 * <code>phonegap.PluginManager</code>.
 * 
 * This feature provides a single function, PluginManagerFunction, which 
 * represents a function that can be invoked from the script environment.  
 * To invoke the PluginManagerFunction from JavaScript, use 
 * <code>phonegap.PluginManager.exec(...)</code> 
 */
public final class PluginManagerFeature extends Scriptable {
	
	public static final String FIELD_EXEC = "exec";		
	private final PluginManagerFunction pluginManagerFunction;
	
	public PluginManagerFeature(PhoneGapExtension app) {
		this.pluginManagerFunction = new PluginManagerFunction(app);
        this.pluginManagerFunction.addService("Camera", "com.phonegap.camera.Camera");
        this.pluginManagerFunction.addService("Network Status", "com.phonegap.network.Network");
        this.pluginManagerFunction.addService("Notification", "com.phonegap.notification.Notification");
        this.pluginManagerFunction.addService("Accelerometer", "com.phonegap.accelerometer.Accelerometer");
        this.pluginManagerFunction.addService("Geolocation", "com.phonegap.geolocation.Geolocation");
	}
	
	/**
	 * When script environment calls phonegap.pluginManager.exec, ScriptEngine will invoke
	 * pluginManagerFunction.invoke.
	 */
	public Object getField(String name) throws Exception {
		if (name.equals(FIELD_EXEC)) {
			return this.pluginManagerFunction;
		}
		return super.getField(name);
	}
}