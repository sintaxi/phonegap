/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

import java.io.IOException;
import java.io.Reader;

public class JSON4JPBackReader extends Reader {

    private Reader _reader = null;

    private int _lastChar = 0;

    public JSON4JPBackReader(Reader reader) {
        _reader = reader;
    }

    public void close() throws IOException {
        _reader.close();
    }

    public void unread(int c) {
    }

    public int read(char[] cbuf, int off, int len) throws IOException {
        cbuf[off] = (char)_lastChar;
        _reader.read(cbuf, off + 1, len -1);
        _lastChar = cbuf[off + len];
        return 0;
    }
}
