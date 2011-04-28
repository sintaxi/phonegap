/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import java.util.Enumeration;
import java.util.Vector;

import net.rim.device.api.system.ApplicationDescriptor;
import net.rim.device.api.system.ApplicationManager;
import net.rim.device.api.system.ApplicationManagerException;
import net.rim.device.api.system.CodeModuleManager;

import com.phonegap.util.Logger;

public class CaptureControl {    
    
    /**
     * Pending capture operations.
     */
    private Vector pendingOperations = new Vector();
            
    /**
     * Singleton.
     */
    private CaptureControl() {}
    
    /**
     * Holds the singleton for lazy instantiation.
     */
    private static class CaptureControlHolder {
        static final CaptureControl INSTANCE = new CaptureControl();
    }
    
    /**
     * Retrieves a CaptureControl instance.
     * @return CaptureControl instance.
     */
    public static final CaptureControl getCaptureControl() {
        return CaptureControlHolder.INSTANCE;
    }
    
    /**
     * Add capture operation so we can stop it manually.
     */
    public void addCaptureOperation(CaptureOperation operation) {
        if (operation == null) {
            return;
        }
        
        synchronized (pendingOperations) {
            pendingOperations.addElement(operation);
        }
    }
    
    /**
     * Remove capture operation.
     */
    public void removeCaptureOperation(CaptureOperation operation) {
        if (operation == null) {
            return;
        }
        
        synchronized (pendingOperations) {
            pendingOperations.removeElement(operation);
        }
    }
    
    /**
     * Starts an image capture operation, during which a user can take multiple
     * photos. The capture operation runs in the background. 
     * 
     * @param limit
     *            the maximum number of images to capture during the operation
     * @param callbackId
     *            the callback to be invoked with capture file properties
     */
    public void startImageCaptureOperation(int limit, String callbackId) {
        // setup a queue to receive image file paths
        MediaQueue queue = new MediaQueue();

        // start a capture operation on a background thread
        CaptureOperation operation = new ImageCaptureOperation(limit,
                callbackId, queue);

        // track the operation so we can stop or cancel it later
        addCaptureOperation(operation);
    }
    
    /**
     * Starts a video capture operation, during which a user can record multiple
     * recordings.  The capture operation runs in the background.
     * 
     * @param limit
     *            the maximum number of images to capture during the operation
     * @param callbackId
     *            the callback to be invoked with capture file properties
     */
    public void startVideoCaptureOperation(int limit, String callbackId) {
        // setup a queue to receive video recording file paths
        MediaQueue queue = new MediaQueue();
        
        // start a capture operation on a background thread
        CaptureOperation operation = new VideoCaptureOperation(limit,
                callbackId, queue);

        // track the operation so we can stop or cancel it later
        addCaptureOperation(operation);
    }

    /**
     * Starts an audio capture operation using the native voice notes recorder
     * application.
     * 
     * @param limit
     *            the maximum number of audio clips to capture during the
     *            operation
     * @param duration
     *            the maximum duration of each captured clip
     * @param callbackId
     *            the callback to be invoked with the capture results
     */
    public void startAudioCaptureOperation(int limit, long duration, String callbackId) {
        // setup a queue to receive recording file paths
        MediaQueue queue = new MediaQueue();
        
        // start a capture operation on a background thread
        CaptureOperation operation = new AudioCaptureOperation(limit, duration,
                callbackId, queue);

        // track the operation so we can stop or cancel it later
        addCaptureOperation(operation);
    }    
    
    /**
     * Stops all pending capture operations. If the <code>cancel</code>
     * parameter is <code>true</code>, no results will be sent via the callback
     * mechanism and any captured files will be removed from the file system.
     * 
     * @param cancel
     *            true if operations should be canceled
     */
    public void stopPendingOperations(boolean cancel) {
        // There are two scenarios where the capture operation would be stopped
        // manually:
        // 1- The user stops the capture application, and this application 
        //    returns to the foreground.
        // 2- It is canceled programmatically.  No results should be sent. 
        synchronized (pendingOperations) {
            for (Enumeration e = pendingOperations.elements(); e.hasMoreElements(); ) {
                CaptureOperation operation = (CaptureOperation) e.nextElement();
                if (cancel) {
                    operation.cancel();
                }
                else {
                    operation.stop();
                }
            }
        }
    }
}
