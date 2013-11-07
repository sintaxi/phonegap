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

#define _WIN32_WINNT 0x0600	// Get access to GetIfEntry2 (Vista and newer), so we can distinguish hardware network interfaces from software ones

#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#include <ws2def.h> 
#include <ws2ipdef.h>
#include <iphlpapi.h>

#pragma comment(lib, "IPHLPAPI.lib")

#include "network.h"

//-------------------------------------------------------------------------------------------------

// Determine type of the first network interface that's up
static HRESULT get_network_interface_type (BSTR callback_id)
{
	int if_type = 0;
	MIB_IF_TABLE2 *if_table = 0;
	unsigned int i;
	wchar_t *type_as_text;

	// Retrieve list of network interfaces ; return -1 in case of error
	if (GetIfTable2(&if_table))
		goto outahere;

	// Look for an active ethernet interface
	for (i = 0; i < if_table->NumEntries; i++)
		if (if_table->Table[i].InterfaceAndOperStatusFlags.HardwareInterface && if_table->Table[i].OperStatus == IfOperStatusUp && if_table->Table[i].Type == IF_TYPE_ETHERNET_CSMACD)
		{
			if_type = IF_TYPE_ETHERNET_CSMACD;
			goto outahere;
		}

	// Look for wifi
	for (i = 0; i < if_table->NumEntries; i++)
		if (if_table->Table[i].InterfaceAndOperStatusFlags.HardwareInterface && if_table->Table[i].OperStatus == IfOperStatusUp && if_table->Table[i].Type == IF_TYPE_IEEE80211)
		{
			if_type = IF_TYPE_IEEE80211;
			goto outahere;
		}

	// Look for anything marked as physical and up
	for (i = 0; i < if_table->NumEntries; i++)
		if (if_table->Table[i].InterfaceAndOperStatusFlags.HardwareInterface && if_table->Table[i].OperStatus == IfOperStatusUp)
		{
			if_type = if_table->Table[i].Type;
			break;
		}

outahere:
	// The returned value is 0 if there aren't any active interface, or one of the IF_TYPE_* codes from ipifcons.h
	if (if_table)
		FreeMibTable(if_table);

	switch (if_type)
	{
		case 0:
			type_as_text = L"'none'";
			break;

		case IF_TYPE_ETHERNET_CSMACD:
			type_as_text = L"'ethernet'";
			break;

		case IF_TYPE_IEEE80211:
			type_as_text = L"'wifi'";
			break;

		default:
			type_as_text = L"'unknown'";
			break;
	}

	cordova_success_callback(callback_id, FALSE, type_as_text);

	return S_OK;
}

HRESULT network_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"getConnectionInfo"))
			return get_network_interface_type(callback_id);

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(Network, L"NetworkStatus", network_exec, NULL, NULL)