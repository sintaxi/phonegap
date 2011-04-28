/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.file;

import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;

public class Entry {

    private boolean isDirectory = false;
    private String name = null;  
    private String fullPath = null;

    public boolean isDirectory() {
        return isDirectory;
    }

    public void setDirectory(boolean isDirectory) {
        this.isDirectory = isDirectory;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }
    
    public JSONObject toJSONObject() {
        JSONObject o = new JSONObject();
        try {
            o.put("isDirectory", isDirectory);
            o.put("isFile", !isDirectory);
            o.put("name", name);
            o.put("fullPath", fullPath);
        }
        catch (JSONException ignored) {
        }
        return o;
    }
}
