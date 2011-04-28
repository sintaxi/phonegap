/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */ 
package com.phonegap.media;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import javax.microedition.media.Manager;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.file.File;
import com.phonegap.json4j.JSONArray;
import com.phonegap.util.Logger;
import com.phonegap.util.StringUtils;

/**
 * This plugin provides the ability to capture media from the native media
 * applications. The appropriate media application is launched, and a capture
 * operation is started in the background to identify captured media files and
 * return the file info back to the caller.
 */
public class MediaCapture extends Plugin {

    public static String PROTOCOL_CAPTURE = "capture";

    /**
     * Error codes.
     */
    // Camera or microphone failed to capture image or sound. 
    private static final int CAPTURE_INTERNAL_ERR = 0;
    // Camera application or audio capture application is currently serving other capture request.
    private static final int CAPTURE_APPLICATION_BUSY = 1;
    // Invalid use of the API (e.g. limit parameter has value less than one).
    private static final int CAPTURE_INVALID_ARGUMENT = 2;
    // User exited camera application or audio capture application before capturing anything.
    private static final int CAPTURE_NO_MEDIA_FILES = 3;
    // The requested capture operation is not supported.
    private static final int CAPTURE_NOT_SUPPORTED = 20;
            
    /**
     * Possible actions.
     */
    protected static final int ACTION_GET_SUPPORTED_AUDIO_MODES = 0;
    protected static final int ACTION_GET_SUPPORTED_IMAGE_MODES = 1;
    protected static final int ACTION_GET_SUPPORTED_VIDEO_MODES = 2;
    protected static final int ACTION_CAPTURE_AUDIO = 3;
    protected static final int ACTION_CAPTURE_IMAGE = 4;
    protected static final int ACTION_CAPTURE_VIDEO = 5;
    protected static final int ACTION_CANCEL_CAPTURES = 6;

    /**
     * Executes the requested action and returns a PluginResult.
     * 
     * @param action
     *            The action to execute.
     * @param callbackId
     *            The callback ID to be invoked upon action completion
     * @param args
     *            JSONArry of arguments for the action.
     * @return A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {
        
        switch (getAction(action)) {
        case ACTION_GET_SUPPORTED_AUDIO_MODES:
            return getAudioCaptureModes();
        case ACTION_GET_SUPPORTED_IMAGE_MODES:
            return getImageCaptureModes();
        case ACTION_GET_SUPPORTED_VIDEO_MODES:
            return getVideoCaptureModes();
        case ACTION_CAPTURE_AUDIO:
            return captureAudio(args, callbackId);
        case ACTION_CAPTURE_IMAGE: 
            return captureImage(args, callbackId);
        case ACTION_CAPTURE_VIDEO:
            return captureVideo(args, callbackId);
        case ACTION_CANCEL_CAPTURES:
            CaptureControl.getCaptureControl().stopPendingOperations(true);
            return new PluginResult(PluginResult.Status.OK);
        }

        return new PluginResult(PluginResult.Status.INVALIDACTION,
                "MediaCapture: invalid action " + action);
    }

    /**
     * Determines if audio capture is supported.
     * @return <code>true</code> if audio capture is supported
     */
    protected boolean isAudioCaptureSupported() {
        return (System.getProperty("supports.audio.capture").equals(Boolean.TRUE.toString()) 
                && AudioControl.hasAudioRecorderApplication());
    }
    
    /**
     * Determines if video capture is supported.
     * @return <code>true</code> if video capture is supported
     */
    protected boolean isVideoCaptureSupported() {
        return (System.getProperty("supports.video.capture").equals(Boolean.TRUE.toString()));
    }
    
    /**
     * Retrieves supported audio capture modes (content types).
     * @return supported audio capture modes
     */
    protected PluginResult getAudioCaptureModes() {
        if (!isAudioCaptureSupported()) {
            // if audio capture is not supported, return an empty array
            // of capture modes
            Logger.log(this.getClass().getName() + ": audio capture not supported");
            return new PluginResult(PluginResult.Status.OK, "[]");
        }
                
        // get all supported capture content types
        String[] contentTypes = getCaptureContentTypes();
        
        // return audio content types only
        JSONArray modes = new JSONArray();
        for (int i = 0; i < contentTypes.length; i++) {
            if (contentTypes[i].startsWith(AudioCaptureOperation.CONTENT_TYPE)) {
                modes.add(new CaptureMode(contentTypes[i]).toJSONObject());
            }
        }
        
        return new PluginResult(PluginResult.Status.OK, modes.toString());
    }
    
