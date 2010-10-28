package com.phonegap.api;

import org.json.me.JSONArray;

import com.phonegap.PhoneGap;
import com.phonegap.api.impl.*;

/**
 * CommandManager is exposed to JavaScript in the PhoneGap WebView.
 * 
 * Calling native plugin code can be done by calling CommandManager.exec(...)
 * from JavaScript.
 * 
 * @author davejohnson
 *
 */
public final class CommandManager {
	private static final String EXCEPTION_PREFIX = "[PhoneGap] *ERROR* Exception executing command [";
	private static final String EXCEPTION_SUFFIX = "]: ";
	
	private Command[] commands;

	private final PhoneGap app;
	
	public CommandManager(PhoneGap app) {
		this.app = app;

		commands = new Command[11];
		commands[0] = new CameraCommand(app);
		commands[1] = new ContactsCommand();
		commands[2] = new NotificationCommand();
		commands[3] = new TelephonyCommand();
		commands[4] = new GeoLocationCommand(app);
		commands[5] = new DeviceCommand();	
		commands[6] = new MediaCommand();
		commands[7] = new NetworkCommand(app);
		commands[8] = new SMSCommand();
		commands[9] = new ExitCommand();
		commands[10] = new StoreCommand();
	}

	/**
	 * DEPRECATED
	 * Receives a request for execution and fulfills it as long as one of
	 * the configured {@link Command} can understand it. Command precedence
	 * is important (just one of them will be executed).
	 *
	 * @param instruction any API command
	 * @return JS code to execute by the client or null
	 */
	public String processInstruction(String instruction) {
		for (int index = 0; index < commands.length; index++) {
			Command command = (Command) commands[index]; 
			if (command.accept(instruction)) {
				try {
					return command.execute(instruction);
				} catch(Exception e) {
					System.out.println(EXCEPTION_PREFIX + instruction + EXCEPTION_SUFFIX + e.getMessage());
				}
			}
		}
		return null;
	}
	
	/**
	 * Receives a request for execution and fulfills it by finding the appropriate
	 * Java class and calling it's execute method.
	 * 
	 * CommandManager.exec can be used either synchronously or async. In either case, a JSON encoded 
	 * string is returned that will indicate if any errors have occurred when trying to find
	 * or execute the class denoted by the clazz argument.
	 * 
	 * @param clazz String containing the fully qualified class name. e.g. com.phonegap.FooBar
	 * @param action String containt the action that the class is supposed to perform. This is
	 * passed to the plugin execute method and it is up to the plugin developer 
	 * how to deal with it.
	 * @param callbackId String containing the id of the callback that is execute in JavaScript if
	 * this is an async plugin call.
	 * @param args An Array literal string containing any arguments needed in the
	 * plugin execute method.
	 * @param async Boolean indicating whether the calling JavaScript code is expecting an
	 * immediate return value. If true, either PhoneGap.callbackSuccess(...) or PhoneGap.callbackError(...)
	 * is called once the plugin code has executed.
	 * @return JSON encoded string with a response message and status.
	 */
	public String exec(final String clazz, final String action, final String callbackId, 
			final JSONArray args, final boolean async) {
		CommandResult cr = null;
		try {
			Class c = getClassByName(clazz);

			// Create a new instance of the plugin and set the context and webview
			final PluginCommand plugin = (PluginCommand)c.newInstance();
			plugin.setContext(this.app);
			//plugin.setView(this.app);

			if (async) {
				// Run this async on a background thread so that JavaScript can continue on
				Thread thread = new Thread() {
					public void run() {
						// Call execute on the plugin so that it can do it's thing
						final CommandResult cr = plugin.execute(action, args);
						// Run this async on the UI thread
						// Not sure if we really have to do this ...
						app.invokeLater(new Runnable() {
							public void run() {
								// Check if the 
								if (cr.getStatus() == 0) {
									app.loadUrl(cr.toSuccessCallbackString(callbackId));
								} else {
									app.loadUrl(cr.toErrorCallbackString(callbackId));
								}
							}
						});
					}
				};
				thread.start();
				return "";
			} else {
				// Call execute on the plugin so that it can do it's thing
				cr = plugin.execute(action, args);
			}
		} catch (ClassNotFoundException e) {
			cr = new CommandResult(CommandResult.Status.CLASS_NOT_FOUND_EXCEPTION);
		} catch (IllegalAccessException e) {
			cr = new CommandResult(CommandResult.Status.ILLEGAL_ACCESS_EXCEPTION);
		} catch (InstantiationException e) {
			cr = new CommandResult(CommandResult.Status.INSTANTIATION_EXCEPTION);
		}
		// if async we have already returned at this point unless there was an error...
		if (async) {
			app.loadUrl(cr.toErrorCallbackString(callbackId));
		}
		return ( cr != null ? cr.getMessage() : "{ status: 0, message: 'all good' }" );
	}
	
	public void stopXHR() {
		((NetworkCommand)commands[7]).stopXHR();
	}
	
	/**
	 * 
	 * 
	 * @param clazz
	 * @return
	 * @throws ClassNotFoundException
	 */
	private Class getClassByName(final String clazz) throws ClassNotFoundException {
		return Class.forName(clazz);
	}
}