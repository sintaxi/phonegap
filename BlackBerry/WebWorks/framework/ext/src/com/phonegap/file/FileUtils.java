/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.file;

import java.io.DataInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.device.api.io.FileNotFoundException;
import net.rim.device.api.io.IOUtilities;
import net.rim.device.api.system.Application;

import com.phonegap.PhoneGapExtension;
import com.phonegap.util.Logger;

/**
 * Contains file utility methods.
 */
public class FileUtils {

    public static final String FILE_SEPARATOR = System.getProperty("file.separator");
    
    /**
     * Reads file as byte array.
     * @param filePath      Full path of the file to be read  
     * @param mode          One of Connector.READ, READ_WRITE, WRITE
     * @return file content as a byte array
     */
    public static byte[] readFile(String filePath, int mode) throws FileNotFoundException, IOException {
        byte[] blob = null;
        DataInputStream dis = null;
        try {
            dis = openDataInputStream(filePath, mode);
            blob = IOUtilities.streamToBytes(dis);
        } 
        finally {
            try { 
                if (dis != null) dis.close();
            } 
            catch (IOException ignored) {
            }
        }
        return blob;
    }

    /**
     * Utility function to open a DataInputStream from a file path.
     *
     * A file can be referenced with the following protocols:
     *  - System.getProperty("fileconn.dir.*")
     *  - local:/// references files bundled with the application
     *
     * @param filePath The full path to the file to open
     * @param mode     One of Connector.READ, READ_WRITE, WRITE
     * @return Handle to the DataInputStream
     */
    private static DataInputStream openDataInputStream(final String filePath, int mode) throws FileNotFoundException, IOException {
        FileConnection fconn = null;
        DataInputStream dis = null;
        try {
            if (filePath.startsWith("local:///")) {
                // Remove local:// from filePath but leave a leading /
                dis = new DataInputStream(Application.class.getResourceAsStream(filePath.substring(8)));
            }
            else {
                fconn = (FileConnection)Connector.open(filePath, mode);
                if (!fconn.exists()) {
                    throw new FileNotFoundException(filePath + " not found");
                }
                dis = fconn.openDataInputStream();
            }

            if (dis == null) {
                throw new FileNotFoundException(filePath + " not found");
            }
        } 
        finally {
            try {
                if (fconn != null) fconn.close();
            } 
            catch (IOException ignored) {
            }
        }
        
        return dis;
    }
    
    /**
     * Writes data to the specified file.
     * @param filePath  Full path of file to be written to
     * @param data      Data to be written
     * @param position  Position at which to begin writing
     * @throws IOException
     */
    public static int writeFile(String filePath, byte[] data, int position) throws IOException {
        FileConnection fconn = null;
        OutputStream os = null;
        try {
            fconn = (FileConnection)Connector.open(filePath, Connector.READ_WRITE);
            if (!fconn.exists()) {
                fconn.create();
            }
            os = fconn.openOutputStream(position);
            os.write(data);
        } 
        finally {
            try {
                if (os != null) os.close();
                if (fconn != null) fconn.close();
            } 
            catch (IOException ignored) {
            }
        }
        return data.length;
    }
    
    /**
     * Deletes file or directory from file system.  If the specified path is a 
     * directory, the deletion is recursive.
     * @param path full path of file or directory to be deleted
     * @throws IOException 
     */
    public static void delete(String path) throws IOException {
        FileConnection fconn = null;
        try {
            fconn = (FileConnection)Connector.open(path, Connector.READ_WRITE);
            if (fconn.exists()) {
                if (!fconn.isDirectory()) {
                    fconn.delete();
                    Logger.log(FileUtils.class.getName() + ":  " + path + " deleted");
                }
                else {
                    // recursively delete directory contents
                    Enumeration contents = fconn.list("*", true);
                    if (contents.hasMoreElements()) {
                        fconn.close();
                        while (contents.hasMoreElements()) {
                            delete(path + contents.nextElement().toString());
                        }            
                        fconn = (FileConnection)Connector.open(path, Connector.READ_WRITE);                    
                    }
                    // now delete this directory
                    fconn.delete();
                    Logger.log(FileUtils.class.getName() + ":  " + path + " deleted");
                }
            }
        } 
        finally {
            try {
                if (fconn != null) fconn.close();
            } 
            catch (IOException ignored) {
            }
        }        
    }
    
