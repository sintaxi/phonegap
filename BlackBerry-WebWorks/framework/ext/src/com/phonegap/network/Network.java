/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.network;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;

/**
 * The Network command interface.
 *
 * The Network class can invoke the following actions:
 *
 *   - isReachable(domain, callback)
 *   - getConnectionInfo(callback)
 *
 */
public class Network extends Plugin {
	// Supported actions
	public static final String ACTION_IS_REACHABLE = "isReachable";
	public static final String ACTION_CONNECTION_INFO = "getConnectionInfo";

	private ConnectionInfoAction connectionInfo = new ConnectionInfoAction();

	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param callbackId The callback ID to be invoked upon action completion
	 * @param args   JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult result = null;
		
		if (action.equals(ACTION_IS_REACHABLE)) {
			result = IsReachableAction.execute(args);
		}
		else if (action.equals(ACTION_CONNECTION_INFO)) {
			result = connectionInfo.getConnectionInfo(callbackId);
		}
		else {
			result = new PluginResult(PluginResult.Status.INVALIDACTION, "Network: Invalid action: " + action);
		}
		
		return result;
	}

	/**
	 * Called when Plugin is destroyed.
	 */
	public void onDestroy() {
		connectionInfo.shutdown();
	}
}
