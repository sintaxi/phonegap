/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

import java.io.IOException;
import java.io.Writer;

/**
 * Internaql class for handling the serialization of JSON objects in a verbose
 * format, meaning newlines and indention.
 */
public class SerializerVerbose extends Serializer {

    /**
     * Internal tracker keeping indent position.
     */
    private int indent = 0;

    /**
     * The indent string to use when serializing.
     */
    private String indentStr = "\t";

    /**
     * Constructor.
     */
    public SerializerVerbose(Writer writer) {
        super(writer);
    }

    /**
     * Constructor.
     * @param Writer The writer to serialize JSON to.
     * @param indentSpaces: How many spaces to indent by (0 to 8).  
     * The default indent is the TAB character. 
     */
    public SerializerVerbose(Writer writer, int indentSpaces) {
        super(writer);
        if(indentSpaces > 0 && indentSpaces < 8){
            this.indentStr = "";
            for(int i = 0; i < indentSpaces; i++){
                this.indentStr += " ";
            }
        }
    }

    /**
     * Method to write a space to the output writer.
     * @throws IOException Thrown if an error occurs during write.
     */
    public void space() throws IOException {
        writeRawString(" ");
    }

    /**
     * Method to write a newline to the output writer.
     * @throws IOException Thrown if an error occurs during write.
     */
    public void newLine() throws IOException {
        writeRawString("\n");
    }

    /**
     * Method to write an indent to the output writer.
     * @throws IOException Thrown if an error occurs during write.
     */
    public void indent() throws IOException {
        for (int i=0; i<indent; i++) writeRawString(this.indentStr);
    }

    /**
     * Method to increase the indent depth of the output writer.
     * @throws IOException Thrown if an error occurs during write.
     */
    public void indentPush() {
        indent++;
    }

    /**
     * Method to reduce the indent depth of the output writer.
     */
    public void indentPop() {
        indent--;
        if (indent < 0) throw new IllegalStateException();
    }
}
