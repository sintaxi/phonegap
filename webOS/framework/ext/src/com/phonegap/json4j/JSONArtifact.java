/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j;

import java.io.OutputStream;
import java.io.Writer;

/**
 * Interface class to define a set of generic APIs both JSONObject and JSONArray implement.
 * This is namely so that functions such as write, which are common between the two, can be easily
 * invoked without knowing the object type.
 */
public interface JSONArtifact
{
    /**
     * Write this object to the stream as JSON text in UTF-8 encoding.  Same as calling write(os,false);
     * Note that encoding is always written as UTF-8, as per JSON spec.
     * @param os The output stream to write data to.
     * @return The passed in OutputStream.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public OutputStream write(OutputStream os) throws JSONException;

    /**
     * Write this object to the stream as JSON text in UTF-8 encoding, specifying whether to use verbose (tab-indented) output or not.
     * Note that encoding is always written as UTF-8, as per JSON spec.
     * @param os The output stream to write data to.
     * @param verbose Whether or not to write the JSON text in a verbose format.  If true, will indent via tab.
     * @return The passed in OutputStream.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public OutputStream write(OutputStream os, boolean verbose) throws JSONException;

    /**
     * Write this object to the stream as JSON text in UTF-8 encoding, specifying how many spaces should be used for each indent.  
     * This is an alternate indent style to using tabs.
     * @param indentDepth How many spaces to use for each indent.  The value should be between one to eight.
     * Less than one means no indenting, greater than 8 and it will just use tab.
     * @return The passed in OutputStream.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public OutputStream write(OutputStream os, int indentDepth) throws JSONException;

    /**
     * Write this object to the writer as JSON text.  Same as calling write(writer,false);
     * @param writer The writer which to write the JSON text to.
     * @return The passed in writer.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public Writer write(Writer writer) throws JSONException;
    
    /**
     * Writer this object to the writer as JSON text, specifying whether to use verbose (tab-indented) output or not.
     * be used for each indent.  This is an alternate indent style to using tabs.
     * @param writer The writer which to write the JSON text to.
     * @return The passed in writer.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public Writer write(Writer writer, boolean verbose) throws JSONException;
    
    /**
     * Write this object to the writer as JSON text, specifying how many spaces should be used for each indent.  
     * This is an alternate indent style to using tabs.
     * @param writer The writer which to write the JSON text to.
     * @param indentDepth How many spaces to use for each indent.  The value should be between one to eight.
     * @return The passed in writer.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public Writer write(Writer writer, int indentDepth) throws JSONException;

    /**
     * Convert this object into a String of JSON text, specifying whether to use verbose (tab-indented) output or not.
     * @param verbose Whether or not to write in compressed format.
     * Less than one means no indenting, greater than 8 and it will just use tab.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public String write(boolean verbose) throws JSONException;
    
    /**
     * Convert this object into a String of JSON text, specifying how many spaces should be used for each indent.  
     * This is an alternate indent style to using tabs.
     * @param indentDepth How many spaces to use for each indent.  The value should be between one to eight.  
     * Less than one means no indenting, greater than 8 and it will just use tab.
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public String write(int indentDepth) throws JSONException;

    /**
     * Convert this object into a String of JSON text.  Same as write(false);
     *
     * @throws JSONException Thrown on errors during serialization.
     */
    public String write() throws JSONException;
}
