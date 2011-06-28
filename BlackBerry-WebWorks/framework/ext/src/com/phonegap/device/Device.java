/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.device;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.system.DeviceInfo;

/**
 * Provides device information, including:
 * 
 * - Device platform version (e.g. 2.13.0.95). Not to be confused with BlackBerry OS version.
 * - Unique device identifier (UUID).
 * - PhoneGap software version.
 */
public final class Device extends Scriptable {
	public static final String FIELD_PLATFORM = "platform";
	public static final String FIELD_UUID     = "uuid";
	public static final String FIELD_PHONEGAP = "phonegap";
	
	public Object getField(String name) throws Exception {
		
		if (name.equals(FIELD_PLATFORM)) {
			return new String(DeviceInfo.getPlatformVersion());
		}
		else if (name.equals(FIELD_UUID)) {
			return new Integer(DeviceInfo.getDeviceId());
		}
		else if (name.equals(FIELD_PHONEGAP)) {
			return "0.9.6";
		}
		
		return super.getField(name);
	}
}
