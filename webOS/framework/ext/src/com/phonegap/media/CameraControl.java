/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.ui.UiApplication;

import com.phonegap.util.ApplicationUtils;

public class CameraControl {
    /**
     * Determines if the native camera application is running in the foreground.
     * 
     * @return true if native camera application is running in foreground
     */
    public static boolean isCameraActive() {
        return ApplicationUtils.isApplicationInForeground("net_rim_bb_camera");
    }

    /**
     * Determines if the native video recorder application is running in the
     * foreground.
     * 
     * @return true if native video recorder application is running in
     *         foreground
     */
    public static boolean isVideoRecorderActive() {
        return ApplicationUtils.isApplicationInForeground("net_rim_bb_videorecorder");
    }
        
    /**
     * Launches the native camera application.
     */
    public static void launchCamera() {
        synchronized(UiApplication.getEventLock()) {
            Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA,
                    new CameraArguments()); 
        }        
    }
    
    /**
     * Launches the native video recorder application.
     */
    public static void launchVideoRecorder() {
        synchronized(UiApplication.getEventLock()) {
            Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA,
                    new CameraArguments(CameraArguments.ARG_VIDEO_RECORDER)); 
        }        
    }
            
    /**
     * Closes the native camera application.
     */
    public static void closeCamera() {
        if (!isCameraActive()) {
            return;
        }
        ApplicationUtils.injectEscKeyPress(2);
    }
    
    /**
     * Closes the native video recorder application.
     */
    public static void closeVideoRecorder() {
        if (!isVideoRecorderActive()) {
            return;
        }
        ApplicationUtils.injectEscKeyPress(2);
    }  
}
