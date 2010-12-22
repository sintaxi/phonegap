/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.file;

import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.FileNotFoundException;
import net.rim.device.api.io.IOUtilities;
import net.rim.device.api.system.Application;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

public class FileManager extends Plugin {

    /**
     * File related errors.
     */
    public static int NOT_FOUND_ERR = 1;
    public static int SECURITY_ERR = 2;
    public static int ABORT_ERR = 3;
    public static int NOT_READABLE_ERR = 4;
    public static int ENCODING_ERR = 5;
    public static int NO_MODIFICATION_ALLOWED_ERR = 6;
    public static int INVALID_STATE_ERR = 7;
    public static int SYNTAX_ERR = 8;
    public static int INVALID_MODIFICATION_ERR = 9;
    public static int QUOTA_EXCEEDED_ERR = 10;
    public static int TYPE_MISMATCH_ERR = 11;
    public static int PATH_EXISTS_ERR = 12;

    /**
     * Possible actions.
     */
    protected static final int ACTION_READ_AS_TEXT = 0;
    protected static final int ACTION_READ_AS_DATA_URL = 1;
    protected static final int ACTION_WRITE = 2;
    protected static final int ACTION_TRUNCATE = 3;
    
    public PluginResult execute(String action, JSONArray args, String callbackId) {

        // get parameters
        String filePath = null;
        try {
            filePath = args.getString(0);
        } catch (JSONException e) {
            Logger.log(this.getClass().getName() + ": " + e);
            return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
                    "Invalid or missing file parameter");
        }
        
