/*
 * Accelerometer.h
 *
 *  Created on: Mar 8, 2011
 *      Author: Anis Kadri
 */

#ifndef ACCELEROMETER_H_
#define ACCELEROMETER_H_

#include "PhoneGapCommand.h"
#include <FUix.h>

using namespace Osp::Uix;

class Accelerometer: public PhoneGapCommand, ISensorEventListener
 {
public:
	Accelerometer();
	Accelerometer(Web* pWeb);
	virtual ~Accelerometer();
public:
	virtual void Run(const String& command);
	bool StartSensor(void);
	bool StopSensor(void);
	bool IsStarted(void);
	void GetLastAcceleration(void);
	void OnDataReceived(SensorType sensorType, SensorData& sensorData, result r);
private:
	SensorManager __sensorMgr;
	bool started;
	String callbackId;
	float x, y, z;
	long timestamp;
};

#endif /* ACCELEROMETER_H_ */
