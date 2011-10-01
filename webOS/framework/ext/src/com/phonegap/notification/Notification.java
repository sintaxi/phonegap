/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.notification;

import net.rim.device.api.notification.NotificationsConstants;
import net.rim.device.api.notification.NotificationsManager;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;

/**
 * PhoneGap Notification plugin.
 *
 * The Notification plugin can invoke the following actions:
 *
 *   - alert(message, title, buttonLabel)
 *   - confirm(message, title, button1,button2,button3...)
 *   - beep(count)
 *   - vibration(duration)
 *
 */
public class Notification extends Plugin {
	
    /**
     * Possible actions
     */
	public static final int ACTION_ALERT   = 0;
	public static final int ACTION_BEEP    = 1;
	public static final int ACTION_CONFIRM = 2;
	public static final int ACTION_VIBRATE = 3;
	
	/**
	 * Creates a notification profile for the application on the device.  
	 * The application can trigger a notification event that will play the 
	 * profile.  The profile settings are set by the user.
	 */
	public static void registerProfile() {
	    // Register with the NotificationsManager to create a notification
	    // profile for this application and enable notifications to be 
	    // controlled by the user
	    Object object = new Object() {
	        private String appName = PhoneGapExtension.getAppName();
	        public String toString() {
	            return appName;
	        }
	    };
	    NotificationsManager.registerSource(
	        PhoneGapExtension.getAppID(), object, NotificationsConstants.IMPORTANT);	    
	}
	
	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The action to perform.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the specified action.
	 * @return A PluginResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult result = null;
		
		switch (getAction(action)) {
		case ACTION_ALERT: 
			result = AlertAction.execute(args);
			break;
		case ACTION_BEEP:
			result = BeepAction.execute(args);
			break;
		case ACTION_CONFIRM:
			result = ConfirmAction.execute(args);
			break;
		case ACTION_VIBRATE:
			result = VibrateAction.execute(args);
			break;
		default: 
			result = new PluginResult(PluginResult.Status.INVALIDACTION, 
					"Notification: Invalid action: " + action);
		}
		
		return result;
	}

	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
	    switch (getAction(action)) {
	    case ACTION_ALERT:
	    case ACTION_CONFIRM:
	        return false;
	    default:
	        return true;
	    }
	}
	
	/**
	 * Returns action to perform.
	 * @param action 
	 * @return action to perform
	 */
	protected static int getAction(String action) {
		if ("alert".equals(action)) return ACTION_ALERT;
		if ("beep".equals(action)) return ACTION_BEEP;
		if ("confirm".equals(action)) return ACTION_CONFIRM;
		if ("vibrate".equals(action)) return ACTION_VIBRATE; 
		return -1;
	}	
}
