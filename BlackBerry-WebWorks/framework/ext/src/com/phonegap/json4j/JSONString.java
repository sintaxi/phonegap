/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j;

/**
 * An interface that can be implemented to make a 
 * particular object have an easy to use JSON representation.  Objects that implement this
 * can be inserted into JSONObject and JSONArray and serialized.
 */
public interface JSONString {
    /**
     * Method to return a JSON compliant representation of this object.
     * @return a JSON formatted string.
     */
    public String toJSONString();
}
