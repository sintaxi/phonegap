/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

import java.io.IOException;
import java.io.Writer;

public class JSON4JStringWriter extends Writer {

    public static int BUF_SIZE = 10000;

    private char[] _buffer = null;

    private int _mark = 0;

    public JSON4JStringWriter() {
        _buffer = new char[BUF_SIZE];
        _mark = 0;
    }

    public void close() throws IOException {
        return;
    }

    public void flush() throws IOException {
        return;
    }

    public void write(char[] cbuf, int off, int len) throws IOException {
        for (int x=0; x < len; x++) {
            _buffer[_mark] = cbuf[off+x];
            _mark++;
        }
        // MSN RESIZE THIS!!!
    }

    public String toString() {
        return new String(_buffer, 0, _mark);
    }
}
