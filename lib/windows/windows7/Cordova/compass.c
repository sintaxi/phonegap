// Copyright 2012 Intel Corporation
//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

#include <windows.h>
#include <sensors.h>
#include <sensorsapi.h>
#include <propvarutil.h>
#include <portabledevicetypes.h>
#include <wchar.h>
#include "common.h"

#pragma comment(lib, "sensorsapi.lib")
#pragma comment(lib, "portabledeviceguids.lib")

#include "shell.h"
extern HWND hWnd;	// Main window, used as a way to request routine calls from the main thread

ISensorManager*		sensor_manager_if;
ISensorCollection*	sensor_collection_if;
ISensor*			compass_if;

int orientation_sensor_count;

double last_x, last_y, last_z;
double prev_x, prev_y, prev_z;

double last_h;
double prev_h;


// See http://dev.w3.org/geo/api/spec-source-orientation.html

// Definitions missing from Windows 7 SDK...
#define INITGUID
#include <propkeydef.h>
DEFINE_PROPERTYKEY(SENSOR_DATA_TYPE_MAGNETIC_HEADING_COMPENSATED_MAGNETIC_NORTH_DEGREES,    0X1637D8A2, 0X4248, 0X4275, 0X86, 0X5D, 0X55, 0X8D, 0XE8, 0X4A, 0XED, 0XFD, 11);
DEFINE_PROPERTYKEY(SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_X_MILLIGAUSS,     0X1637D8A2, 0X4248, 0X4275, 0X86, 0X5D, 0X55, 0X8D, 0XE8, 0X4A, 0XED, 0XFD, 19);
DEFINE_PROPERTYKEY(SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_Y_MILLIGAUSS,     0X1637D8A2, 0X4248, 0X4275, 0X86, 0X5D, 0X55, 0X8D, 0XE8, 0X4A, 0XED, 0XFD, 20);
DEFINE_PROPERTYKEY(SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_Z_MILLIGAUSS,     0X1637D8A2, 0X4248, 0X4275, 0X86, 0X5D, 0X55, 0X8D, 0XE8, 0X4A, 0XED, 0XFD, 21);


HANDLE compass_thread;	// Data acquisition thread handle
BOOL stop_flag;			// Flag raised to indicate that the acquisition thread should exit

BSTR new_sample_callback;

void propagate_compass_sample (void)
{
	if (new_sample_callback)
	{
		wchar_t buf[100];
		swprintf(buf, sizeof(buf)/sizeof(buf[0]), L"{magneticHeading:%f}", last_h);

		cordova_success_callback(new_sample_callback, TRUE, buf);
	}
}

