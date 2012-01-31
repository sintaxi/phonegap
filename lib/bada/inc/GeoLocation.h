/*
 * GeoLocation.h
 *
 *  Created on: Mar 7, 2011
 *      Author: Anis Kadri
 */

#ifndef GEOLOCATION_H_
#define GEOLOCATION_H_

#include "PhoneGapCommand.h"
#include <FLocations.h>

using namespace Osp::Locations;

class GeoLocation: public PhoneGapCommand, ILocationListener {
private:
	LocationProvider* locProvider;
	bool			  watching;
	String			  callbackId;
public:
	GeoLocation();
	GeoLocation(Web* pWeb);
	virtual ~GeoLocation();
public:
	void StartWatching();
	void StopWatching();
	bool IsWatching();
	void GetLastKnownLocation();
	virtual void OnLocationUpdated(Location& location);
	virtual void OnProviderStateChanged(LocProviderState newState);
	virtual void Run(const String& command);
};

#endif /* GEOLOCATION_H_ */
