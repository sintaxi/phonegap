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

import javax.microedition.io.Connector;
import javax.microedition.io.file.FileConnection;

import net.rim.blackberry.api.invoke.CameraArguments;
import net.rim.blackberry.api.invoke.Invoke;
import net.rim.device.api.io.Base64OutputStream;
import net.rim.device.api.io.file.FileSystemJournal;
import net.rim.device.api.io.file.FileSystemJournalEntry;
import net.rim.device.api.io.file.FileSystemJournalListener;
import net.rim.device.api.system.Characters;
import net.rim.device.api.system.EventInjector;
import net.rim.device.api.ui.UiApplication;

import org.json.me.JSONArray;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

public class CapturePhotoAction implements FileSystemJournalListener
{
	private static final int DATA_URL = 0;
	private static final int FILE_URI = 1;
	
	/**
	 * Maximum image encoding size (in bytes).  Obtained unofficially through trial and error.
	 */
	private static final long MAX_ENCODING_SIZE = 1500000L;
	
	private long lastUSN = 0;
	private String callbackId;
	private int destinationType = DATA_URL;

	public CapturePhotoAction(String callbackId)
	{
		this.callbackId = callbackId;
	}
	
	/**
	 * Capture a photo using device camera.  The camera is invoked using native APIs.
	 * The photo is captured by listening to file system changes, and sent back by 
	 * invoking the appropriate JS callback.
	 *
	 * @param args JSONArray formatted as [ cameraArgs ]
	 *        cameraArgs:      
     *          [ 80,                                    // quality (ignored)
     *            Camera.DestinationType.DATA_URL,       // destinationType
     *            Camera.PictureSourceType.PHOTOLIBRARY  // sourceType (ignored)]
	 * @return A CommandResult object with the INPROGRESS state for taking a photo.
	 */
	public PluginResult execute(JSONArray args) 
	{
		// get the camera options, if supplied
		if (args != null && args.length() > 1)
		{
			// determine the desired destination type: data or file URI
			Integer destType = (Integer)args.opt(1);
			this.destinationType = 
				(destType != null && destType.intValue()== FILE_URI) ? FILE_URI : DATA_URL;
		}
		
		// MMAPI interface doesn't use the native Camera application or interface
		// (we would have to replicate it).  So, we invoke the native Camera application,
		// which doesn't allow us to set any options.
		synchronized(UiApplication.getEventLock()) {
			UiApplication.getUiApplication().addFileSystemJournalListener(this);
			Invoke.invokeApplication(Invoke.APP_TYPE_CAMERA, new CameraArguments());
		}
		
		// We invoked the native camera application, which runs in a separate
		// process, and must now wait for the listener to retrieve the photo taken. 
		// Return NO_RESULT status so plugin manager does not invoke a callback,
		// but set keep callback to true so we can invoke the callback later.
		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		return result;
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
					// we found a new JPEG, process it
					final PluginResult result = processImage("file://" + path);
					
					// Invoking the callback to the JavaScript engine seems to necessitate 
					// a new thread in Blackberry OS 6.0.  This was unnecessary in 5.0, 
					// but there is a different threading model with the new WebKit engine 
					// in 6.0.  Invoking the JS callback in the same thread causes the 
					// application to crash in 6.0.
					Thread thread = new Thread(new Runnable() {
						public void run() {
							// invoke the appropriate callback
							if (result.getStatus() == PluginResult.Status.OK.ordinal())
							{
								PhoneGapExtension.invokeSuccessCallback(callbackId, result);
							}
							else 
							{
								PhoneGapExtension.invokeErrorCallback(callbackId, result);
							}
						}
					});
					thread.start();

					// clean up
					closeCamera();
					
					break;
				}
			}
		}
		
		// remember the file journal change number, 
		// so we don't search the same events again and again
		lastUSN = USN;
	}
	
	/**
	 * Returns either the image URI or the image itself encoded as a Base64 string.
	 */
	private PluginResult processImage(String photoPath)
	{
		Logger.log(this.getClass().getName() + ": processing image " + photoPath);
		String resultData;
		
		if (this.destinationType == FILE_URI) 
		{
			// just return the photo URI
			resultData = photoPath;
		}
		else 
		{
			// encode the image as base64 string
			try 
			{
				resultData = encodeImage(photoPath);
			}
			catch (Exception e)
			{
				return new PluginResult(PluginResult.Status.IOEXCEPTION, e.toString());
			}
			
			// we have to check the size to avoid memory errors in the browser
			if (resultData.length() > MAX_ENCODING_SIZE) 
			{
				// it's a big one.  this is for your own good.
				String msg = "Encoded image is too large. Try reducing camera image quality.";
				Logger.log(this.getClass().getName() + ": " + msg);
				return new PluginResult(PluginResult.Status.ERROR, msg);
			}
		}

		return new PluginResult(PluginResult.Status.OK, resultData);
	}
	
	/**
	 * Opens the photo at a given URI and converts it to a Base64-encoded string.
	 * @param photoPath - file URI
	 * @return Base64-encoded String of image at file URI
	 */
	private String encodeImage(String photoPath) throws IOException
	{
		String imageData = null;
		
		// open the image file
		FileConnection fconn = (FileConnection)Connector.open(photoPath);
		try 
		{
			if (fconn.exists()) 
			{
				InputStream imageStream = fconn.openInputStream();

				// read the image data
				int size = 100000;
				int imageSize = 0;
				ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
				Base64OutputStream base64OutputStream = new Base64OutputStream(byteArrayOutputStream);
				byte[] buffer = new byte[size];
				while (true) 
				{
					int bytesRead = imageStream.read(buffer, 0, size);
					imageSize += bytesRead;
					if (imageSize > 0 && bytesRead == -1) 
						break;
					base64OutputStream.write(buffer, 0, bytesRead);
				}
				
				base64OutputStream.flush();
				base64OutputStream.close();
				imageData = byteArrayOutputStream.toString();
				imageStream.close();
				
				Logger.log(this.getClass().getName() + ": image size=" +
					    Integer.toString(imageSize));
				Logger.log(this.getClass().getName() + ": Base64 encoding size=" +
				    Integer.toString(imageData.length()));
			}
		}
		finally 
		{
			fconn.close();
		}
		
		return imageData;
	}
		
	/**
	 * Closes the native camera application. 
	 */
	private void closeCamera() 
	{
		// cleanup - remove file system listener
		UiApplication.getUiApplication().removeFileSystemJournalListener(this);

		// simulate two escape characters to exit camera application
		// no, there is no other way to do this
		EventInjector.KeyEvent inject = new EventInjector.KeyEvent(
				EventInjector.KeyEvent.KEY_DOWN, Characters.ESCAPE, 0);
		inject.post();
		inject.post();
	}
}
