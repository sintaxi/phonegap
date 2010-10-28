/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.api;

import java.util.Hashtable;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import com.phonegap.PhoneGapExtension;
import com.phonegap.util.Logger;

import net.rim.device.api.script.ScriptableFunction;

/**
 * PluginManagerFunction represents a function that can be invoked from the 
 * script environment of the widget framework.  It manages the plugins for 
 * the PhoneGap widget extension. 
 *  
 * Calling phonegap.pluginManager.exec(...) from JavaScript will result in 
 * the invoke() method being called.
 */
public class PluginManagerFunction extends ScriptableFunction {
	
	private final static int ARG_SERVICE = 0;
	private final static int ARG_ACTION = 1;
	private final static int ARG_CALLBACK_ID = 2;
	private final static int ARG_ARGS = 3;
	private final static int ARG_ASYNC = 4;

	private Hashtable plugins = new Hashtable();
	private Hashtable services = new Hashtable();

	private final PhoneGapExtension app; 
	
	public PluginManagerFunction(PhoneGapExtension app) {
		this.app = app;
	}
	
	/**
	 * The invoke method is called when phonegap.pluginManager.exec(...) is  
	 * used from the script environment.  It instantiates the appropriate plugin
	 * and invokes the specified action.  JavaScript arguments are passed in 
	 * as an array of objects.
	 * 
  	 * @param service 		String containing the service to run
	 * @param action 		String containing the action that the service is supposed to perform. This is
	 * 						passed to the plugin execute method and it is up to the plugin developer 
	 * 						how to deal with it.
	 * @param callbackId 	String containing the id of the callback that is executed in JavaScript if
	 * 						this is an async plugin call.
	 * @param args 			An Array literal string containing any arguments needed in the
	 * 						plugin execute method.
	 * @param async 		Boolean indicating whether the calling JavaScript code is expecting an
	 * 						immediate return value. If true, either PhoneGap.callbackSuccess(...) or 
	 * 						PhoneGap.callbackError(...) is called once the plugin code has executed.
	 * 
	 * @return 				JSON encoded string with a response message and status.
	 * 
	 * @see net.rim.device.api.script.ScriptableFunction#invoke(java.lang.Object, java.lang.Object[])
	 */
	public Object invoke(Object obj, Object[] oargs) throws Exception {
		final String service = (String)oargs[ARG_SERVICE];
		final String action = (String)oargs[ARG_ACTION];
		final String callbackId = (String)oargs[ARG_CALLBACK_ID];
		boolean async = (oargs[ARG_ASYNC].toString().equals("true") ? true : false);
		PluginResult pr = null;
		
		try {
			// action arguments
			final JSONArray args = new JSONArray((String)oargs[ARG_ARGS]);
			
			// get the class for the specified service
			String clazz = getClassForService(service);
			Class c = null;
			if (clazz != null) {
				c = getClassByName(clazz); 
			}

			if (isPhoneGapPlugin(c)) {
				// Create a new instance of the plugin and set the context
				final Plugin plugin = this.addPlugin(clazz, c);
				async = async && !plugin.isSynch(action);
				if (async) {
					// Run this async on a background thread so that JavaScript can continue on
					Thread thread = new Thread(new Runnable() {
						public void run() {
							// Call execute on the plugin so that it can do it's thing
							final PluginResult result = plugin.execute(action, args, callbackId);
							
							if (result != null) {
								// Check if the 
								if (result.getStatus() == PluginResult.Status.OK.ordinal()) {
									PhoneGapExtension.invokeSuccessCallback(callbackId, result);
								} else {
									PhoneGapExtension.invokeErrorCallback(callbackId, result);
								}
							}
						}
					});
					thread.start();
					return "";
				} else {
					// Call execute on the plugin so that it can do it's thing
					pr = plugin.execute(action, args, callbackId);
				}
			}
		} catch (ClassNotFoundException e) {
			pr = new PluginResult(PluginResult.Status.CLASSNOTFOUNDEXCEPTION, "ClassNotFoundException: " + e.getMessage());
		} catch (IllegalAccessException e) {
			pr = new PluginResult(PluginResult.Status.ILLEGALACCESSEXCEPTION, "IllegalAccessException:" + e.getMessage());
		} catch (InstantiationException e) {
			pr = new PluginResult(PluginResult.Status.INSTANTIATIONEXCEPTION, "InstantiationException: " + e.getMessage());
		} catch (JSONException e) {
			pr = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
		} 
		// if async we have already returned at this point unless there was an error...
		if (async) {
			PhoneGapExtension.invokeErrorCallback(callbackId, pr);
		}
		return ( pr != null ? pr.getJSONString() : "{ status: 0, message: 'all good' }" );
	}
	
	/**
	 * Get the class.
	 * 
	 * @param clazz
	 * @return
	 * @throws ClassNotFoundException
	 */
	private Class getClassByName(final String clazz) throws ClassNotFoundException {
		return Class.forName(clazz);
	}
	
	/**
	 * Determines if the class implements com.phonegap.api.Plugin interface.
	 * 
	 * @param c The class to check.
	 * @return Boolean indicating if the class implements com.phonegap.api.Plugin
	 */
	private boolean isPhoneGapPlugin(Class c) {
		if (c != null) {
			return com.phonegap.api.Plugin.class.isAssignableFrom(c) || com.phonegap.api.IPlugin.class.isAssignableFrom(c);
		}
		return false;
	}
	
    /**
     * Add plugin to be loaded and cached.
     * If plugin is already created, then just return it.
     * 
     * @param className				The class to load
     * @return						The plugin
     */
	public Plugin addPlugin(String className, Class clazz) throws ClassNotFoundException, IllegalAccessException, InstantiationException {
    	if (this.plugins.containsKey(className)) {
    		return this.getPlugin(className);
    	}
    	Logger.log("PluginManager.addPlugin("+className+")");
        Plugin plugin = (Plugin)clazz.newInstance();
        this.plugins.put(className, plugin);
        plugin.setContext(this.app);
        return plugin;
    }
    
    /**
     * Get the loaded plugin.
     * 
     * @param className				The class of the loaded plugin.
     * @return
     */
    public Plugin getPlugin(String className) {
    	return (Plugin)this.plugins.get(className);
    }
    
    /**
     * Add a class that implements a service.
     * 
     * @param serviceType
     * @param className
     */
    public void addService(String serviceType, String className) {
    	this.services.put(serviceType, className);
    }
    
    /**
     * Get the class that implements a service.
     * 
     * @param serviceType
     * @return
     */
    public String getClassForService(String serviceType) {
    	return (String)this.services.get(serviceType);
    }
}
