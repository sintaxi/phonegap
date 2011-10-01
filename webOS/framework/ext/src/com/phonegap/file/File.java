/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.file;

import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;

public class File {
    private String name = null;
    private String fullPath = null;
    private String type = null;
    private long lastModifiedDate; 
    private long size = 0;    
    
    public File(String filePath) {
        this.fullPath = filePath;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(long lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getFullPath() {
        return fullPath;
    }
    
    public JSONObject toJSONObject() {
        JSONObject o = new JSONObject();
        try {
            o.put("fullPath", fullPath);
            o.put("type", type);
            o.put("name", name);
            o.put("lastModifiedDate", lastModifiedDate);
            o.put("size", size);
        }
        catch (JSONException ignored) {
        }
        return o;
    }   
}
