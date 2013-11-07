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
#include <Shlobj.h>
#include <wchar.h>
#define CINTERFACE 1	// Get C definitions for COM header files

#include "lib/sqlite/sqlite3.h"
#include "storage.h"
#include "json.h"
#include "common.h"

#define DROP_QUERY L"drop"
#define ALTER_QUERY L"alter"
#define CREATE_QUERY L"create"
#define TRUNCATE_QUERY L"truncate"

struct _CordovaDb {
	sqlite3 *db;
	wchar_t *name;
	struct _CordovaDb *next;
};
typedef struct _CordovaDb CordovaDb;

static CordovaDb *db_list = NULL;

static CordovaDb *find_cordova_db(const wchar_t *name)
{
	CordovaDb *item = db_list;

	while (item != NULL) {
		if (!wcscmp(name, item->name))
			return item;

		item = item->next;
	}

	return NULL;
}

static void remove_cordova_db(CordovaDb *db)
{
	CordovaDb *item;

	if (db_list == db)
		db_list = NULL;
	else {
		item = db_list;
		while (item) {
			if (item->next == db) {
				item->next = db->next;
				break;
			}

			item = item->next;
		}
	}

	sqlite3_close(db->db);
	free(db->name);
	free(db);
}

static HRESULT remove_database(BSTR callback_id, BSTR args)
{
	wchar_t path[MAX_PATH];
	CordovaDb *cordova_db;
	JsonArray array;
	JsonItem item;
	wchar_t *db_name = NULL;

	if (db_list == NULL)
		goto out;

	// Extract db name
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_STRING,
											JSON_VALUE_INVALID)) {
		json_free_args(array);
		return E_FAIL;
	}
	item = json_array_get_first(array);

	if (json_get_value_type(item) != JSON_VALUE_STRING) {
		json_free_args(array);
		return E_FAIL;
	}
	db_name = json_get_string_value(item);
	json_free_args(array);

	// Find & remove
	cordova_db = find_cordova_db(db_name);
	if (cordova_db) {
		remove_cordova_db(cordova_db);

		if(!SUCCEEDED(SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, path))) 
			goto out;
		PathAppend(path, L"Cordova\\db");
		PathAppend(path, db_name);

		DeleteFile(path);
	}

out:
	if (db_name)
		free(db_name);

	return S_OK;
}

static HRESULT open_database(BSTR callback_id, BSTR args, VARIANT *result)
{
	int res;
	wchar_t path[MAX_PATH];
	sqlite3 *db;
	CordovaDb *cordova_db;
	JsonArray array;
	JsonItem item;
	wchar_t *db_name;

	if(!SUCCEEDED(SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, path))) 
		return E_FAIL;

	PathAppend(path, L"Cordova\\db");
	res = SHCreateDirectory(NULL,path);
	if(!SUCCEEDED(res) && (res != ERROR_FILE_EXISTS) && (res != ERROR_ALREADY_EXISTS))
		return E_FAIL;

		// Validate array contents
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_STRING,
											JSON_VALUE_STRING,
											JSON_VALUE_STRING,
											JSON_VALUE_INT,
											JSON_VALUE_INVALID)) {
		json_free_args(array);
		return E_FAIL;
	}
	item = json_array_get_first(array);

	db_name = json_get_string_value(item);
	json_free_args(array);

	cordova_db = find_cordova_db(db_name);
	if (cordova_db != NULL)
		db = cordova_db->db;
	else {
		PathAppend(path, db_name);
		res = sqlite3_open16((const char *) path, &db);
		if (res != SQLITE_OK) {
			sqlite3_close(db);
			free (db_name);
			return E_FAIL;
		}

		cordova_db = (CordovaDb *)calloc(1, sizeof(CordovaDb));
		cordova_db->db = db;
		cordova_db->name = db_name;
		cordova_db->next = db_list;

		db_list = cordova_db;
	}

	VariantInit(result);
	result->vt = VT_INT;
	result->intVal = (int) db;

	return S_OK;
}

static BOOL is_ddl(const wchar_t *query)
{
	if (!_wcsnicmp(query, DROP_QUERY, wcslen(DROP_QUERY)) ||
		!_wcsnicmp(query, ALTER_QUERY, wcslen(ALTER_QUERY)) ||
		!_wcsnicmp(query, CREATE_QUERY, wcslen(CREATE_QUERY)) ||
		!_wcsnicmp(query, TRUNCATE_QUERY, wcslen(TRUNCATE_QUERY)))
			return TRUE;

	return FALSE;
}

