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

#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#include <wchar.h>
#include <rpc.h>

#pragma comment(lib,"rpcrt4.lib")

// GetComputerName
// GetVersionEx

#include "shell.h"
#include "device.h"
#include "common.h"

#define CORDOVA_MACHINE_ID		L"MachineID"
#define CORDOVA_VERSION			L"2.1.0"
#define CORDOVA_VERSION_LEN		5

// A valid UUID string should look like this: f7b38bf1-2ece-4e2a-94a6-e791863f0109

#define UUID_BUF_LEN_IN_BYTES (sizeof(wchar_t) * UUID_BUF_LEN)

static wchar_t uuid[UUID_BUF_LEN];

wchar_t *get_device_uuid(void)
{
	return uuid;
}

int acquire_unique_id(wchar_t buf[UUID_BUF_LEN])
{
	DWORD info;
	HKEY key;
	LONG ret;
	DWORD len;
	RPC_WSTR string;  
	RPC_STATUS status;
	UUID uuid;
	DWORD type;

	// Check if a previous run generated an ID and recorded it
	buf[0] = L'\0';

	ret = RegCreateKeyEx(HKEY_CURRENT_USER, CORDOVA_REG_KEY, 0, 0, 0, KEY_READ | KEY_WRITE, 0, &key, &info);

	if (ret != ERROR_SUCCESS)
		return -1;

	if (info == REG_OPENED_EXISTING_KEY)
	{
		len = UUID_BUF_LEN_IN_BYTES;

		ret = RegQueryValueEx(key, CORDOVA_MACHINE_ID, 0, &type, (LPBYTE) buf, &len);

		// If we read something that looks good
		if (ret == ERROR_SUCCESS && UuidFromString(buf, &uuid) == RPC_S_OK)
		{
			// Return successfully
			RegCloseKey(key);
			return 0;
		}
	}

	// Generate a new id - we're willing to accept ids that are not guaranteed to be globally unique
	status = UuidCreate(&uuid);

	if  (status == RPC_S_OK || status == RPC_S_UUID_LOCAL_ONLY)
	{
		UuidToString (&uuid, &string);

		wmemcpy(buf, string, UUID_BUF_LEN);

		RpcStringFree(&string);

		// Store it
		len = UUID_BUF_LEN_IN_BYTES;
		RegSetValueEx(key, CORDOVA_MACHINE_ID, 0, REG_SZ, (LPBYTE) buf, len);

		// There's a slight chance of race condition here ; in that case several different ids would be returned by concurrent executions
		// That can be avoided using a named mutex if that turns out to be a problem

		RegCloseKey(key);
		return 0;
	}

	RegCloseKey(key);
	return -1;
}


static HRESULT get_device_info(BSTR callback_id)
{
	// Set initial Cordova global variables and fire up deviceready event
	static wchar_t buf[100 + UUID_BUF_LEN + COMPUTER_NAME_BUF_LEN + CORDOVA_VERSION_LEN];
	wchar_t computer_name[COMPUTER_NAME_BUF_LEN];
	DWORD len = COMPUTER_NAME_BUF_LEN;
	OSVERSIONINFOEX osver;
	wchar_t* platform = L"Windows";

	computer_name[0] = L'\0';
	GetComputerName(computer_name, &len);

	osver.dwOSVersionInfoSize = sizeof(osver);
	GetVersionEx((LPOSVERSIONINFO)&osver);

	wsprintf(buf, L"{uuid:'%s',name:'%s',platform:'%s',version:'%d.%d',cordova:'%s'}",
				uuid, computer_name, platform, osver.dwMajorVersion, osver.dwMinorVersion, CORDOVA_VERSION);

	cordova_success_callback(callback_id, FALSE, buf);

	return S_OK;
}

HRESULT device_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"getDeviceInfo"))
			return get_device_info(callback_id);

	return DISP_E_MEMBERNOTFOUND;
}

static void device_module_init(void)
{
	acquire_unique_id(uuid);
}

DEFINE_CORDOVA_MODULE(Device, L"Device", device_exec, device_module_init, NULL)