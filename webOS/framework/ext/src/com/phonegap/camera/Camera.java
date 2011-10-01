/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.camera;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.IOUtilities;
import net.rim.device.api.system.ApplicationDescriptor;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.ControlledAccessException;
import net.rim.device.api.system.EventInjector;
import net.rim.device.api.ui.UiApplication;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.util.Logger;

/**
 * The Camera plugin interface.
 *
 * The Camera class can invoke the following actions:
 *
 *   - takePicture: takes photo and returns base64 encoded image or image file URI
 *   
 *   future?
 *   - captureVideo...
 *
 */
public class Camera extends Plugin 
{
    /**
     * Possible actions.
     */
    public static final String ACTION_TAKE_PICTURE = "takePicture";
	
    /**
     * Destination type determines what result will be returned.
     */
    public static final int DATA_URL = 0;
    public static final int FILE_URI = 1;

    /**
     * Maximum image encoding size (in bytes) to allow.  (Obtained unofficially 
     * through trial and error). Anything larger will cause stability issues 
     * when sending back to the browser.
     */
    private static final long MAX_ENCODING_SIZE = 1500000L;
    
    /**
     * Executes the requested action and returns a PluginResult.
     * 
     * @param action The action to execute.
     * @param callbackId The callback ID to be invoked upon action completion
     * @param args   JSONArry of arguments for the action.
     * @return A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) 
    {
        PluginResult result = null;

        // take a picture
        if (action != null && action.equals(ACTION_TAKE_PICTURE)) 
        {
            /**
             * args JSONArray formatted as [ cameraArgs ], where cameraArgs:      
             *          [ 80,                                    // quality (ignored)
             *            Camera.DestinationType.DATA_URL,       // destinationType
             *            Camera.PictureSourceType.PHOTOLIBRARY  // sourceType (ignored)]
             */		    
            // determine the desired destination type: encoded image or file URI
            int destinationType = DATA_URL;
            if (args != null && args.length() > 1 && !args.isNull(1))
            {
                Integer destType = (Integer)args.opt(1);
                if (destType.intValue()== FILE_URI) 
                    destinationType = FILE_URI;
            }

            // launch native camera application
            launchCamera(new PhotoListener(destinationType, callbackId));