static HRESULT execute_sql(BSTR callback_id, BSTR args)
{
	HRESULT res = S_OK;
	sqlite3 *db;
	sqlite3_stmt *stmt = NULL;
	JsonArray array;
	JsonItem item;
	TextBuf response;
	wchar_t *tx_id = NULL;
	wchar_t *command = NULL;

	response = text_buf_new();

	// Validate array contents
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_INT,
											JSON_VALUE_STRING,
											JSON_VALUE_ARRAY,
											JSON_VALUE_STRING,
											JSON_VALUE_INVALID)) {
		res = E_FAIL;
		goto out;
	}

	item = json_array_item_at(array, 3);
	tx_id = json_get_string_value(item);

	item = json_array_get_first(array);
	db = (sqlite3 *) json_get_int_value(item);

	item = json_array_get_next(item);
	command = json_get_string_value(item);

	if (is_ddl(command)) {
		if (sqlite3_prepare16_v2(db, command, wcslen(command) * sizeof(wchar_t), &stmt, NULL) != SQLITE_OK) {
			cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.SYNTAX_ERR,message:\"Syntax error\"}");
			goto out;
		}
		if (sqlite3_step(stmt) != SQLITE_DONE) {
			cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.DATABASE_ERR,message:\"Database error\"}");
			goto out;
		}

		text_buf_append(response, L"{id:'");
		text_buf_append(response, tx_id);
		text_buf_append(response, L"',data:''}");

		cordova_success_callback(callback_id, FALSE, text_buf_get(response));
	} else {
		JsonItem sql_arg;
		int db_res = SQLITE_OK;
		int index = 1;

		// Prepare
		if (sqlite3_prepare16_v2(db, command, wcslen(command) * sizeof(wchar_t), &stmt, NULL) != SQLITE_OK) {
			cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.SYNTAX_ERR,message:\"Syntax error\"}");
			goto out;
		}

		// Bind arguments
		item = json_array_get_next(item);
		sql_arg = json_get_array_value(item);
		while (sql_arg != NULL) {
			switch (json_get_value_type(sql_arg)) {
			case JSON_VALUE_EMPTY:
				break;
			case JSON_VALUE_INT:
				db_res = sqlite3_bind_int(stmt, index, json_get_int_value(sql_arg));
				break;
			case JSON_VALUE_DOUBLE:
				db_res = sqlite3_bind_double(stmt, index, json_get_double_value(sql_arg));
				break;
			case JSON_VALUE_STRING:
				{
					wchar_t *str = json_get_string_value(sql_arg);
					db_res = sqlite3_bind_text16(stmt, index, str, wcslen(str) * sizeof(wchar_t), NULL);
					free(str);
					break;
				}
			case JSON_VALUE_NULL:
				db_res = sqlite3_bind_null(stmt, index);
				break;
			default:
				cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.SYNTAX_ERR,message:\"Syntax error\"}");
				goto out;
			}
			if (db_res != SQLITE_OK) {
				cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR,L"{code:SQLError.SYNTAX_ERR,message:\"Syntax error\"}");
				goto out;
			}

			sql_arg = json_array_get_next(sql_arg);
			index++;
		}

		// Execute & prepare response
		text_buf_append(response, L"{id:'");
		text_buf_append(response, tx_id);
		text_buf_append(response, L"',data:[");

		db_res = sqlite3_step(stmt);
		if (db_res == SQLITE_ROW) {
			do {
				int j;

				text_buf_append(response, L"{");
				for (j = 0; j < sqlite3_column_count(stmt); j++) {
					if (j > 0)
						text_buf_append(response, L",");

					text_buf_append(response, L"\"");
					text_buf_append(response, (wchar_t *) sqlite3_column_name16(stmt, j));
					text_buf_append(response, L"\":");
					if (sqlite3_column_type(stmt, j) == SQLITE_INTEGER) {
						static wchar_t number[20];
						swprintf(number, 19, L"%d", sqlite3_column_int(stmt, j));
						text_buf_append(response, number);
					} else if (sqlite3_column_type(stmt, j) == SQLITE_TEXT) {
						text_buf_append(response, L"\"");
						text_buf_append(response, (wchar_t *) sqlite3_column_text16(stmt, j));
						text_buf_append(response, L"\"");
					} else if (sqlite3_column_type(stmt, j) == SQLITE_NULL) {
						text_buf_append(response, L"null");
					} else {
						cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.DATABASE_ERR,message:\"Database error\"}");
						goto out;
					}
				}
				text_buf_append(response, L"}");

				// Next
				db_res = sqlite3_step(stmt);
				if (db_res == SQLITE_ROW)
					text_buf_append(response, L",");
			} while (db_res == SQLITE_ROW);
		} else if (db_res != SQLITE_DONE) {
			cordova_fail_callback(callback_id, FALSE, CB_GENERIC_ERROR, L"{code:SQLError.DATABASE_ERR,message:\"Database error\"}");
			goto out;
		}

		text_buf_append(response, L"]}");

		// Success
		cordova_success_callback(callback_id, FALSE, text_buf_get(response));
	}

out:
	json_free_args(array);
	if (stmt)
		sqlite3_finalize(stmt);
	text_buf_free(response);
	if (tx_id)
		free(tx_id);
	if (command)
		free(command);

	return res;
}

HRESULT storage_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"openDatabase"))
		return open_database(callback_id, args, result);
	if (!wcscmp(action, L"removeDatabase"))
		return remove_database(callback_id, args);
	if (!wcscmp(action, L"executeSql"))
		return execute_sql(callback_id, args);

	return DISP_E_MEMBERNOTFOUND;
}

void storage_close(void)
{
	while (db_list != NULL) {
		CordovaDb *item;

		sqlite3_close(db_list->db);
		free(db_list->name);

		item = db_list;
		db_list = db_list->next;

		free(item);
	}
}

DEFINE_CORDOVA_MODULE(Storage, L"Storage", storage_exec, NULL, storage_close)