    /**
     * Retrieves supported image capture modes (content type, width and height).
     * @return supported image capture modes
     */
    protected PluginResult getImageCaptureModes() {
        // get supported capture content types
        String[] contentTypes = getCaptureContentTypes();
        
        // need to get the recording dimensions from supported image encodings
        String imageEncodings = System.getProperty("video.snapshot.encodings");
        Logger.log(this.getClass().getName() + ": video.snapshot.encodings=" + imageEncodings);
        String[] encodings = StringUtils.split(imageEncodings, "encoding=");

        // find matching encodings and parse them for dimensions
        // it's so annoying that we have to do this
        CaptureMode mode = null;
        Vector list = new Vector();
        JSONArray modes = new JSONArray();
        for (int i = 0; i < contentTypes.length; i++) {
            if (contentTypes[i].startsWith(ImageCaptureOperation.CONTENT_TYPE)) {
                String type = contentTypes[i].substring(ImageCaptureOperation.CONTENT_TYPE.length());
                for (int j = 0; j < encodings.length; j++) {
                    // format: "jpeg&width=2592&height=1944 "
                    String enc = encodings[j];
                    if (enc.startsWith(type)) {
                        Hashtable parms = parseEncodingString(enc);
                        // "width=" 
                        String w = (String)parms.get("width");
                        long width = (w == null) ? 0 : Long.parseLong(w);
                        // "height=" 
                        String h = (String)parms.get("height");
                        long height = (h == null) ? 0 : Long.parseLong(h);
                        // new capture mode
                        mode = new CaptureMode(contentTypes[i], width, height); 
                        // don't want duplicates
                        if (!list.contains(mode)) {
                            list.addElement(mode);
                            modes.add(mode.toJSONObject());
                        }
                    }
                }
            }
        }
        
        return new PluginResult(PluginResult.Status.OK, modes.toString());        
    }
    
    /**
     * Retrieves supported video capture modes (content type, width and height).
     * @return supported video capture modes
     */
    protected PluginResult getVideoCaptureModes() {
        if (!isVideoCaptureSupported()) {
            // if the device does not support video capture, return an empty
            // array of capture modes
            Logger.log(this.getClass().getName() + ": video capture not supported");
            return new PluginResult(PluginResult.Status.OK, "[]");
        }
        
        /**
         * DOH! Even if video capture is supported, BlackBerry's API
         * does not provide any 'video/' content types for the 'capture' 
         * protocol.  So if we looked at only capture content types,
         * it wouldn't return any results...
         * 
         * // get all supported capture content types
         * String[] contentTypes = getCaptureContentTypes();
         * 
         * A better alternative, and probably not too inaccurate, would be to
         * send back all supported video modes (not just capture).  This will
         * at least give the developer an idea of the capabilities.
         */
        
        // retrieve ALL supported video encodings
        String videoEncodings = System.getProperty("video.encodings");
        Logger.log(this.getClass().getName() + ": video.encodings=" + videoEncodings);
        String[] encodings = StringUtils.split(videoEncodings, "encoding=");

        // parse them into CaptureModes
        JSONArray modes = new JSONArray();
        String enc = null;
        CaptureMode mode = null;
        Vector list = new Vector();
        for (int i = 0; i < encodings.length; i++) {
            enc = encodings[i];
            // format: "video/3gpp&width=640&height=480&video_codec=MPEG-4&audio_codec=AAC "
            if (enc.startsWith(VideoCaptureOperation.CONTENT_TYPE)) {
                Hashtable parms = parseEncodingString(enc);
                // type "video/3gpp"
                String t = (String)parms.get("type");
                // "width=" 
                String w = (String)parms.get("width");
                long width = (w == null) ? 0 : Long.parseLong(w);
                // "height=" 
                String h = (String)parms.get("height");
                long height = (h == null) ? 0 : Long.parseLong(h);
                // new capture mode
                mode = new CaptureMode(t, width, height); 
                // don't want duplicates
                if (!list.contains(mode)) {
                    list.addElement(mode);
                    modes.add(mode.toJSONObject());
                }
            }
        }
        
        return new PluginResult(PluginResult.Status.OK, modes.toString());
    }
    
