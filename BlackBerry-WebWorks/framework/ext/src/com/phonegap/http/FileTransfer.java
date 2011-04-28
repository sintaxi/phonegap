/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.http;

import java.io.IOException;

import net.rim.device.api.io.FileNotFoundException;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;
import com.phonegap.json4j.JSONObject;
import com.phonegap.util.Logger;

/**
 * The FileTransfer plugin can be used to transfer files between the device and 
 * a remote server.
 */
public class FileTransfer extends Plugin {

    /**
     * Error codes
     */
    public static int FILE_NOT_FOUND_ERR = 1;
    public static int INVALID_URL_ERR = 2;
    public static int CONNECTION_ERR = 3;
    
    /**
     * Possible actions
     */
    protected static final int ACTION_UPLOAD = 0;

    /**
     * Executes the requested action and returns a PluginResult.
     * 
     * @param action        The action to execute.
     * @param callbackId    The callback ID to be invoked upon action completion.
     * @param args          JSONArry of arguments for the action.
     * @return              A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {

        // perform specified action
        PluginResult result = null;
        int a = getAction(action);
        if (a == ACTION_UPLOAD) {
            try {
                // required parameters
                String filePath = args.getString(0);    
                String server = args.getString(1);

                // user parameters
                String fileKey = "file";
                String fileName = "image.jpg";
                String mimeType = null;
                JSONObject params = null;
                if(args.length() > 2 && !args.isNull(2)) {
                    fileKey = args.optString(2);
                }
                if(args.length() > 3 && !args.isNull(3)) {
                    fileName = args.optString(3);
                }
                if(args.length() > 4 && !args.isNull(4)) {
                    mimeType = args.optString(4);
                }
                if (args.length() > 5 && !args.isNull(5)) {
                    params = args.getJSONObject(5);    
                }

                FileUploader f = new FileUploader();
                FileUploadResult r = f.upload(filePath, server, fileKey, fileName, mimeType, params);
                result = new PluginResult(PluginResult.Status.OK, r.toJSONObject());
            } 
            catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(FILE_NOT_FOUND_ERR));
            } 
            catch (IllegalArgumentException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.MALFORMEDURLEXCEPTION,
                        Integer.toString(INVALID_URL_ERR));
            }
            catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(CONNECTION_ERR));
            } 
            catch (JSONException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
                        "Invalid or missing parameter");
            }
        } 
        else {
            // invalid action
            result = new PluginResult(PluginResult.Status.INVALIDACTION, 
                    "File: invalid action " + action);
        }
        
        return result;
    }
    
    /**
     * Returns action to perform.
     * @param action action to perform
     * @return action to perform
     */
    protected static int getAction(String action) {
        if ("upload".equals(action)) return ACTION_UPLOAD;
        return -1;
    }    
}
