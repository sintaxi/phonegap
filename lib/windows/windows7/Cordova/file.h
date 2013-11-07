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

#include <WTypes.h>

#include "shell.h"

typedef enum {
	FILE_NO_ERR = 0,
	NOT_FOUND_ERR,
	SECURITY_ERR,
	ABORT_ERR,
	NOT_READABLE_ERR,
	ENCODING_ERR,
	NO_MODIFICATION_ALLOWED_ERR,
	INVALID_STATE_ERR,
	SYNTAX_ERR,
	INVALID_MODIFICATION_ERR,
	QUOTA_EXCEEDED_ERR,
	TYPE_MISMATCH_ERR,
	PATH_EXISTS_ERR
} CordovaFsError;

CordovaFsError path_from_uri(wchar_t *uri, wchar_t *path, DWORD *len, BOOL must_exist, BOOL *is_dir);
wchar_t *make_entry(BOOL is_dir, wchar_t *root_path, wchar_t *rel_path);

DECLARE_CORDOVA_MODULE(File)