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
#include <malloc.h>
#include <wchar.h>

#include "common.h"

#define TEXT_BUF_INC_SIZE 100

struct _TextBuf {
	wchar_t *wbuf;
	size_t len;
	size_t max;
};

TextBuf text_buf_new(void)
{
	return (TextBuf) calloc(1, sizeof(struct _TextBuf));
}

BOOL text_buf_append_len(TextBuf buf, const wchar_t *text, size_t text_len)
{
	size_t inc = (text_len > TEXT_BUF_INC_SIZE) ? text_len : TEXT_BUF_INC_SIZE;

	// If needed, increase buf size
	if (buf->len + text_len >= buf->max) {
		void *ptr = realloc(buf->wbuf, sizeof(wchar_t) * (buf->max + inc + 1));
		if (!ptr)
			return FALSE;
		buf->wbuf = (wchar_t *) ptr;
	
		buf->max += inc;
	}

	if (buf->len == 0)
		buf->wbuf[0] = 0;

	wcsncat_s(buf->wbuf + buf->len, buf->max - buf->len, text, text_len);
	buf->len += text_len;
	buf->wbuf[buf->len] = 0;

	return TRUE;
}

BOOL text_buf_append(TextBuf buf, const wchar_t *text)
{
	return text_buf_append_len(buf, text, wcslen(text));
}

wchar_t *text_buf_get(const TextBuf buf)
{
	return buf->wbuf;
}

size_t text_buf_get_len(const TextBuf buf)
{
	return buf->len;
}

void text_buf_reset(TextBuf buf)
{
	buf->len = 0;
}

void text_buf_free(TextBuf buf)
{
	if (buf->wbuf)
		free(buf->wbuf);
	free(buf);
}

// Thread naming utility - see http://msdn.microsoft.com/en-us/library/xcb2z8hs%28VS.90%29.aspx

const DWORD MS_VC_EXCEPTION=0x406D1388;

#pragma pack(push,8)
typedef struct tagTHREADNAME_INFO
{
   DWORD dwType; // Must be 0x1000.
   LPCSTR szName; // Pointer to name (in user addr space).
   DWORD dwThreadID; // Thread ID (-1=caller thread).
   DWORD dwFlags; // Reserved for future use, must be zero.
} THREADNAME_INFO;
#pragma pack(pop)

void set_thread_name (DWORD thread_id, char* thread_name)
{
   THREADNAME_INFO info;
   info.dwType = 0x1000;
   info.szName = thread_name;
   info.dwThreadID = thread_id;
   info.dwFlags = 0;

   __try
   {
      RaiseException( MS_VC_EXCEPTION, 0, sizeof(info)/sizeof(ULONG_PTR), (ULONG_PTR*)&info );
   }
   __except(EXCEPTION_EXECUTE_HANDLER)
   {
   }
}