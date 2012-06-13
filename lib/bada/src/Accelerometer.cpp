/*
 * Accelerometer.cpp
 *
 *  Created on: Mar 8, 2011
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

#include "Accelerometer.h"

Accelerometer::Accelerometer() {
	__sensorMgr.Construct();
	started = false;
}

Accelerometer::Accelerometer(Web* pWeb): CordovaCommand(pWeb) {
	__sensorMgr.Construct();
	started = false;
	x = y = z = 0.0;
	timestamp = 0;
}

Accelerometer::~Accelerometer() {
}

void
Accelerometer::Run(const String& command) {
	if (!command.IsEmpty()) {
		Uri commandUri;
		commandUri.SetUri(command);
		String method = commandUri.GetHost();
		StringTokenizer strTok(commandUri.GetPath(), L"/");
		if(strTok.GetTokenCount() == 1) {
			strTok.GetNextToken(callbackId);
			AppLogDebug("Method %S, CallbackId: %S", method.GetPointer(), callbackId.GetPointer());
		}
		if(method == L"org.apache.cordova.Accelerometer.watchAcceleration" && !callbackId.IsEmpty() && !IsStarted()) {
			StartSensor();
		}
		if(method == L"org.apache.cordova.Accelerometer.clearWatch" && IsStarted()) {
			StopSensor();
		}
		if(method == L"org.apache.cordova.Accelerometer.getCurrentAcceleration" && !callbackId.IsEmpty() && !IsStarted()) {
			GetLastAcceleration();
		}
		AppLogDebug("Acceleration command %S completed", command.GetPointer());
	} else {
		AppLogDebug("Can't run empty command");
	}
}

bool
Accelerometer::StartSensor(void) {
	result r = E_SUCCESS;

	if(__sensorMgr.IsAvailable(SENSOR_TYPE_ACCELERATION)) {
		r = __sensorMgr.AddSensorListener(*this, SENSOR_TYPE_ACCELERATION, 50, true);
		if(IsFailed(r)) {
			return false;
		}
	} else {
		AppLogException("Acceleration sensor is not available");
		String res;
		res.Format(256, L"Cordova.callbacks['%S'].fail({message:'Acceleration sensor is not available',code:'001'});");
		pWeb->EvaluateJavascriptN(res);
		return false;
	}
	started = true;
	AppLogDebug("Start Watching Sensor");
	return true;
}

bool
Accelerometer::StopSensor(void) {
	result r = E_SUCCESS;

	r = __sensorMgr.RemoveSensorListener(*this, SENSOR_TYPE_ACCELERATION);
	if(IsFailed(r)) {
		return false;
	}
	started = false;
	AppLogDebug("Stopped Watching Sensor");
	return true;
}

bool
Accelerometer::IsStarted() {
	return started;
}

void
Accelerometer::GetLastAcceleration() {
	String res;
	res.Format(256, L"Cordova.callbacks['%S'].success({x:%f,y:%f,z:%f,timestamp:%d});", callbackId.GetPointer(), x, y, z, timestamp);
	pWeb->EvaluateJavascriptN(res);

	res.Clear();
	res.Format(256, L"navigator.accelerometer.lastAcceleration = new Acceleration(%f,%f,%f,%d});", x, y, z, timestamp);
	pWeb->EvaluateJavascriptN(res);
}

void
Accelerometer::OnDataReceived(SensorType sensorType, SensorData& sensorData, result r) {

	sensorData.GetValue((SensorDataKey)ACCELERATION_DATA_KEY_TIMESTAMP, timestamp);
	sensorData.GetValue((SensorDataKey)ACCELERATION_DATA_KEY_X, x);
	sensorData.GetValue((SensorDataKey)ACCELERATION_DATA_KEY_Y, y);
	sensorData.GetValue((SensorDataKey)ACCELERATION_DATA_KEY_Z, z);

	AppLogDebug("x: %f, y: %f, z: %f timestamp: %d", x, y, z, timestamp);

	String res;
	res.Format(256, L"Cordova.callbacks['%S'].success({x:%f,y:%f,z:%f,timestamp:%d});", callbackId.GetPointer(), x, y, z, timestamp);
	pWeb->EvaluateJavascriptN(res);

	res.Clear();
	res.Format(256, L"navigator.accelerometer.lastAcceleration = new Acceleration(%f,%f,%f,%d});", x, y, z, timestamp);
	pWeb->EvaluateJavascriptN(res);
}
