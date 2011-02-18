/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.camera;

import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;
import net.rim.device.api.ui.UiApplication;

/**
 * Listens for photo added to file system and invokes the specified callback
 * with the result formatted according the specified destination type.
 */
public class PhotoListener implements FileSystemJournalListener {

    /**
     * Destination type determines the format of the result to be returned.
     */
    private int destinationType;
    
    /**
     * Callback to be invoked with the result.
     */
    private String callbackId;

    /**
     * Used to track file system changes.
     */
    private long lastUSN = 0;

    /**
     * Constructor.
     * @param destinationType Specifies the format of the result
     * @param callbackId      The id of the callback to receive the result
     */
    public PhotoListener(int destinationType, String callbackId)
    {
        this.destinationType = destinationType;
        this.callbackId = callbackId;
    }
    
    /**
     * Listens for file system changes.  When a JPEG file is added, we process 
     * it and send it back.
     */
    public void fileJournalChanged() 
    {
        // next sequence number file system will use
        long USN = FileSystemJournal.getNextUSN();

        for (long i = USN - 1; i >= lastUSN && i < USN; --i)
        {
            FileSystemJournalEntry entry = FileSystemJournal.getEntry(i);
            if (entry == null)
            {
                break;
            }

            if (entry.getEvent() == FileSystemJournalEntry.FILE_ADDED)
            {
                String path = entry.getPath();
                if (path != null && path.indexOf(".jpg") != -1)
                {                   
                    // we found a new JPEG file
                    // first, stop listening to avoid processing the file more than once
                    synchronized(UiApplication.getEventLock()) {
                        UiApplication.getUiApplication().removeFileSystemJournalListener(this);
                    }
                    
                    // process the image on a background thread to avoid clogging the event queue
                    final String filePath = "file://" + path;
                    Thread thread = new Thread(new Runnable() {
                        public void run() {
                            Camera.processImage(filePath, destinationType, callbackId);
                        }
                    });
                    thread.start();

                    // clean up
                    Camera.closeCamera();
                    
                    break;
                }
            }
        }

        // remember the file journal change number, 
        // so we don't search the same events again and again
        lastUSN = USN;
    }
}
