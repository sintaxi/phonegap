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
 * Listens for video recording files that are added to file system.
 * <p>
 * Video recordings are added to the file system in a multi-step process. The
 * video recorder application records the video on a background thread. While
 * the recording is in progress, it is added to the file system with a '.lock'
 * extension. When the user stops the recording, the file is renamed to the
 * video recorder extension (e.g. .3GP). Therefore, we listen for the
 * <code>FileSystemJournalEntry.FILE_RENAMED</code> event, capturing when the
 * new path name ends in the video recording file extension.
 * <p>
 * The file system notifications will arrive on the application event thread.
 * When it receives a notification, it adds the image file path to a MediaQueue
 * so that the capture thread can process the file.
 */
class VideoCaptureListener implements FileSystemJournalListener {

    /**
     * Used to track file system changes.
     */
    private long lastUSN = 0;
    
    /**
     * Queue to send media files to for processing.
     */
    private MediaQueue queue = null;
    
    /**
     * Newly added video recording.
     */
    private String newFilePath = null;
    
    /**
     * Constructor.
     */
    VideoCaptureListener(MediaQueue queue) {
        this.queue = queue;
    }

    public void fileJournalChanged() {
        // next sequence number file system will use
        long USN = FileSystemJournal.getNextUSN();

        for (long i = USN - 1; i >= lastUSN && i < USN; --i)
        {
            FileSystemJournalEntry entry = FileSystemJournal.getEntry(i);
            if (entry == null)
            {
                break;
            }

            String path = entry.getPath();
            if (entry.getEvent() == FileSystemJournalEntry.FILE_ADDED
                    && newFilePath == null) {
                // a new file has been added to the file system
                // if it has a video recording extension, store it until
                // it is renamed, indicating it has finished being written to
                int index = path.indexOf(".3GP");
                if (index != -1) {
                    newFilePath = path.substring(0, index + 4);
                }
            }
            else if (entry.getEvent() == FileSystemJournalEntry.FILE_RENAMED) {
                if (path != null && path.equals(newFilePath))
                {                   
                    // add file path to the capture queue
                    queue.add("file://" + path);
                    
                    // get ready for next file
                    newFilePath = null;
                    break;
                }
            }
        }

        // remember the file journal change number, 
        // so we don't search the same events again and again
        lastUSN = USN;
    }
}
