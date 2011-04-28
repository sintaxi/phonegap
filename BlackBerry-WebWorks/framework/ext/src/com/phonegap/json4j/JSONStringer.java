/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j;

import java.io.IOException;

import com.phonegap.json4j.internal.JSON4JStringWriter;

/**
 * This class implements a JSONSringer, a basic convenience subclass of JSONWriter to allow for
 * generating JSON strings quickly.   This class exists for API compatibility to other popular
 * JSON parsers.
 */
public class JSONStringer extends JSONWriter {

    public JSONStringer() {
        super(new JSON4JStringWriter());
    }

    /**
     * Return a string of the stringer contents.  This also terminates the
     * Stringer and it cannot be used again.  If any errors occur while trying to generate the JSON
     * it returns an empty string.
     */
    public String toString() {
        try {
            super.flush();
            super.close();
            return ((JSON4JStringWriter)writer).toString();
        } catch (Exception ex) {
            /* Squelch */
            return "";
        }
    }

    /**
     * Over-ride to do nothing for the stringer.  Only toString() terminates the stringer object.
     */
    public void close() throws IOException, IllegalStateException {
        // Do nothing.
    }
}
