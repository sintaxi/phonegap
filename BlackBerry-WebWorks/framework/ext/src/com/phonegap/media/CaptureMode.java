/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;

public class CaptureMode {
    
    private String mimeType = null;
    private long height = 0;
    private long width = 0;
    
    public CaptureMode() { 
    }
    
    public CaptureMode(String type) {
        this.mimeType = type;
    }
    
    public CaptureMode(String type, long width, long height) {
        this.mimeType = type;
        this.height = height;
        this.width = width;
    }

    public String getMimeType() {
        return mimeType;
    }

    public long getHeight() {
        return height;
    }

    public long getWidth() {
        return width;
    }
    
    public JSONObject toJSONObject() {
        JSONObject o = new JSONObject();
        try {
            o.put("type", getMimeType());
            o.put("height", getHeight());
            o.put("width", getWidth());
        }
        catch (JSONException ignored) {
        }
        return o;
    }    
    
    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof CaptureMode)) {
            return false;
        }
        CaptureMode cm = (CaptureMode)o;
        return ((mimeType == null ? cm.mimeType == null : 
            mimeType.equals(cm.mimeType)) 
            && (width == cm.width) 
            && (height == cm.height));
    }
    
    public int hashCode() {
        int hash = (mimeType != null ? mimeType.hashCode() : 19);
        hash = 37*hash + (int)width;
        hash = 37*hash + (int)height;
        return hash;
    }
}
