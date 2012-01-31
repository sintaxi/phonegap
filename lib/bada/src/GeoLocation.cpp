/*
 * GeoLocation.cpp
 *
 *  Created on: Mar 7, 2011
 *      Author: Anis Kadri
 */

#include "GeoLocation.h"

GeoLocation::GeoLocation() {
	// TODO Auto-generated constructor stub

}

GeoLocation::GeoLocation(Web* pWeb): PhoneGapCommand(pWeb) {
	locProvider = new LocationProvider();
	locProvider->Construct(LOC_METHOD_HYBRID);
	watching = false;
}

GeoLocation::~GeoLocation() {
	delete locProvider;
}

void
GeoLocation::Run(const String& command) {
	if(!command.IsEmpty()) {
		Uri commandUri;
		commandUri.SetUri(command);
		String method = commandUri.GetHost();
		StringTokenizer strTok(commandUri.GetPath(), L"/");
		if(strTok.GetTokenCount() > 1) {
			strTok.GetNextToken(callbackId);
			AppLogDebug("Method %S, CallbackId: %S", method.GetPointer(), callbackId.GetPointer());
		}
		AppLogDebug("Method %S, Callback: %S", method.GetPointer(), callbackId.GetPointer());
		// used to determine callback ID
		if(method == L"com.phonegap.Geolocation.watchPosition" && !callbackId.IsEmpty() && !IsWatching()) {
			AppLogDebug("watching position...");
			StartWatching();
		}
		if(method == L"com.phonegap.Geolocation.stop" && IsWatching()) {
			AppLogDebug("stop watching position...");
			StopWatching();
		}
		if(method == L"com.phonegap.Geolocation.getCurrentPosition" && !callbackId.IsEmpty() && !IsWatching()) {
			AppLogDebug("getting current position...");
			GetLastKnownLocation();
		}
		AppLogDebug("GeoLocation command %S completed", command.GetPointer());
	}
}

void
GeoLocation::StartWatching() {
	locProvider->RequestLocationUpdates(*this, 5, false);
	watching = true;
	AppLogDebug("Start Watching Location");
}

void
GeoLocation::StopWatching() {
	locProvider->CancelLocationUpdates();
	watching = false;
	AppLogDebug("Stop Watching Location");
}

bool
GeoLocation::IsWatching() {
	return watching;
}

void
GeoLocation::GetLastKnownLocation() {
	Location *location = locProvider->GetLastKnownLocationN();
	if(location->GetQualifiedCoordinates() != null) {
		const QualifiedCoordinates *q = location->GetQualifiedCoordinates();
		double latitude = q->GetLatitude();
		double longitude = q->GetLongitude();
		float altitude = q->GetAltitude();
		float accuracy = q->GetHorizontalAccuracy();
		float heading = q->GetVerticalAccuracy();
		float speed = location->GetSpeed();
		long long timestamp = location->GetTimestamp();
		AppLogDebug("new Coordinates(%d,%d,%f,%f,%f,%f)", latitude, longitude, altitude, speed, accuracy, heading);
		String coordinates;
		coordinates.Format(256, L"new Coordinates(%d,%d,%f,%f,%f,%f)", latitude, longitude, altitude, speed, accuracy, heading);
		String res;
		res.Format(512, L"PhoneGap.callbacks['%S'].success(new Position(%S,%d))", callbackId.GetPointer(), coordinates.GetPointer(), timestamp);
		pWeb->EvaluateJavascriptN(res);
	} else {
		AppLogDebug("PhoneGap.callbacks['%S'].fail(new PositionError(0001,'Could not get location'))", callbackId.GetPointer());
		String res;
		res.Format(256, L"PhoneGap.callbacks['%S'].fail(new PositionError(0001,'Could not get location'))", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(res);
	}
}

void
GeoLocation::OnLocationUpdated(Location& location) {
	if(location.GetQualifiedCoordinates() != null) {
		const QualifiedCoordinates *q = location.GetQualifiedCoordinates();
		double latitude = q->GetLatitude();
		double longitude = q->GetLongitude();
		float altitude = q->GetAltitude();
		float accuracy = q->GetHorizontalAccuracy();
		float heading = q->GetVerticalAccuracy();
		float speed = location.GetSpeed();
		long long timestamp = location.GetTimestamp();
		AppLogDebug("new Coordinates(%d,%d,%f,%f,%f,%f)", latitude, longitude, altitude, speed, accuracy, heading);
		String coordinates;
		coordinates.Format(256, L"new Coordinates(%d,%d,%f,%f,%f,%f)", latitude, longitude, altitude, speed, accuracy, heading);
		String res;
		res.Format(512, L"PhoneGap.callbacks['%S'].success(new Position(%S,%d))", callbackId.GetPointer(), coordinates.GetPointer(), timestamp);
		pWeb->EvaluateJavascriptN(res);
	} else {
		AppLogDebug("PhoneGap.callbacks['%S'].fail(new PositionError(0001,'Could not get location'))", callbackId.GetPointer());
		String res;
		res.Format(256, L"PhoneGap.callbacks['%S'].fail(new PositionError(0001,'Could not get location'))", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(res);
	}
}

void
GeoLocation::OnProviderStateChanged(LocProviderState newState) {

}
