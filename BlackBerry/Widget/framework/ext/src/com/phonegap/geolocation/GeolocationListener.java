/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.geolocation;

import javax.microedition.location.Location;
import javax.microedition.location.LocationListener;
import javax.microedition.location.LocationProvider;

import org.json.me.JSONException;
import org.json.me.JSONObject;

import com.phonegap.PhoneGapExtension;
import com.phonegap.api.PluginResult;
import com.phonegap.util.Logger;

/**
 * GeolocationListener listens for update notifications from a LocationProvider.
 * Provides location update notifications to registered callback.
 */
public final class GeolocationListener implements LocationListener {

	private LocationProvider locationProvider;  // location provider the listener listens to
	private String callbackId;                  // callback that is to be notified on location updates
	
	/**
	 * Creates a new listener that attaches itself to the specified LocationProvider.
	 * @param locationProvider location provider that listener will attach to
	 * @param po position options
	 */
	public GeolocationListener(LocationProvider locationProvider, String callbackId, PositionOptions po) {
		this.locationProvider = locationProvider;
		this.callbackId = callbackId;
		
		// neither maximum age nor timeout can be larger than polling interval
		int interval = Math.max(po.maxAge, po.timeout)/1000;
		this.locationProvider.setLocationListener(this, interval, po.timeout/1000, po.maxAge/1000);
	}	
	
	/**
	 * Updated when location changes.
	 */
	public void locationUpdated(LocationProvider provider, Location location) {
		if (location.isValid()) {
        	Logger.log(this.getClass().getName() + ": updated with valid location");
            this.updateLocation(location);
        } else {
        	Logger.log(this.getClass().getName() + ": updated with invalid location");
        	// getting the location timed out
        	this.updateLocationError(GeolocationStatus.GPS_TIMEOUT);
        }
    }

	/**
	 * Updated when provider state changes.
	 */
    public void providerStateChanged(LocationProvider provider, int newState) {
    	switch (newState) {
	    	case LocationProvider.AVAILABLE:
	            Logger.log(this.getClass().getName() + ": provider state changed to AVAILABLE");
	    		break;
	    	case LocationProvider.OUT_OF_SERVICE:
	            Logger.log(this.getClass().getName() + ": provider state changed to OUT_OF_SERVICE");
	    		this.updateLocationError(GeolocationStatus.GPS_OUT_OF_SERVICE);
	    		break;
	    	case LocationProvider.TEMPORARILY_UNAVAILABLE:
	            Logger.log(this.getClass().getName() + ": provider state changed to TEMPORARILY_UNAVAILABLE");
	    		// This is what happens when you are inside
	    		// TODO: explore possible ways to recover
	    		this.shutdown();
	    		this.updateLocationError(GeolocationStatus.GPS_TEMPORARILY_UNAVAILABLE);
	    		break;
    	}
    }

    /**
     * Shuts down the listener by resetting the location provider.
     */
	public void shutdown() {
		Logger.log(this.getClass().getName() + ": resetting location provider for callback '" + callbackId + "'");
		this.locationProvider.setLocationListener(null, 0, 0, 0);
		this.locationProvider.reset();
	}
	    
	/**
	 * Notifies callbacks of location updates.
	 * @param location updated location
	 */
	protected void updateLocation(Location location) {
		JSONObject position = null; 
		try {
			position = Position.fromLocation(location).toJSONObject();
		} catch (JSONException e) {
			PhoneGapExtension.invokeErrorCallback(callbackId, 
				new GeolocationResult(PluginResult.Status.JSONEXCEPTION, "Converting the location to a JSON object failed"));
		}

		PhoneGapExtension.invokeSuccessCallback(callbackId, 
			new GeolocationResult(GeolocationStatus.OK, position));
	}

	/**
	 * Notifies callbacks of location errors.
	 * @param status
	 */
	protected void updateLocationError(GeolocationStatus status) {
		PhoneGapExtension.invokeErrorCallback(callbackId, new GeolocationResult(status));
		this.shutdown();
	}
}