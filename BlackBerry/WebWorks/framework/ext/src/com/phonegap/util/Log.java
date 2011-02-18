/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.util;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.script.ScriptableFunction;

/**
 * Log provides a mechanism for JavaScript code to utilize the Event Log.
 * Log represents an object in the script engine that can be accessed from the
 * script environment using <code>phonegap.Logger</code>.  
 * 
 * Log provides a function, <code>log(msg)</code>, that logs messages to the 
 * BlackBerry Event Log as well as to System.out.
 * 
 * To use of the Blackberry Event Log from JavaScript, you must first 
 * invoke the <code>enable()</code> method:
 * 
 * <code>phonegap.Logger.enable();</code>
 * <code>phonegap.Logger.log(msg);</code>
 */
public final class Log extends Scriptable {

    /**
     * Field used to log messages.
     */
    public static final String FIELD_LOG = "log";

    /**
     * Field used to enable message logging.
     */
    public static final String FIELD_ENABLE = "enable";
	
    /**
     * Logs messages to the BlackBerry Event Log and to <code>System.out</code>.
     */
    public final LogFunction logFunction; // logs to the Event Log
	
    /**
     * Constructor.
     */
    public Log() {
        this.logFunction = new LogFunction();
    }

    /**
     * The following fields are supported from the script environment:
     * 
     *  <code>phonegap.Logger.enable</code> - Enables message logging.
     *  <code>phonegap.Logger.log</code> - Logs the specified message.
     */    
    public Object getField(String name) throws Exception {

        if (name.equals(FIELD_LOG)) {
            return this.logFunction;
	    } 
        else if (name.equals(FIELD_ENABLE)) {
            return new ScriptableFunction() {
                public Object invoke(Object obj, Object[] oargs) throws Exception {
                    Logger.enableLogging();
                    return null;
                }
            };
        }
        return super.getField(name);
    }
}
