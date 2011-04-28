/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import java.util.Vector;

/**
 * Acts as a container for captured media files.  The media applications will 
 * add to the queue when a media file is captured.
 */
class MediaQueue {
    private Vector queue = new Vector();

    synchronized void add(final String filePath) {
        queue.addElement(filePath);
        notifyAll();
    }

    synchronized String remove() throws InterruptedException {
        while (queue.size() == 0) {
            wait();
        }
        String filePath = (String) queue.firstElement();
        queue.removeElement(filePath);
        notifyAll();
        return filePath;
    }
}
