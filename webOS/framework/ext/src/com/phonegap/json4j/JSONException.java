/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j;

/**
 * Class that implements an exception type thrown by all JSON classes
 * as a common exception when JSON handling errors occur.
 */
public class JSONException extends Exception {

    private Throwable cause;

    /**
     * Constructor for JSON Exception
     * @param message The error that generated the exception.
     */
    public JSONException(String message) {
        super(message);
    }

    /**
     * Constructor for JSON Exception
     * @param t The exception that generated this exception.
     */
    public JSONException(Throwable t) {
        cause = t;
    }
    
    public void setCause(Throwable t) {
    	cause = t;
    } 

    /**
     * Method to get the underlying cause of the JSONException
     */
    public Throwable getCause() {
        return cause;
    }
}
