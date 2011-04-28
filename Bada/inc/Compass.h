/*
 * Compass.h
 *
 *  Created on: Mar 25, 2011
 *      Author: Anis Kadri
 */

#ifndef COMPASS_H_
#define COMPASS_H_

#include <FUix.h>
#include "PhoneGapCommand.h"

using namespace Osp::Uix;

class Compass: public PhoneGapCommand, ISensorEventListener {
public:
	Compass(Web* pWeb);
	virtual ~Compass();
public:
	void Run(const String& command);
	bool StartSensor(void);
	bool StopSensor(void);
	bool IsStarted(void);
	void GetLastHeading(void);
	void OnDataReceived(SensorType sensorType, SensorData& sensorData, result r);
private:
	SensorManager __sensorMgr;
	bool started;
	String callbackId;
	float x, y, z;
	long timestamp;
};

#endif /* COMPASS_H_ */
