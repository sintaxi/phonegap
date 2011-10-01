/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

import java.io.IOException;
import java.io.Reader;

public class JSON4JStringReader extends Reader {

    private char[] _buf = null;
    private int _mark = 0;
    private int maxLength = 0;

    public JSON4JStringReader(String str) {
        _buf = str.toCharArray();
        maxLength = str.length();
        _mark = 0;
    }

    public void close() throws IOException {
        return;
    }

    public int read(char[] cbuf, int off, int len) throws IOException {
        if (_mark == (maxLength))
            return -1;

        int read = 0;
        for (int x=0; x<len; x++) {
            cbuf[x+off] = _buf[_mark];
            read++;
            _mark++;
            if (_mark == (maxLength))
                return read;
        }
        return read;
    }
}
