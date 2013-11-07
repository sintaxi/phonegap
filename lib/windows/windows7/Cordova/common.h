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

#define CORDOVA_REG_KEY	L"Software\\Intel\\Cordova"

typedef enum {
	WM_EXEC_JS_SCRIPT = WM_USER,
	WM_USER_ACCEL,
	WM_USER_COMPASS
};

#define ASSERT(x) if (!(x)) __debugbreak()

struct _TextBuf;
typedef struct _TextBuf *TextBuf;

TextBuf text_buf_new(void);

BOOL text_buf_append(TextBuf buf, const wchar_t *text);
BOOL text_buf_append_len(TextBuf buf, const wchar_t *text, size_t text_len);

wchar_t *text_buf_get(const TextBuf buf);
size_t text_buf_get_len(const TextBuf buf);

void text_buf_reset(TextBuf buf);
void text_buf_free(TextBuf buf);

void set_thread_name (DWORD thread_id, char* thread_name);