            // The native camera application runs in a separate process, so we 
            // must now wait for the listener to retrieve the photo taken. 
            // Return NO_RESULT status so plugin manager does not invoke a callback,
            // but keep the callback so the listener can invoke it later.
            result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
            return result;
        }
        else 
        {
            result = new PluginResult(PluginResult.Status.INVALIDACTION, "Camera: Invalid action:" + action);
        }

        return result;
    }
	
    /**
     * Launches the native camera application.
     */
    private static void launchCamera(PhotoListener listener)
    {
        // MMAPI interface doesn't use the native Camera application or interface
        // (we would have to replicate it).  So, we invoke the native Camera application,
        // which doesn't allow us to set any options.
        synchronized(UiApplication.getEventLock()) {
            UiApplication.getUiApplication().addFileSystemJournalListener(listener);
            Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
        }	    
    }

    /**
     * Closes the native camera application. 
     */
    public static void closeCamera() 
    {
        // simulate two escape characters to exit native camera application
        // no, there is no other way to do this
        UiApplication.getUiApplication().invokeLater(new Runnable() {
            public void run() {
                try 
                {
                    EventInjector.KeyEvent inject = new EventInjector.KeyEvent(
                            EventInjector.KeyEvent.KEY_DOWN, Characters.ESCAPE, 0);
                    inject.post();
                    inject.post();
                }
                catch (ControlledAccessException e) 
                {
                    // the application doesn't have key injection permissions
                    Logger.log(Camera.class.getName() + ": Unable to close camera.  " + 
                            ApplicationDescriptor.currentApplicationDescriptor().getName() + 
                            " does not have key injection permissions.");
                }
            }
        });
    }

    /**
     * Returns the image file URI or the Base64-encoded image.
     * @param filePath The full path of the image file
     * @param destinationType Specifies the format of the result
     * @param callbackId The id of the callback to receive the result
     */
    public static void processImage(String filePath, int destinationType, String callbackId)
    {
        Logger.log(Camera.class.getName() + ": processing image " + filePath);
        PluginResult result = null;
        try 
        {
            // wait for the file to be fully written to the file system
            // to avoid premature access to it (yes, this has happened)
            waitForImageFile(filePath);

            if (destinationType == Camera.FILE_URI) 
            {
                // return just the photo URI
                result = new PluginResult(PluginResult.Status.OK, filePath);
            }
            else 
            {
                String encodedImage = encodeImage(filePath);

                // we have to check the size to avoid memory errors in the browser
                if (encodedImage.length() > MAX_ENCODING_SIZE) 
                {
                    // it's a big one.  this is for your own good.
                    String msg = "Encoded image is too large.  Try reducing camera image size.";
                    Logger.log(Camera.class.getName() + ": " + msg);
                    result =  new PluginResult(PluginResult.Status.ERROR, msg);
                }
                else 
                {
                    result = new PluginResult(PluginResult.Status.OK, encodedImage);
                }
            }
        }
        catch (Exception e)
        {
            result = new PluginResult(PluginResult.Status.IOEXCEPTION, e.toString());
        }

        // send result back to JavaScript
        sendResult(result, callbackId);
    }
    
    /**
     * Waits for the image file to be fully written to the file system.
     * @param filePath     Full path of the image file
     * @throws IOException
     */
    private static void waitForImageFile(String filePath) throws IOException
    {
        long start = (new Date()).getTime();
        FileConnection fconn = null;
        try 
        {
            fconn = (FileConnection)Connector.open(filePath, Connector.READ);
            if (fconn.exists())
            {
                long fileSize = fconn.fileSize();
                long size = 0;
                while (true) 
                {
                    try { Thread.sleep(100); } catch (InterruptedException e) {} 
                    size = fconn.fileSize();
                    if (size == fileSize) {
                        break;
                    }
                    fileSize = size;
                }
                Logger.log(Camera.class.getName() + ": " + filePath + 
                    " size=" + Long.toString(fileSize) + " bytes");                
            }
        }
        finally 
        {
            if (fconn != null) fconn.close();
        }
        long end = (new Date()).getTime();
        Logger.log(Camera.class.getName() + ": wait time=" + Long.toString(end-start) + " ms");
    }

    /**
     * Opens the specified image file and converts its contents to a Base64-encoded string.
     * @param filePath     Full path of the image file
     * @return file contents as a Base64-encoded String 
     */
    private static String encodeImage(String filePath) throws IOException
    {
        String imageData = null;

        // open the image file
        FileConnection fconn = null;
        InputStream in = null;
        ByteArrayOutputStream byteArrayOS = null;
        try 
        {
            fconn = (FileConnection)Connector.open(filePath);
            if (fconn.exists()) 
            {
                // encode file contents using BASE64 encoding
                in = fconn.openInputStream();
                byteArrayOS = new ByteArrayOutputStream();
                Base64OutputStream base64OS = new Base64OutputStream(byteArrayOS);
                base64OS.write(IOUtilities.streamToBytes(in, 96*1024));
                base64OS.flush();
                base64OS.close(); 
                imageData = byteArrayOS.toString();

                Logger.log(Camera.class.getName() + ": Base64 encoding size=" +
                        Integer.toString(imageData.length()));
            }
        }
        finally 
        {
            if (in != null) in.close();
            if (fconn != null) fconn.close();
            if (byteArrayOS != null) byteArrayOS.close();
        }

        return imageData;
    }
    
    /**
     * Sends result back to JavaScript.
     * @param result PluginResult
     */
    private static void sendResult(PluginResult result, String callbackId) 
    {
        // invoke the appropriate callback
        if (result.getStatus() == PluginResult.Status.OK.ordinal())
        {
            success(result, callbackId);
        }
        else 
        {
            error(result, callbackId);
        }
    }
}
