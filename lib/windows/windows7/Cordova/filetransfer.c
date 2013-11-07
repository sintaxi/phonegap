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
#include <Shlwapi.h>
#include <WinInet.h>
#include <stdio.h>

#include "filetransfer.h"
#include "common.h"
#include "file.h"
#include "json.h"

#pragma comment(lib, "wininet.lib")


#define CHUNK_SIZE (1024 * 1024) // 1 MB

#define BOUNDARY "--------------------------cordova"

#define _WIDE_CHAR(text) L##text
#define WIDE_CHAR(text) _WIDE_CHAR(text)

typedef enum {
	TRANSFER_NO_ERR = 0,
	FILE_NOT_FOUND_ERR,
	INVALID_URL_ERR,
	CONNECTION_ERR
} FileTransferError;

static void file_transfer_fail_callback(wchar_t *callback_id, wchar_t *src, wchar_t *target, DWORD http_status, FileTransferError err)
{
	const wchar_t *format = L"{code:%d,source:'%s',target:'%s',http_status:%d}";
	wchar_t *error_text;

	error_text = (wchar_t *) malloc(sizeof(wchar_t) * (1 + wcslen(format) + 2 + wcslen(src) + wcslen(target) + 5));
	wsprintf(error_text, format, err, src, target, http_status);

	cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, error_text);

	free(error_text);
}

static HRESULT download(BSTR callback_id, BSTR args)
{
	HRESULT res = S_OK;
	JsonArray array;
	JsonItem item;
	CordovaFsError fs_err;
	wchar_t *src_uri = NULL;
	wchar_t *dst_uri = NULL;
	HINTERNET inet = NULL;
	HINTERNET file = NULL;
	DWORD context = (DWORD) callback_id;
	DWORD read;
	HANDLE local_file = INVALID_HANDLE_VALUE;
	wchar_t *entry;
	DWORD index = 0;
	DWORD status;
	DWORD status_len = sizeof(status);
	wchar_t full_path[MAX_PATH + 1];
	DWORD full_path_size;
	BYTE *buf = NULL;

	// Validate array contents
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_STRING,		// 0- source uri
											JSON_VALUE_STRING,				// 1- target path
											JSON_VALUE_INVALID)) {
		res = E_FAIL;
		goto out;
	}

	// Get args
	item = json_array_get_first(array);
	src_uri = json_get_string_value(item);
	item = json_array_get_next(item);
	dst_uri = json_get_string_value(item);

	// Check target path
	full_path_size = MAX_PATH;
	fs_err = path_from_uri(dst_uri, full_path, &full_path_size, FALSE, NULL);
	if (fs_err != FILE_NO_ERR) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, FILE_NOT_FOUND_ERR);
		goto out;
	}

	// Open source url
	inet = InternetOpen(L"Cordova", INTERNET_OPEN_TYPE_PRECONFIG, NULL, NULL, 0);
	if (!inet) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	file = InternetOpenUrl(inet, src_uri, NULL, 0, 0, context);
	if (!file) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, INVALID_URL_ERR);
		goto out;
	}

	if (!HttpQueryInfo(file, HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER, &status, &status_len, &index)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}
	if (status != 200) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, status, CONNECTION_ERR);
		goto out;
	}

	// Create local file
	local_file = CreateFile(full_path, GENERIC_WRITE, 0, NULL, OPEN_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
	if (local_file == INVALID_HANDLE_VALUE) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, FILE_NOT_FOUND_ERR);
		goto out;
	}

	// Read data
	buf = (BYTE *) malloc(CHUNK_SIZE);
	read = 0;
	while (InternetReadFile(file, buf, CHUNK_SIZE, &read)) {
		DWORD written;

		if (read == 0)
			break;

		if (!WriteFile(local_file, buf, read, &written, NULL)) {
			file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, FILE_NOT_FOUND_ERR);
			goto out;
		}
	}
	if (GetLastError() != ERROR_SUCCESS) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	// Return entry
	entry = make_entry(FALSE, full_path, NULL);
	cordova_success_callback(callback_id, FALSE, entry);
	free(entry);

