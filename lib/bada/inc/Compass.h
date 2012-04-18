/*
 * Compass.h
 *
 *  Created on: Mar 25, 2011
 *      Author: Anis Kadri <anis@adobe.com>
 *
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

#ifndef COMPASS_H_
#define COMPASS_H_

#include <FUix.h>
#include "CordovaCommand.h"

using namespace Osp::Uix;

class Compass: public CordovaCommand, ISensorEventListener {
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
