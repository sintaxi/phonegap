/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.api;

import com.phonegap.json4j.JSONObject;

/**
 * This class defines the standard object that should be returned as the
 * result of any PhoneGap plugin invocation.
 */
public class PluginResult {

    private final int status;
    private final String message;
    private boolean keepCallback = false;

    public PluginResult(Status status) {
        this.status = status.ordinal();
        this.message = JSONObject.quote(status.getMessage());
    }

    public PluginResult(Status status, String message) {
        this.status = status.ordinal();
        this.message = JSONObject.quote(message);
    }

    public PluginResult(Status status, JSONObject message) {
        this.status = status.ordinal();
        this.message = (message != null) ? message.toString(): "null";
    }

    public PluginResult(Status status, int i) {
        this.status = status.ordinal();
        this.message = ""+i;
    }

    public PluginResult(Status status, float f) {
        this.status = status.ordinal();
        this.message = ""+f;
    }

    public PluginResult(Status status, boolean b) {
        this.status = status.ordinal();
        this.message = ""+b;
    }
    
    public PluginResult(Status status, long l) {
        this.status = status.ordinal();
        this.message = ""+l;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public void setKeepCallback(boolean b) {
        this.keepCallback = b;
    }

    public boolean getKeepCallback() {
        return this.keepCallback;
    }
    
    public String getJSONString() {
        return "{status:" + this.status + ",message:" + this.message + ",keepCallback:" + this.keepCallback + "}";
    }

    /**
     * Returns the JavaScript string that executes the success callback for the
     * appropriate PhoneGap plugin.  The string is intended to be passed to the  
     * JavaScript engine.
     * @param callbackId Unique id of the callback that is associated with the invoked plugin
     * @return JavaScript string that invokes the appropriate plugin success callback
     */
    public String toSuccessCallbackString(String callbackId) {
        return "try { PhoneGap.callbackSuccess('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in callbackSuccess:' + e.message); }";
    }

    /**
     * Returns the JavaScript string that executes the error callback for the
     * appropriate PhoneGap plugin.  The string is intended to be passed to the  
     * JavaScript engine.
     * @param callbackId Unique id of the callback that is associated with the invoked plugin
     * @return JavaScript string that invokes the appropriate plugin error callback
     */
    public String toErrorCallbackString(String callbackId) {
        return "try { PhoneGap.callbackError('"+callbackId+"', " + this.getJSONString() + "); } catch(e) { alert('error in callbackError:' + e.message); }";
    }

    public String toErrorString() {
        return "alert('general error');";
    }

    /**
     * Enumerates PluginResult status.
     */
    public static class Status
    {
        private int val;
        private String message;

        protected Status(int val, String message) {
            this.val = val;
            this.message = message;
        }

        public int ordinal() {
            return this.val;
        }

        public String getMessage() {
            return this.message;
        }

        public static final Status NO_RESULT = new Status(0, "No result");
        public static final Status OK = new Status(1, "OK");
        public static final Status CLASSNOTFOUNDEXCEPTION = new Status(2, "Class not found");
        public static final Status ILLEGALACCESSEXCEPTION = new Status(3, "Illegal access");
        public static final Status INSTANTIATIONEXCEPTION = new Status(4, "Instantiation error");
        public static final Status MALFORMEDURLEXCEPTION = new Status(5, "Malformed URL");
        public static final Status IOEXCEPTION = new Status(6, "IO error");
        public static final Status INVALIDACTION = new Status(7, "Invalid action");
        public static final Status JSONEXCEPTION = new Status(8, "JSON error");
        public static final Status ERROR = new Status(9, "Error");
        public static final Status ILLEGAL_ARGUMENT_EXCEPTION = new Status(10, "Illegal argument");
    }
}