out:
	json_free_args(array);
	if (local_file != INVALID_HANDLE_VALUE)
		CloseHandle(local_file);
	if (file)
		InternetCloseHandle(file);
	if (inet)
		InternetCloseHandle(inet);
	if (src_uri)
		free(src_uri);
	if (dst_uri)
		free(dst_uri);
	if (buf)
		free(buf);

	return res;
}

static int get_internet_port(const wchar_t *uri)
{
	wchar_t inet_buf[INTERNET_MAX_PORT_NUMBER_LENGTH + 1];
	DWORD size = INTERNET_MAX_PORT_NUMBER_LENGTH;
	int res = INTERNET_DEFAULT_HTTP_PORT;

	// Try to get explicit port number
	if (UrlGetPart(uri, inet_buf, &size, URL_PART_PORT, 0) != S_OK) {
		// Or default to scheme port 
		if (UrlGetPart(uri, inet_buf, &size, URL_PART_SCHEME, 0) == S_OK) {
			if (!wcscmp(inet_buf, L"https"))
				res = INTERNET_DEFAULT_HTTPS_PORT;
		}
	} else
		swscanf_s(inet_buf, L"%d", &res);

	return res;
}

static const wchar_t *find_oject_name(const wchar_t *uri)
{
	wchar_t inet_buf[INTERNET_MAX_SCHEME_LENGTH + 1];
	DWORD size = INTERNET_MAX_SCHEME_LENGTH;
	unsigned int pos = 0;

	if (UrlGetPart(uri, inet_buf, &size, URL_PART_SCHEME, 0) == S_OK)
		pos += wcslen(inet_buf) + 3;

	while (pos < wcslen(uri) && uri[pos] != L'/')
		pos++;

	return (uri + pos);
}

