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

#ifndef __SHELL_H__
#define __SHELL_H__

#include <WTypes.h>
#include <OaIdl.h>

#define NULL_MESSAGE L"null"

typedef enum {
	CB_NO_RESULT = 0,
	CB_OK = 1,
	CB_CLASS_NOT_FOUND_EXCEPTION = 2,
	CB_ILLEGAL_ACCESS_EXCEPTION = 3,
	CB_INSTANTIATION_EXCEPTION = 4,
	CB_MALFORMED_URL_EXCEPTION = 5,
	CB_IO_EXCEPTION = 6,
	CB_INVALID_ACTION = 7,
	CB_JSON_EXCEPTION = 8,
	CB_GENERIC_ERROR = 9
} CallbackStatus;

typedef HRESULT (*module_exec_func) (BSTR callback_id, BSTR action, BSTR args, VARIANT *result);
typedef void (*module_close_func) (void);
typedef void (*module_init_func) (void);

struct _CordovaModule {
	BSTR module_id;
	module_exec_func exec;
	module_init_func init;
	module_close_func close;
	struct _CordovaModule *next;
};
typedef struct _CordovaModule CordovaModule;

#define CORDOVA_MODULE(name) &Cordova##name
#define DECLARE_CORDOVA_MODULE(name) extern CordovaModule Cordova##name;
#define DEFINE_CORDOVA_MODULE(name, id, exec_func, init_func, close_func) CordovaModule Cordova##name = { id, exec_func, init_func, close_func, NULL };

void cordova_success_callback(BSTR callback_id, BOOL keep_callback, const wchar_t *message);
void cordova_fail_callback(BSTR callback_id, BOOL keep_callback, CallbackStatus status, const wchar_t *message);

#endif