    /**
     * Utility method to parse encoding strings.
     * 
     * @param encodingString
     *            encoding string
     * @return Hashtable containing key:value pairs
     */
    protected Hashtable parseEncodingString(final String encodingString) {
        // format: "video/3gpp&width=640&height=480&video_codec=MPEG-4&audio_codec=AAC "
        Hashtable props = new Hashtable();
        String[] parms = StringUtils.split(encodingString, "&");
        props.put("type", parms[0]);
        for (int i = 0; i < parms.length; i++) {
            String parameter = parms[i];
            if (parameter.indexOf('=') != -1) {
                String[] pair = StringUtils.split(parameter, "=");
                props.put(pair[0].trim(), pair[1].trim());
            }
        }
        return props;
    }
     
    /**
     * Returns the content types supported for the <code>capture://</code>
     * protocol.
     * 
     * @return list of supported capture content types
     */
    protected static String[] getCaptureContentTypes() {
        // retrieve list of all content types supported for capture protocol
        return Manager.getSupportedContentTypes(PROTOCOL_CAPTURE);
    }
        
    /**
     * Starts an audio capture operation using the native voice notes recorder
     * application. If the native voice notes recorder application is already
     * running, the <code>CAPTURE_APPLICATION_BUSY</code> error is returned.
     * 
     * @param args
     *            capture options (e.g., limit)
     * @param callbackId
     *            the callback to be invoked with the capture results
     * @return PluginResult containing captured media file properties
     */
    protected PluginResult captureAudio(final JSONArray args, final String callbackId) {
        PluginResult result = null;
        
        // if audio is not being recorded, start audio capture
        if (!AudioControl.hasAudioRecorderApplication()) {
            Logger.log(this.getClass().getName()
                    + ": Audio recorder application is not installed.");
            result = new PluginResult(PluginResult.Status.ERROR,
                    CAPTURE_NOT_SUPPORTED);
        }
        else if (AudioControl.isAudioRecorderActive()) {
            Logger.log(this.getClass().getName()
                    + ": Audio recorder application is busy.");
            result = new PluginResult(PluginResult.Status.ERROR,
                    CAPTURE_APPLICATION_BUSY);
        }
        else {
            // optional parameters
            int limit = args.optInt(0, 1);
            long duration = args.optLong(1, 0);
            
            // start audio capture
            // start capture operation in the background
            CaptureControl.getCaptureControl().startAudioCaptureOperation(
                    limit, duration, callbackId);

            // return NO_RESULT and allow callbacks to be invoked later
            result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
        }
        
        return result;
    }

    /**
     * Starts an image capture operation using the native camera application. If
     * the native camera application is already running, the
     * <code>CAPTURE_APPLICATION_BUSY</code> error is returned.
     * 
     * @param args
     *            capture options (e.g., limit)
     * @param callbackId
     *            the callback to be invoked with the capture results
     * @return PluginResult containing captured media file properties
     */
    protected PluginResult captureImage(final JSONArray args,
            final String callbackId) {
        PluginResult result = null;

        if (CameraControl.isCameraActive()) {
            Logger.log(this.getClass().getName()
                    + ": Camera application is busy.");
            result = new PluginResult(PluginResult.Status.ERROR,
                    CAPTURE_APPLICATION_BUSY);
        }
        else {
            // optional parameters
            int limit = args.optInt(0, 1);

            // start capture operation in the background
            CaptureControl.getCaptureControl().startImageCaptureOperation(
                    limit, callbackId);

            // return NO_RESULT and allow callbacks to be invoked later
            result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
        }

        return result;
    }

