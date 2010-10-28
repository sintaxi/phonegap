/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.util;

import java.util.Date;

import net.rim.device.api.i18n.SimpleDateFormat;
import net.rim.device.api.system.EventLogger;

/**
 * Logger provides a mechanism to log the the Blackberry Event Log.  It uses
 * the Blackberry EventLogger class.  
 * 
 * The Event Log can be viewed on Blackberry simulators using Tools > Show Event
 * Log, or on physical devices by pressing the <code>Alt</code> key, followed by
 * the <code>LGLG</code> key combination.
 * 
 * To enable event logging, you must first call <code>enableLogging</code>.
 * 
 * Logger also provides methods to write to <code>System.out</code> and 
 * <code>System.err</code>.
 */
public class Logger {

	public static final String APP_NAME = "PhoneGap";
	public static final long GUID = 0x2ea3febe5da7e84bL; // "PhoneGap" as Long

	// Used to format dates into a standard format
	private static final SimpleDateFormat dateFormat = 
		new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
	
	public static void enableLogging() {
		if (EventLogger.register(GUID, APP_NAME, EventLogger.VIEWER_STRING)) {
		    log("Logger enabled.");
		}
		else {
			log("EventLogger registration failed.");
		}
	}

	/**
	 * Sets the minimum logging level.
	 */	
	public static void setMinimumLoggingLevel(int level) {
		EventLogger.setMinimumLevel(level);
	}

	/**
	 * Logs formatted message to Event Log with ALWAYS_LOG level.
	 */
	public static void log(String msg) {
		logEvent(msg, EventLogger.ALWAYS_LOG);
	}

	/**
	 * Logs formatted message to Event Log with DEBUG_INFO level.
	 */
	public static void debug(String msg) {
		logEvent(msg, EventLogger.DEBUG_INFO);
	}

	/**
	 * Logs formatted message to Event Log with INFORMATION level.
	 */
	public static void info(String msg) {
		logEvent(msg, EventLogger.INFORMATION);
	}

	/**
	 * Logs formatted message to Event Log with WARNING level.
	 */
	public static void warn(String msg) {
		logEvent(msg, EventLogger.WARNING);
	}

	/**
	 * Logs formatted message to Event Log with ERROR level.
	 */
	public static void error(String msg) {
		logEvent(msg, EventLogger.ERROR);
	}

	/**
	 * Logs formatted message to Event Log with SEVERE_ERROR level.
	 */
	public static void severe(String msg) {
		logEvent(msg, EventLogger.SEVERE_ERROR);
	}

	/**
	 * Prints unformatted message to System.out.
	 */
	public static void out(String msg) {
		System.out.println(msg);
	}

	/**
	 * Prints unformatted message to System.err.
	 */
	public static void err(String msg, Throwable t) {
		System.err.println(msg);
		t.printStackTrace();
	}

	/**
	 * Logs formatted message to Event Log (if enabled) and System.out.
	 */
	private static void logEvent(String msg, int level) {
		String message = formatMessage(msg);
		EventLogger.logEvent(GUID, message.getBytes(), level);
		out(message);
	}

	private static String formatMessage(String msg) {
		StringBuffer sb = new StringBuffer();
		sb.append(APP_NAME);
		sb.append(" [");
		sb.append(dateFormat.format(new Date()));
		sb.append("]: ");
		sb.append(msg);
		return sb.toString();
	}
}
