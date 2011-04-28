/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import net.rim.device.api.system.ApplicationDescriptor;
import net.rim.device.api.system.ApplicationManager;
import net.rim.device.api.system.ApplicationManagerException;
import net.rim.device.api.system.CodeModuleManager;

import com.phonegap.util.ApplicationUtils;
import com.phonegap.util.Logger;

public class AudioControl {
    /**
     * Determines if the native voice notes recorder application is installed
     * on the device.
     * 
     * @return true if native voice notes recorder application is installed
     */
    public static boolean hasAudioRecorderApplication() {
        return ApplicationUtils.isModuleInstalled("net_rim_bb_voicenotesrecorder");
    }

    /**
     * Determines if the native voice notes recorder application is running in
     * the foreground.
     * 
     * @return true if native voice notes recorder application is running in
     *         foreground
     */
    public static boolean isAudioRecorderActive() {
        return ApplicationUtils.isApplicationInForeground("net_rim_bb_voicenotesrecorder");
    }
    
    /**
     * Launches the native audio recorder application.
     */
    public static void launchAudioRecorder() {
        int handle = CodeModuleManager.getModuleHandle("net_rim_bb_voicenotesrecorder");
        ApplicationDescriptor ad = CodeModuleManager.getApplicationDescriptors(handle)[0];
        ApplicationDescriptor ad2 = new ApplicationDescriptor(ad, null);
        try {
            ApplicationManager.getApplicationManager().runApplication(ad2, true);
        }
        catch (ApplicationManagerException e) {
            Logger.log(AudioControl.class.getName() + ": unable to launch net_rim_bb_voicenotesrecorder");
        }
    }
    
    /**
     * Closes the native audio recorder application.
     */
    public static void closeAudioRecorder() {
        if (!isAudioRecorderActive()) {
            return;
        }
        ApplicationUtils.injectEscKeyPress(1);
    }  
}