    /**
     * Starts an video capture operation using the native video recorder
     * application. If the native video recorder application is already running,
     * the <code>CAPTURE_APPLICATION_BUSY</code> error is returned.
     * 
     * @param args
     *            capture options (e.g., limit)
     * @param callbackId
     *            the callback to be invoked with the capture results
     * @return PluginResult containing captured media file properties
     */
    protected PluginResult captureVideo(final JSONArray args,
            final String callbackId) {
        PluginResult result = null;

        if (!isVideoCaptureSupported()) {
            Logger.log(this.getClass().getName()
                    + ": Video capture is not supported.");
            result = new PluginResult(PluginResult.Status.ERROR,
                    CAPTURE_NOT_SUPPORTED);
        }
        else if (CameraControl.isVideoRecorderActive()) {
            Logger.log(this.getClass().getName()
                    + ": Video recorder application is busy.");
            result = new PluginResult(PluginResult.Status.ERROR,
                    CAPTURE_APPLICATION_BUSY);
        }
        else {
            // optional parameters
            int limit = args.optInt(0, 1);

            // start capture operation in the background
            CaptureControl.getCaptureControl().startVideoCaptureOperation(
                    limit, callbackId);

            // return NO_RESULT and allow callbacks to be invoked later
            result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
        }

        return result;
    }
    
    /**
     * Sends media capture result back to JavaScript.
     * 
     * @param mediaFiles
     *            list of File objects describing captured media files
     * @param callbackId
     *            the callback to receive the file descriptions
     */
    public static void captureSuccess(Vector mediaFiles, String callbackId) {
        PluginResult result = null;
        File file = null;

        JSONArray array = new JSONArray();
        for (Enumeration e = mediaFiles.elements(); e.hasMoreElements();) {
            file = (File) e.nextElement();
            array.add(file.toJSONObject());
        }

        // invoke the appropriate callback
        result = new PluginResult(PluginResult.Status.OK, array.toString());
        success(result, callbackId);
    }
    
    /**
     * Sends error back to JavaScript.
     * 
     * @param callbackId
     *            the callback to receive the error
     */
    public static void captureError(String callbackId) {
        error(new PluginResult(PluginResult.Status.ERROR,
                CAPTURE_NO_MEDIA_FILES), callbackId);
    }
        
    /**
     * Called when application is resumed.
     */
    public void onResume() {
        // We launch the native media applications for capture operations, which 
        // puts this application in the background.  This application will come
        // to the foreground when the user closes the native media application.  
        // So we close any running capture operations any time we resume.
        // 
        // It would be nice if we could catch the EVT_APP_FOREGROUND event that
        // is supposed to be triggered when the application comes to the 
        // foreground, but have not seen a way to do that on the Java side.
        // Unfortunately, we have to get notification from the JavaScript side,
        // which does get the event.  (Argh! Only BlackBerry.)
        //
        // In this case, we're just stopping the capture operations, not
        // canceling them.
        CaptureControl.getCaptureControl().stopPendingOperations(false);
    }

    /**
     * Invoked when this application terminates.
     */
    public void onDestroy() {
        CaptureControl.getCaptureControl().stopPendingOperations(true);
    }

    /**
     * Returns action to perform.
     * @param action 
     * @return action to perform
     */
    protected static int getAction(String action) {
        if ("getSupportedAudioModes".equals(action)) {
            return ACTION_GET_SUPPORTED_AUDIO_MODES;
        }
        if ("getSupportedImageModes".equals(action)) {
            return ACTION_GET_SUPPORTED_IMAGE_MODES;
        }
        if ("getSupportedVideoModes".equals(action)) {
            return ACTION_GET_SUPPORTED_VIDEO_MODES;
        }
        if ("captureAudio".equals(action)) {
            return ACTION_CAPTURE_AUDIO;
        }
        if ("captureImage".equals(action)) {
            return ACTION_CAPTURE_IMAGE;
        }
        if ("captureVideo".equals(action)) {
            return ACTION_CAPTURE_VIDEO;
        }
        if ("stopCaptures".equals(action)) {
            return ACTION_CANCEL_CAPTURES;
        }
        return -1;
    }   
}
