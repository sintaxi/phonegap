/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;

/**
 * Listens for image files that are added to file system.
 * <p>
 * The file system notifications will arrive on the application event thread.
 * When it receives a notification, it adds the image file path to a MediaQueue
 * so that the capture thread can process the file.
 */
class ImageCaptureListener implements FileSystemJournalListener {

    /**
     * Used to track file system changes.
     */
    private long lastUSN = 0;
    
    /**
     * Collection of media files.
     */
    private MediaQueue queue = null;
    
    /**
     * Constructor.
     */
    ImageCaptureListener(MediaQueue queue) {
        this.queue = queue;
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
                    // add file path to the capture queue
                    queue.add("file://" + path);
                    break;
                }
            }
        }

        // remember the file journal change number, 
        // so we don't search the same events again and again
        lastUSN = USN;
    }
}
