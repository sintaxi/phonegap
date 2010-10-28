/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.notification;

import com.phonegap.api.PluginResult;

import org.json.me.JSONArray;
import org.json.me.JSONException;

import net.rim.device.api.system.Alert;

/**
 * Beep Action (Singleton)
 *
 */
public class BeepAction {

	private static final int BEEP_VOLUME = 99;
	private static final int TUNE_LENGTH = 4;
	
	private static final short TUNE_NOTE                = 440; // A (440Hz)
	private static final short TUNE_NOTE_DURATION       = 500;
	private static final short FREQUENCY_PAUSE_DURATION = 0;
	private static final short TUNE_PAUSE_DURATION      = 50;
	
	private static final short[] TUNE = new short[] {
		TUNE_NOTE,
		TUNE_NOTE_DURATION,
		FREQUENCY_PAUSE_DURATION,
		TUNE_PAUSE_DURATION,
	};
	
	/**
	 * Beeps the device for a given number of times.
	 *
	 * @param args JSONArray formatted as [ count ]
	 *             count: specifies the number of times to beep the device (default: 1).
	 * @return A CommandResult object with the success or failure
	 *         state for beeping the device.
	 */
	public static PluginResult execute(JSONArray args) {
		PluginResult result = null;
		
		if (Alert.isAudioSupported()) {
			try {
				int repeatCount = (args.length() >= 1) ? ((Integer)args.get(0)).intValue() : 1;
				
				Alert.startAudio(getTune(repeatCount), BEEP_VOLUME);
			}
			catch (JSONException e) {
				result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
			}
			result = new PluginResult(PluginResult.Status.OK, "OK");
		}
		else {
			result = new PluginResult(PluginResult.Status.ILLEGALACCESSEXCEPTION, "Audio not supported");
		}
		
		return result;
	}
	
	/**
	 * Create the tune to play.
	 *
	 * The tune consists of frequency-duration pairs.
	 * The tune can be adjust with the TUNE constants that are
	 * declared within the BeepAction class.
	 *
	 * @param repeatCount Number of times to repeat the tune.
	 * @return frequency-duration pairs that are used by Alert.startAudio
	 */
	private static short[] getTune(int repeatCount) {
		short[] tune = new short[TUNE_LENGTH * repeatCount];
		
		for (int i = 0; i < repeatCount; i++) {
			System.arraycopy(TUNE, 0, tune, TUNE_LENGTH * i, TUNE_LENGTH);
		}
		
		return tune;
	}
}