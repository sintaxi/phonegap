package com.phonegap.api;

import org.json.me.JSONArray;

import com.phonegap.PhoneGap;

/**
 * Command interface must be implemented by any plugin classes.
 *
 * The execute method is called by the CommandManager.
 *
 * @author davejohnson
 *
 */
public interface PluginCommand {
	/**
	 * Executes the request and returns CommandResult.
	 * 
	 * @param action The command to execute.
	 * @param args JSONArry of arguments for the command.
	 * @return A CommandResult object with a status and message.
	 */
	CommandResult execute(String action, JSONArray args);
	
	/**
	 * Sets the context of the Command. This can then be used to do things like
	 * get file paths associated with the UiApplication.
	 * 
	 * @param app The context of the main UiApplication.
	 */
	void setContext(PhoneGap app);

	/**
	 * Sets the main View of the application, this is the WebView within which 
	 * a PhoneGap app runs.
	 * 
	 * @param webView The PhoneGap WebView
	 */
	//void setView(WebView webView);
}