static HRESULT upload(BSTR callback_id, BSTR args)
{
	HRESULT res = S_OK;
	JsonArray array;
	JsonItem item;
	JsonObjectItem param;
	CordovaFsError fs_err;
	wchar_t *item_val;
	size_t item_len;
	wchar_t *src_uri = NULL;
	wchar_t *dst_uri = NULL;
	wchar_t full_path[MAX_PATH + 1];
	wchar_t server_name[INTERNET_MAX_HOST_NAME_LENGTH + 1];
	wchar_t user_name[INTERNET_MAX_USER_NAME_LENGTH + 1];
	wchar_t passwd[INTERNET_MAX_PASSWORD_LENGTH + 1];
	BOOL is_dir;
	HINTERNET inet = NULL;
	HINTERNET server = NULL;
	HINTERNET req = NULL;
	DWORD context = (DWORD) callback_id;
	TextBuf txt_buf = NULL;
	char *utf8_text = NULL;
	int utf8_len;
	DWORD written;
	HANDLE file = INVALID_HANDLE_VALUE;
	const char *end_contents = "\r\n--" BOUNDARY "--\r\n";
	ULARGE_INTEGER file_size;
	DWORD index = 0;
	DWORD status;
	DWORD status_len = sizeof(status);
	DWORD size;
	BYTE *buf = NULL;

	// Validate array contents
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_STRING,			// 0- file path
											JSON_VALUE_STRING,					// 1- server
											JSON_VALUE_STRING | JSON_VALUE_NULL,// 2- file key
											JSON_VALUE_STRING | JSON_VALUE_NULL,// 3- file name
											JSON_VALUE_STRING | JSON_VALUE_NULL,// 4- mime type
											JSON_VALUE_OBJECT | JSON_VALUE_NULL,// 5- params (key/value pairs)
											JSON_VALUE_BOOL | JSON_VALUE_NULL,	// 6- trust all hosts
											JSON_VALUE_BOOL | JSON_VALUE_NULL,	// 7- chunkedMode
											JSON_VALUE_INVALID)) {
		res = E_FAIL;
		goto out;
	}

	// Get source & target uri
	item = json_array_get_first(array);
	src_uri = json_get_string_value(item);
	item = json_array_get_next(item);
	dst_uri = json_get_string_value(item);

	// Check source path
	size = MAX_PATH;
	fs_err = path_from_uri(src_uri, full_path, &size, TRUE, &is_dir);
	if (fs_err != FILE_NO_ERR || is_dir) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, FILE_NOT_FOUND_ERR);
		goto out;
	}

	file = CreateFile(full_path, GENERIC_READ, 0, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (file == INVALID_HANDLE_VALUE) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	file_size.LowPart = GetFileSize(file, &file_size.HighPart);

	// Connect to server
	inet = InternetOpen(L"Cordova", INTERNET_OPEN_TYPE_PRECONFIG, NULL, NULL, 0);
	if (!inet) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	size = INTERNET_MAX_HOST_NAME_LENGTH;
	UrlGetPart(dst_uri, server_name, &size, URL_PART_HOSTNAME, 0);
	size = INTERNET_MAX_USER_NAME_LENGTH;
	UrlGetPart(dst_uri, user_name, &size, URL_PART_USERNAME, 0);
	size = INTERNET_MAX_PASSWORD_LENGTH;
	UrlGetPart(dst_uri, passwd, &size, URL_PART_PASSWORD, 0);
	server = InternetConnect(inet, server_name, get_internet_port(dst_uri), user_name, passwd, INTERNET_SERVICE_HTTP, 0, 0);
	if (!server) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, INVALID_URL_ERR);
		goto out;
	}

	// Build send request
	req = HttpOpenRequest(server, L"POST", find_oject_name(dst_uri), NULL, NULL, NULL, 0, context);
	if (!req) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, INVALID_URL_ERR);
		goto out;
	}

	// 1- Headers
	buf = (BYTE *) malloc(CHUNK_SIZE);
	txt_buf = text_buf_new();

	text_buf_append(txt_buf, L"Content-Type: multipart/form-data; boundary=" WIDE_CHAR(BOUNDARY));
	if (!HttpAddRequestHeaders(req, text_buf_get(txt_buf), text_buf_get_len(txt_buf), HTTP_ADDREQ_FLAG_ADD)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto end_req;
	}

	item = json_array_item_at(array, 5);
	if (json_get_value_type(item) != JSON_VALUE_NULL) {
		param = json_get_object_value(item);
		while (param && json_get_value_type(to_item(param)) != JSON_VALUE_EMPTY) {
			wchar_t *tag;

			tag = json_object_get_prop_id(param);
			item_val = json_get_string_value(to_item(param));

			text_buf_reset(txt_buf);
			text_buf_append_len(txt_buf, tag, wcslen(tag)); 
			text_buf_append(txt_buf, L":\"");
			text_buf_append_len(txt_buf, item_val, wcslen(item_val)); 
			text_buf_append(txt_buf, L"\"");

			free(tag);
			free(item_val);

			if (!HttpAddRequestHeaders(req, text_buf_get(txt_buf), text_buf_get_len(txt_buf), HTTP_ADDREQ_FLAG_ADD)) {
				file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
				goto out;
			}

			param = json_object_get_next(param);
		}
	}

	// 2- Contents
	// 2.1 Contents headers
	text_buf_reset(txt_buf);
	text_buf_append(txt_buf, L"--" WIDE_CHAR(BOUNDARY) L"\r\nContent-Disposition: form-data; name=\"");

	item = json_array_item_at(array, 2);
	if (json_get_value_type(item) == JSON_VALUE_NULL)
		item_val = _wcsdup(L"uploaded_name");
	else
		item_val = json_get_string_value(item);
	item_len = wcslen(item_val);
	text_buf_append_len(txt_buf, item_val, item_len); 
	text_buf_append(txt_buf, L"\"; filename=\"");
	free(item_val);

	item = json_array_item_at(array, 3);
	if (json_get_value_type(item) == JSON_VALUE_NULL)
		item_val = _wcsdup(L"uploaded_file");
	else
		item_val = json_get_string_value(item);
	item_len = wcslen(item_val);
	text_buf_append_len(txt_buf, item_val, item_len); 
	text_buf_append(txt_buf, L"\"\r\nContent-Type: ");
	free(item_val);

	item = json_array_item_at(array, 4);
	if (json_get_value_type(item) == JSON_VALUE_NULL)
		item_val = _wcsdup(L"application/octet-stream");
	else
		item_val = json_get_string_value(item);
	item_len = wcslen(item_val);
	text_buf_append_len(txt_buf, item_val, item_len); 
	text_buf_append(txt_buf, L"\r\n\r\n");
	free(item_val);

	utf8_len = WideCharToMultiByte(CP_UTF8, 0, text_buf_get(txt_buf), text_buf_get_len(txt_buf), NULL, 0, NULL, NULL); // First call to get length
	utf8_text = (char *) malloc(utf8_len + 1);
	if (!WideCharToMultiByte(CP_UTF8, 0, text_buf_get(txt_buf), text_buf_get_len(txt_buf), utf8_text, utf8_len, NULL, NULL)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto end_req;
	}

	wsprintf((wchar_t *) buf, L"Content-Length: %I64d", file_size.QuadPart + utf8_len + strlen(end_contents));
	if (!HttpAddRequestHeaders(req, (wchar_t *) buf, wcslen((wchar_t *) buf), HTTP_ADDREQ_FLAG_ADD)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto end_req;
	}

	if (!HttpSendRequestEx(req, NULL, NULL, 0, context)) {
			file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
			goto end_req;
	}

	if (!InternetWriteFile(req, utf8_text, utf8_len, &written)) {
			file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
			goto end_req;
	}

	// 2.2 Contents data
	do {
		if (!ReadFile(file, buf, CHUNK_SIZE, &size, NULL)) {
			file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
			goto out;
		}

		if (size == 0)
			break;

		if (!InternetWriteFile(req, buf, size, &written)) {
			file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
			goto end_req;
		}
	} while (TRUE);

	// 2.3 Contents footer
	if (!InternetWriteFile(req, end_contents, strlen(end_contents), &written)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto end_req;
	}

