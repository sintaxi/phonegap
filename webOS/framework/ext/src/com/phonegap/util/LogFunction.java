/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.util;

import net.rim.device.api.script.ScriptableFunction;

/**
 * LogFunction represents a function that can be invoked from the script 
 * environment of the widget framework.  Messages are logged to the Blackberry
 * Event Log.  From JavaScript, invoke
 * 
 * <code>phonegap.Logger.log(msg);</code>
 */
public class LogFunction extends ScriptableFunction {

    public Object invoke(Object obj, Object[] oargs) throws Exception {
        
    	if (oargs != null) {
    		String message = (String)oargs[0];
            Logger.log(message);    		
    	}
    	
        return null;
      }
}
