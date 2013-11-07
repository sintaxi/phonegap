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
ISensor*			accelerometer_if;

int acceleration_sensor_count;

double last_x, last_y, last_z;
double prev_x, prev_y, prev_z;

HANDLE accel_thread;	// Data acquisition thread handle
BOOL stop_flag;			// Flag raised to indicate that the acquisition thread should exit

BSTR new_sample_callback;

void propagate_accel_sample (void)
{
	if (new_sample_callback)
	{
		wchar_t buf[100];
		swprintf(buf, sizeof(buf)/sizeof(buf[0]), L"{x:%f,y:%f,z:%f}", last_x, last_y, last_z);

		cordova_success_callback(new_sample_callback, TRUE, buf);
	}
}

unsigned int __stdcall accel_thread_proc(void* param)
{
	ISensorDataReport* data_report_if;
	PROPVARIANT v;
//	SYSTEMTIME timestamp;
	static int counter;
	HRESULT hr;
	ULONG ulCount = 0;

	set_thread_name(-1, "Accelerometer Sampling");

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

	// Get the list of available accelerometers
	hr = sensor_manager_if->lpVtbl->GetSensorsByCategory(sensor_manager_if, &SENSOR_CATEGORY_MOTION, &sensor_collection_if);
  		
	sensor_manager_if->lpVtbl->RequestPermissions(sensor_manager_if, GetForegroundWindow(), sensor_collection_if, TRUE);

	if (SUCCEEDED(hr))
	{
		// Check sensor count
		hr = sensor_collection_if->lpVtbl->GetCount(sensor_collection_if, &acceleration_sensor_count);

		if (SUCCEEDED(hr))
		{
			if (acceleration_sensor_count == 0)
			{
				// No accelerometer
			}
		}
	}

	if (SUCCEEDED(hr))
	{
		// Get the first available accelerometer
		hr = sensor_collection_if->lpVtbl->GetAt(sensor_collection_if, 0, &accelerometer_if);
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
			hr = accelerometer_if->lpVtbl->SetProperties(accelerometer_if, params_in, &params_out);
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
		
		if (!accelerometer_if || !SUCCEEDED(accelerometer_if->lpVtbl->GetData(accelerometer_if, &data_report_if)))
		{
			last_x = .002 * (rand()%1000) -1;
			last_y = .002 * (rand()%1000) -1;
			last_z = .002 * (rand()%1000) -1;
		}
		else
		{
			PropVariantInit(&v);
			data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_ACCELERATION_X_G, &v);
			if (v.vt == VT_R4)
				last_x = v.fltVal;
			if (v.vt == VT_R8)
				last_x = v.dblVal;
			PropVariantClear(&v);

			PropVariantInit(&v);
			data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_ACCELERATION_Y_G, &v);
			if (v.vt == VT_R4)
				last_y = v.fltVal;
			if (v.vt == VT_R8)
				last_y = v.dblVal;
			PropVariantClear(&v);

			PropVariantInit(&v);
			data_report_if->lpVtbl->GetSensorValue(data_report_if, &SENSOR_DATA_TYPE_ACCELERATION_Z_G, &v);
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
			SendMessage(hWnd, WM_USER_ACCEL, 0, 0);	// Request the main thread to invoke a JS call for us ; will call propagate_accel_sample in response

		Sleep(10);
	}

	return 0;
}

int start_accel_acquisition (void)
{
	if (accel_thread)
		return -1;

	// Return 0 x/y/z and 0 timestamp until samples start coming in
	last_x = 0;
	last_y = 0;
	last_z = 0;
	
	stop_flag = FALSE;
	
	// Reading sensor values seem to block the calling thread ; do this in a dedicated thread
	accel_thread = CreateThread(0, 0, accel_thread_proc, 0, 0, 0);
	return 0;
}

int stop_accel_acquisition (void)
{
	if (accel_thread == 0)
		return -1;

	stop_flag = TRUE;
		
	// Wait until the acquisition thread exits
	WaitForSingleObject(accel_thread, INFINITE);
		
	accel_thread = 0;

	if (new_sample_callback)
	{
		SysFreeString(new_sample_callback);
		new_sample_callback = 0;
	}

	return 0;
}


HRESULT accel_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"start"))
	{
		new_sample_callback = SysAllocString(callback_id);
		last_x = last_y = last_z = 0;	
		propagate_accel_sample();
		start_accel_acquisition();
		return S_OK;
	}

	if (!wcscmp(action, L"stop"))
	{
		stop_accel_acquisition();
		cordova_success_callback(callback_id, FALSE, NULL_MESSAGE);
		return S_OK;
	}

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(Accelerometer, L"Accelerometer", accel_exec, NULL, NULL)