end_req:

	// Close request
	if (!HttpEndRequest(req, NULL, 0, 0)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	if (!HttpQueryInfo(req, HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER, &status, &status_len, &index)) {
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, 0, CONNECTION_ERR);
		goto out;
	}

	if (status != 200) { // Either failure
		file_transfer_fail_callback(callback_id, src_uri, dst_uri, status, CONNECTION_ERR);
		goto out;
	} else { // Or success
		text_buf_reset(txt_buf);
		text_buf_append(txt_buf, L"{responseCode:200,response:'");
		((wchar_t *) buf)[0] = 0;
		InternetReadFile(req, buf, CHUNK_SIZE - 1, &size);
		((wchar_t *) buf)[size] = 0;
		text_buf_append(txt_buf, (wchar_t *) buf);
		text_buf_append(txt_buf, L"',bytesSent:");
		wsprintf((wchar_t *) buf, L"%I64d", file_size.QuadPart);
		text_buf_append(txt_buf, (wchar_t *) buf);
		text_buf_append(txt_buf, L"}");

		cordova_success_callback(callback_id, FALSE, text_buf_get(txt_buf));
	}

out:
	json_free_args(array);
	if (req)
		InternetCloseHandle(req);
	if (server)
		InternetCloseHandle(server);
	if (inet)
		InternetCloseHandle(inet);
	if (src_uri)
		free(src_uri);
	if (dst_uri)
		free(dst_uri);
	if (buf)
		free(buf);
	if (txt_buf)
		text_buf_free(txt_buf);
	if (utf8_text)
		free(utf8_text);
	if (file != INVALID_HANDLE_VALUE)
		CloseHandle(file);

	return res;
}

HRESULT file_transfer_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"download"))
			return download(callback_id, args);
	if (!wcscmp(action, L"upload"))
			return upload(callback_id, args);

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(FileTransfer, L"FileTransfer", file_transfer_exec, NULL, NULL)