    /**
     * Creates a directory if it does not already exist.  Directories in the 
     * specified path are not created recursively. 
     * @param dirPath full path of directory to create
     * @throws IOException if the target file system is not accessible, 
     * or an unspecified error occurs
     */
    public static void mkdir(String dirPath) throws IOException {
        FileConnection fconn = null;
        try {
            fconn = (FileConnection)Connector.open(dirPath);
            if (!fconn.exists()) {
                fconn.mkdir();
            }
        }
        finally {
            try {
                if (fconn != null) fconn.close();
            } 
            catch (IOException ignored) {
            }            
        }
    }
    
    /**
     * Creates a temporary directory on the writable storage area of the file system.  
     * The temporary directory is created in the following location:
     * <code>rootDir/tmpGUID/dirName</code>  
     * where <code>rootDir</code> is the path of the writable directory on the
     * file system (could be the SD card or the user directory); 
     * <code>tmpGUID</code> is a application temporary directory that is created 
     * using the unique application GUID; and <code>dirName</code> is an optional 
     * directory name to create beneath the application temporary directory.  If
     * the application temporary directory does not exist, invoking this method
     * will create it. <em>NOTE:</em> The <code>tmpGUID</code> application 
     * temporary directory and all its contents are deleted upon application exit.
     * @param dirName name of directory to be created beneath the application temporary directory
     * @return full path name of the directory that was created
     * @throws IOException if there are no file systems mounted, or an unspecified
     * error occurs
     */
    public static String createTempDirectory(String dirName) throws IOException {
        // create the application temp directory
        String tmpDir = getApplicationTempDirPath();
        mkdir(tmpDir);
        
        // create specified sub-directory as "<root/>tmpGUID/dirName/"
        dirName = (dirName == null) ? "" : dirName.trim();
        if (dirName.length() > 0) {
            if (!dirName.endsWith(FILE_SEPARATOR)) {
                dirName += FILE_SEPARATOR;
            }
            tmpDir += dirName;
            mkdir(tmpDir);
        }
        return tmpDir;
    }
    
    /**
     * Attempts to delete the application temporary directory and all contents.
     * The application temporary directory is: <code>rootDir/tmpGUID/</code>,  
     * where <code>rootDir</code> is the file system root (could be the 
     * SD card or the user directory); and <code>tmpGUID</code> is the application 
     * temporary directory that is created using the unique application GUID. 
     * <em>NOTE:</em> The <code>tmpGUID</code> application temporary directory
     * and all sub-directories are deleted upon application exit.
     * @throws IOException if an unspecified error occurs
     */
    public synchronized static void deleteApplicationTempDirectory() throws IOException {
        String tmpDir = getApplicationTempDirPath();
        delete(tmpDir);
    }
    
    /**
     * Returns the full path of the application temporary directory.  The directory
     * may not exist.  Invoke <code>createTempDirectory</code> to create it.
     * @return the full path name of the application temporary directory
     */
    public static String getApplicationTempDirPath() {
        return getStoragePath() + "tmp" + PhoneGapExtension.getAppID() + FILE_SEPARATOR;
    }
    
    /**
     * Returns the full path of a directory that can be used for storage (is
     * writable).  Will return the path of the SD card, if it exists, and default
     * to the user directory if it does not.
     * @return full path that can be used to store files
     */
    public static String getStoragePath() {
        String storageDir = null;
        // try the SD card path first 
        String sdcard = getSDCardPath();
        if (exists(sdcard)) {
            storageDir = sdcard;
        }
        // fall back to the users home directory
        else {
            storageDir = getUserPath();
        }
        return storageDir;
    }
    
    /**
     * Returns the full path name of the SD card.
     * @return full path name of the SD card
     */
    public static String getSDCardPath() {
        return System.getProperty("fileconn.dir.memorycard");
    }
    
    /**
     * Returns the full path name of the user directory.
     * @return full path name of the user directory
     */
    public static String getUserPath() {
        String musicDir = System.getProperty("fileconn.dir.music");
        int i = musicDir.lastIndexOf('/', musicDir.length()-2); // ignore trailing '/'
        return musicDir.substring(0, i+1);        
    }
    
    /**
     * Determines of the specified file system path exists.
     * @param path full path of file or directory
     * @return true if the file or directory exists
     */
    public static boolean exists(String path) {
        boolean exists = false;
        FileConnection fconn = null;
        try {
            fconn = (FileConnection)Connector.open(path);
            exists = fconn.exists();
        }
        catch (IOException e) {
            Logger.log(FileUtils.class.getName() + ": " + e);
        }
        finally {
            try {
                if (fconn != null) fconn.close();
            } 
            catch (IOException ignored) {
            }            
        }
        return exists;
    }
}