        // perform specified action
        int a = getAction(action);
        if (a == ACTION_READ_AS_TEXT) {
            String result = null;
            try {
                result = readAsText(filePath, args.optString(1));
            } catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_FOUND_ERR));
            } catch (UnsupportedEncodingException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(ENCODING_ERR));
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_READABLE_ERR));            
            }
            return new PluginResult(PluginResult.Status.OK, result);
        }
        else if (a == ACTION_READ_AS_DATA_URL) {
            String result = null;
            try {
                result = readAsDataURL(filePath);
            } catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_FOUND_ERR));
            } catch (UnsupportedEncodingException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(ENCODING_ERR));
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_READABLE_ERR));            
            }
            return new PluginResult(PluginResult.Status.OK, result);
        }
        else if (a == ACTION_WRITE) {
            int bytesWritten = 0;
            try {
                // write file data
                int position = Integer.parseInt(args.optString(2));
                bytesWritten = writeFile(filePath, args.getString(1), position);
            } catch (JSONException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
                        "File data could not be retrieved.");
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NO_MODIFICATION_ALLOWED_ERR));
            } catch (NumberFormatException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.ILLEGAL_ARGUMENT_EXCEPTION, 
                        Integer.toString(SYNTAX_ERR));                
            }
            return new PluginResult(PluginResult.Status.OK, bytesWritten);
        }
        else if (a == ACTION_TRUNCATE) {
            long fileSize = 0;
            try {
                // retrieve new file size
                long size = Long.parseLong(args.getString(1));
                fileSize = truncateFile(filePath, size);
            } catch (JSONException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.JSONEXCEPTION, 
                        "File size must be a number.");
            } catch (FileNotFoundException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NOT_FOUND_ERR));
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.IOEXCEPTION, 
                        Integer.toString(NO_MODIFICATION_ALLOWED_ERR));
            } catch (NumberFormatException e) {
                Logger.log(this.getClass().getName() + ": " + e);
                return new PluginResult(PluginResult.Status.ILLEGAL_ARGUMENT_EXCEPTION, 
                        Integer.toString(SYNTAX_ERR));                
            }
            return new PluginResult(PluginResult.Status.OK, fileSize);
        }

        // invalid action
        return new PluginResult(PluginResult.Status.INVALIDACTION, 
                "File: invalid action " + action);
    }
    
    /**
     * Reads a file and encodes the contents using the specified encoding.
     * @param filePath  Full path of the file to be read
     * @param encoding  Encoding to use for the file contents
     * @return String containing encoded file contents
     */
    protected String readAsText(String filePath, String encoding) throws FileNotFoundException, UnsupportedEncodingException, IOException {
        // read the file
        byte[] blob = readFile(filePath);
        
        // return encoded file contents
        Logger.log(this.getClass().getName() + ": encoding file contents using " + encoding);
        return new String(blob, encoding);
    }
    
    /**
     * Read file and return data as a base64 encoded data url.
     * A data url is of the form:
     *      data:[<mediatype>][;base64],<data>
     * @param filePath  Full path of the file to be read
     */
    protected String readAsDataURL(String filePath) throws FileNotFoundException, IOException {
        String result = null;

        // read file
        byte[] blob = readFile(filePath);
        
        // encode file contents using BASE64 encoding
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        Base64OutputStream base64OutputStream = new Base64OutputStream(byteArrayOutputStream);
        base64OutputStream.write(blob);
        base64OutputStream.flush();
        base64OutputStream.close(); 
        result = byteArrayOutputStream.toString();
 
        // put result in proper form 
        // TODO: determine media type? (not required)
        String mediaType = "";
        result = "data:" + mediaType + ";base64," + result;
        
        return result;
    }
    
    /**
     * Reads file as byte array.
     * @param filePath      Full path of the file to be read  
     * @return file content as a byte array
     */
    protected byte[] readFile(String filePath) throws FileNotFoundException, IOException {
        byte[] blob = null;
        DataInputStream dis = null;
        try {
            dis = openDataInputStream(filePath);
            blob = IOUtilities.streamToBytes(dis);
        } finally {
            try { 
                if (dis != null) dis.close();
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        return blob;
    }

    /**
     * Writes data to the specified file.
     * @param filePath  Full path of file to be written to
     * @param data      Data to be written
     * @param position  Position at which to begin writing
     */
    protected int writeFile(String filePath, String data, int position) throws IOException {
        FileConnection fconn = null;
        OutputStream os = null;
        byte[] bytes = data.getBytes();
        try {
            fconn = (FileConnection)Connector.open(filePath, Connector.READ_WRITE);
            if (!fconn.exists()) {
                fconn.create();
            }
            os = fconn.openOutputStream(position);
            os.write(bytes);
        } finally {
            try {
                if (os != null) os.close();
                if (fconn != null) fconn.close();
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        return bytes.length;
    }
    
    /**
     * Changes the length of the specified file.  If shortening, data beyond new length
     * is discarded. 
     * @param fileName  The full path of the file to truncate
     * @param size      The size to which the length of the file is to be adjusted
     * @param the size of the file
     */
    protected long truncateFile(String filePath, long size) throws FileNotFoundException, IOException {
        long fileSize = 0;
        FileConnection fconn = null;
        try {
            fconn = (FileConnection)Connector.open(filePath, Connector.READ_WRITE);
            if (!fconn.exists()) {
                throw new FileNotFoundException(filePath + " not found");                
            }
            if (size >= 0) {
                fconn.truncate(size);
            }
            fileSize = fconn.fileSize();
        } finally {
            try {
                if (fconn != null) fconn.close();
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        return fileSize;
    }
    
    /**
     * Utility function to open a DataInputStream from a file path.
     *
     * A file can be referenced with the following protocols:
     *  - System.getProperty("fileconn.dir.*")
     *  - local:/// references files bundled with the application
     *
     * @param filePath The full path to the file to open
     * @return Handle to the DataInputStream
     */
    protected DataInputStream openDataInputStream(final String filePath) throws FileNotFoundException, IOException {
        FileConnection fconn = null;
        DataInputStream dis = null;
        
        try {
            if (filePath.startsWith("local:///")) {
                // Remove local:// from filePath but leave a leading /
                dis = new DataInputStream(Application.class.getResourceAsStream(filePath.substring(8)));
            }
            else {
                fconn = (FileConnection)Connector.open(filePath, Connector.READ);
                if (!fconn.exists()) {
                    throw new FileNotFoundException(filePath + " not found");
                }
                dis = fconn.openDataInputStream();
            }

            if (dis == null) {
                throw new FileNotFoundException(filePath + " not found");
            }
        } finally {
            try {
                if (fconn != null) fconn.close();
            } catch (IOException e) {
                Logger.log(this.getClass().getName() + ": " + e);
            }
        }
        
        return dis;
    }
    
    /**
     * Returns action to perform.
     * @param action 
     * @return action to perform
     */
    protected static int getAction(String action) {
        if ("readAsText".equals(action)) return ACTION_READ_AS_TEXT;
        if ("readAsDataURL".equals(action)) return ACTION_READ_AS_DATA_URL;
        if ("write".equals(action)) return ACTION_WRITE;
        if ("truncate".equals(action)) return ACTION_TRUNCATE;
        return -1;
    }   
}