unsigned int __stdcall compass_thread_proc(void* param)
{
	ISensorDataReport* data_report_if;
	PROPVARIANT v;
//	SYSTEMTIME timestamp;
	static int counter;
	HRESULT hr;
	ULONG ulCount = 0;

	set_thread_name(-1, "Compass Sampling");

	CoInitialize(0);

	// Retrieve sensor manager object
	hr = CoCreateInstance(&CLSID_SensorManager, NULL, CLSCTX_INPROC_SERVER, &IID_ISensorManager, (void**) &sensor_manager_if);

	if (hr == HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY))
	{
		// The user hasn't granted access to sensors
		return -1;
	}

	if (!SUCCEEDED(hr))
		// Sensor API not available...
		return -2;

	// Get the list of available orientation sensors
	hr = sensor_manager_if->lpVtbl->GetSensorsByCategory(sensor_manager_if, &SENSOR_CATEGORY_ORIENTATION, &sensor_collection_if);
  		
	sensor_manager_if->lpVtbl->RequestPermissions(sensor_manager_if, GetForegroundWindow(), sensor_collection_if, TRUE);

	if (SUCCEEDED(hr))
	{
		// Check sensor count
		hr = sensor_collection_if->lpVtbl->GetCount(sensor_collection_if, &orientation_sensor_count);

		if (SUCCEEDED(hr))
		{
			if (orientation_sensor_count == 0)
			{
				// No orientation sensor
			}
			else
			{
				// Get the first available orientation sensor
				hr = sensor_collection_if->lpVtbl->GetAt(sensor_collection_if, 0, &compass_if);

			}
		}
	}



	if (SUCCEEDED(hr))
	{
		IPortableDeviceValues* params_in = NULL;
		IPortableDeviceValues* params_out = NULL;

		// Need a properties object...
		hr = CoCreateInstance(&CLSID_PortableDeviceValues, NULL, CLSCTX_INPROC_SERVER, &IID_IPortableDeviceValues, (void**) &params_in);

		if (SUCCEEDED(hr))
		{
			// Request 20 ms update interval
			hr = params_in->lpVtbl->SetUnsignedIntegerValue(params_in, &SENSOR_PROPERTY_CURRENT_REPORT_INTERVAL, 20);
		}

		if (SUCCEEDED(hr))
		{
			// Set property
			hr = compass_if->lpVtbl->SetProperties(compass_if, params_in, &params_out);
		}

		if (params_in)
			params_in->lpVtbl->Release(params_in);

		if (params_out)
			params_out->lpVtbl->Release(params_out);
	}	
	
	while (!stop_flag)
	{
		prev_x = last_x;
		prev_y = last_y;
		prev_z = last_z;
		
		if (!compass_if || !SUCCEEDED(compass_if->lpVtbl->GetData(compass_if, &data_report_if)))
		{
			last_x = .002 * (rand()%1000) -1;
			last_y = .002 * (rand()%1000) -1;
			last_z = .002 * (rand()%1000) -1;
		}
		else
		{
			PropVariantInit(&v);
			hr = data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_MAGNETIC_HEADING_COMPENSATED_MAGNETIC_NORTH_DEGREES, &v);
			if (v.vt == VT_R4)
				last_h = v.fltVal;
			if (v.vt == VT_R8)
				last_h = v.dblVal;
			PropVariantClear(&v);

			PropVariantInit(&v);
			hr = data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_X_MILLIGAUSS, &v);
			if (v.vt == VT_R4)
				last_x = v.fltVal;
			if (v.vt == VT_R8)
				last_x = v.dblVal;
			PropVariantClear(&v);

			PropVariantInit(&v);
			hr = data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_Y_MILLIGAUSS, &v);
			if (v.vt == VT_R4)
				last_y = v.fltVal;
			if (v.vt == VT_R8)
				last_y = v.dblVal;
			PropVariantClear(&v);

			PropVariantInit(&v);
			hr = data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_MAGNETIC_FIELD_STRENGTH_Z_MILLIGAUSS, &v);
			if (v.vt == VT_R4)
				last_z = v.fltVal;
			if (v.vt == VT_R8)
				last_z = v.dblVal;
			PropVariantClear(&v);
	
			//data_report_if->lpVtbl->GetTimestamp(data_report_if, &timestamp);
			//*ts = 0;

			data_report_if->lpVtbl->Release(data_report_if);
		}

		if (last_x != prev_x || last_y != prev_y || last_z != prev_z)
			SendMessage(hWnd, WM_USER_COMPASS, 0, 0);	// Request the main thread to invoke a JS call for us ; will call propagate_compass_sample in response

		Sleep(10);
	}

	return 0;
}

static int start_compass_acquisition (void)
{
	if (compass_thread)
		return -1;

	// Return 0 x/y/z and 0 timestamp until samples start coming in
	last_x = 0;
	last_y = 0;
	last_z = 0;

	stop_flag = FALSE;
	
	// Reading sensor values seem to block the calling thread ; do this in a dedicated thread
	compass_thread = CreateThread(0, 0, compass_thread_proc, 0, 0, 0);
	return 0;
}

int stop_compass_acquisition (void)
{
	if (compass_thread == 0)
		return -1;

	stop_flag = TRUE;
		
	// Wait until the acquisition thread exits
	WaitForSingleObject(compass_thread, INFINITE);
		
	compass_thread = 0;

	if (new_sample_callback)
	{
		SysFreeString(new_sample_callback);
		new_sample_callback = 0;
	}

	return 0;
}


HRESULT compass_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"getHeading"))
	{
		new_sample_callback = SysAllocString(callback_id);
		last_x = last_y = last_z = 0;	
		propagate_compass_sample();
		start_compass_acquisition();
		return S_OK;
	}

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(Compass, L"Compass", compass_exec, NULL, NULL)

	/*
	
    magneticHeading: The heading in degrees from 0 - 359.99 at a single moment in time. (Number)
    trueHeading: The heading relative to the geographic North Pole in degrees 0 - 359.99 at a single moment in time. A negative value indicates that the true heading could not be determined. (Number)
    headingAccuracy: The deviation in degrees between the reported heading and the true heading. (Number)
    timestamp: The time at which this heading was determined. (milliseconds)

	*/
