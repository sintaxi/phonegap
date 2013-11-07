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

#include <wchar.h>
#include <assert.h>

#include "json.h"

#define JSON_TRUE	L"true"
#define JSON_FALSE	L"false"
#define JSON_NULL	L"null"

struct _JsonItem {
	// Common fields
	JsonValueType value_type;
	union {
		wchar_t *as_string;
		int as_int;
		INT64 as_int64;
		double as_double;
		BOOL as_bool;
		JsonArray as_array;
		JsonObject as_object;
	} value;
	size_t value_as_string_len;
	struct _JsonItem *next;
};

struct _JsonObjectItem {
	// Common fields
	JsonValueType value_type;
	union {
		wchar_t *as_string;
		int as_int;
		double as_double;
		JsonArray as_array;
		JsonObject as_object;
	} value;
	size_t value_as_string_len;
	struct _JsonItem *next;
	// Specific fields
	wchar_t *tag;
	size_t tag_len;
};

struct _JsonCursor {
	wchar_t *buf;
	size_t max;
	size_t pos;
};
typedef struct _JsonCursor JsonCursor;

static BOOL json_parse_array(JsonCursor *cursor, JsonArray array);
static BOOL json_parse_object(JsonCursor *cursor, JsonObject object);

static void json_init_cursor(wchar_t * buf, JsonCursor *cursor)
{
	memset((void *)cursor, 0, sizeof(JsonCursor));
	cursor->buf = buf;
	cursor->max = wcslen(buf);
}

static BOOL json_parse_string(JsonCursor *cursor, JsonItem item)
{
	wchar_t *buf = cursor->buf;
	BOOL escape;

	cursor->pos++; // Initial '"'
	item->value.as_string = buf + cursor->pos;
	while (cursor->pos < cursor->max) {
		if (buf[cursor->pos] == '"' && !escape) {
			cursor->pos++; // Trailing '"'
			break;
		}

		if (buf[cursor->pos] == '\\' && !escape)
			escape = TRUE;
		else
			escape = FALSE;

		cursor->pos++;
		item->value_as_string_len++;
	}

	return (cursor->pos == cursor->max) ? FALSE : TRUE;
}

static BOOL json_parse_number(JsonCursor *cursor, JsonItem item)
{
	wchar_t *buf = cursor->buf;
	wchar_t *value = buf + cursor->pos;
	size_t value_len = 0;
	BOOL has_dot = (buf[cursor->pos] == '.') ? TRUE : FALSE;
	INT64 val64;

	cursor->pos++;
	value_len++;
	while (cursor->pos < cursor->max) {
		if (buf[cursor->pos] == '.') {
			if (has_dot)
				return FALSE;
			else
				has_dot = TRUE;
		} else if (!iswdigit(buf[cursor->pos]))
			break;

		cursor->pos++;
		value_len++;
	}

	if (cursor->pos == cursor->max)
		return FALSE;

	item->value_type = (has_dot) ? JSON_VALUE_DOUBLE : JSON_VALUE_INT;
	if (item->value_type == JSON_VALUE_INT) {
		if (_snwscanf_s(value, value_len, L"%I64d", &val64) != 1)
			return FALSE;
		if (val64 > MAXINT) {
			item->value.as_int64 = val64;
			item->value_type = JSON_VALUE_INT64;
		} else
			item->value.as_int = (int) val64;
			item->value.as_int64 = val64;
	} else {
		if (_snwscanf_s(value, value_len, L"%f", &item->value.as_double) != 1)
			return FALSE;
	}

	return TRUE;
}

static BOOL json_parse_value(JsonCursor *cursor, JsonItem item)
{
	wchar_t *buf = cursor->buf;

	if (buf[cursor->pos] == '\"') {
		item->value_type = JSON_VALUE_STRING;
		return json_parse_string(cursor, item);
	} else if (iswdigit(buf[cursor->pos]) || buf[cursor->pos] == '-' || buf[cursor->pos] == '.') {
		return json_parse_number(cursor, item);
	} else if (buf[cursor->pos] == '[') {
		item->value_type = JSON_VALUE_ARRAY;
		item->value.as_array = (JsonArray) calloc(1, sizeof(struct _JsonItem));
		return json_parse_array(cursor, item->value.as_array);
	}  else if (buf[cursor->pos] == '{') {
		item->value_type = JSON_VALUE_OBJECT;
		item->value.as_object = (JsonObject) calloc(1, sizeof(struct _JsonObjectItem));
		return json_parse_object(cursor, item->value.as_object);
	} else if ((cursor->pos + wcslen(JSON_TRUE)) < cursor->max && !wcsncmp(buf + cursor->pos, JSON_TRUE, wcslen(JSON_TRUE))) {
		item->value_type = JSON_VALUE_BOOL;
		item->value.as_bool = TRUE;
		cursor->pos += wcslen(JSON_TRUE);
		return TRUE;
	} else if ((cursor->pos + wcslen(JSON_FALSE)) < cursor->max && !wcsncmp(buf + cursor->pos, JSON_FALSE, wcslen(JSON_FALSE))) {
		item->value_type = JSON_VALUE_BOOL;
		item->value.as_bool = FALSE;
		cursor->pos += wcslen(JSON_FALSE);
		return TRUE;
	} else if ((cursor->pos + wcslen(JSON_NULL)) < cursor->max && !wcsncmp(buf + cursor->pos, JSON_NULL, wcslen(JSON_NULL))) {
		item->value_type = JSON_VALUE_NULL;
		item->value.as_string = buf + cursor->pos;
		item->value_as_string_len = wcslen(JSON_NULL);
		cursor->pos += item->value_as_string_len;
		return TRUE;
	}

	return FALSE;
}

static BOOL json_parse_object(JsonCursor *cursor, JsonObject object)
{
	wchar_t *buf = cursor->buf;
	struct _JsonObjectItem *item = (struct _JsonObjectItem *) object;

	cursor->pos++;
	if (buf[cursor->pos] == '}') {
		cursor->pos++;
		item->value_type = JSON_VALUE_EMPTY;
		return TRUE;
	}

	while (cursor->pos < cursor->max) {
		if (buf[cursor->pos] != '\"')
			return FALSE;

		// Tag
		cursor->pos++;
		item->tag = buf + cursor->pos;
		while (cursor->pos < cursor->max && buf[cursor->pos] != '\"') {
			cursor->pos++;
			item->tag_len++;
		}
		if (cursor->pos == cursor->max)
			return FALSE;

		// Seprator
		cursor->pos++;
		if (buf[cursor->pos] != ':')
			return FALSE;

		// Value
		cursor->pos++;
		if(!json_parse_value(cursor, (JsonItem) item))
			return FALSE;

		// Next
		if (buf[cursor->pos] == '}') {
			cursor->pos++;
			break;
		}
		if (buf[cursor->pos] != ',')
			return FALSE;

		cursor->pos++;
		item->next = (JsonItem) calloc(1, sizeof(struct _JsonObjectItem));
		item = (JsonObjectItem) item->next;
	}

	return TRUE;
}

static BOOL json_parse_array(JsonCursor *cursor, JsonArray item)
{
	wchar_t *buf = cursor->buf;

	if (buf[cursor->pos] != '[')
		return FALSE;

	cursor->pos++;
	if (buf[cursor->pos] == ']') {
		cursor->pos++;
		item->value_type = JSON_VALUE_EMPTY;
		return TRUE;
	}

	while (cursor->pos < cursor->max) {
		if (!json_parse_value(cursor, (JsonItem) item))
			return FALSE;

		// Next
		if (buf[cursor->pos] == ']') {
			cursor->pos++;
			break;
		}
		if (buf[cursor->pos] != ',')
			return FALSE;

		cursor->pos++;
		item->next = (JsonItem) calloc(1, sizeof(struct _JsonItem));
		item = (JsonItem) item->next;
	}

	return TRUE;
}

BOOL json_parse_args(wchar_t * buf, JsonArray *item)
{
	JsonCursor cursor;
	BOOL success;

	json_init_cursor(buf, &cursor);

	*item = (JsonArray) calloc(1, sizeof(struct _JsonItem));
	success = json_parse_array(&cursor, *item);
	if (success && cursor.pos == cursor.max)
		return TRUE;

	return FALSE;
}

static void json_free_item(JsonItem item)
{
	JsonItem current;

	while (item != NULL) {
		current = item;
		switch (item->value_type) {
		case JSON_VALUE_ARRAY:
			json_free_item((JsonItem) current->value.as_array);
			break;
		case JSON_VALUE_OBJECT:
			json_free_item((JsonItem) current->value.as_object);
			break;
		default:
			break;
		}

		item = item->next;
		free(current);
	}
}

void json_free_args(JsonArray item)
{
	json_free_item((JsonItem) item);
}

JsonItem json_array_get_next(JsonItem item)
{
	return item->next;
}

JsonValueType json_get_value_type(JsonItem item)
{
	return item->value_type;
}

int json_get_int_value(JsonItem item)
{
	return item->value.as_int;
}

INT64 json_get_int64_value(JsonItem item)
{
	return item->value.as_int64;
}

BOOL json_get_bool_value(JsonItem item)
{
	return item->value.as_bool;
}

double json_get_double_value(JsonItem item)
{
	return item->value.as_double;
}

static wchar_t decode_unicode_char(const wchar_t *text)
{
	wchar_t val = 0;
	int i;
	const BYTE *buf = (const BYTE *) text;

	for(i = 1; i <= 4; i++) {
		BYTE c = buf[i];
		val <<= 4;
		if(isdigit(c))
			val += c - '0';
		else if(c >= 'a' && c <= 'f')
			val += c - 'a' + 10;
		else if(c >= 'A' && c <= 'F')
			val += c - 'A' + 10;
		else
			return 0;
	}

	return val;
}

wchar_t *json_get_string_value(JsonItem item)
{
	size_t src_index = 0;
	size_t val_index = 0;
	const wchar_t *text = item->value.as_string;

	wchar_t *val = (wchar_t*) malloc(sizeof(wchar_t) * (item->value_as_string_len + 1));

	while (src_index < item->value_as_string_len) {
		if (text[src_index] == '\\') {
			src_index++;
			if (src_index == item->value_as_string_len)
				break;

			switch(text[src_index]) {
			case 'u':
				if ((item->value_as_string_len - src_index) > 3) {
					wchar_t unicode_val = decode_unicode_char(text + src_index);
					if (val) {
						val[val_index] = unicode_val;
						src_index += 3;
					} else
						val[val_index] = text[src_index];
				} else
					val[val_index] = text[src_index];
				break;
			case '"':
			case '\\':
			case '/':
				val[val_index] = text[src_index];
				break;
			case 'b':
				val[val_index] = '\b';
				break;
			case 'f':
				val[val_index] = '\f';
				break;
			case 'n':
				val[val_index] = '\n';
				break;
			case 'r':
				val[val_index] = '\r';
				break;
			case 't':
				val[val_index] = '\t';
				break;
			default:
				val[val_index] = text[src_index];
			}

			val_index++;
			src_index++;
		} else
			val[val_index++] = text[src_index++];
	}

	val[val_index] = 0;

	return val;
}

JsonObject json_get_object_value(JsonItem item)
{
	return item->value.as_object;
}

JsonArray json_get_array_value(JsonItem item)
{
	return item->value.as_array;
}

static int json_container_item_count(JsonItem item)
{
	int count = 0;

	while (item != NULL) {
		item = item->next;
		count++;
	}

	return count;
}

static JsonItem json_container_item_at(JsonItem item, int position)
{
	while (item != NULL && position) {
		item = item->next;
		position--;
	}

	return item;
}

int json_array_item_count(JsonArray array)
{
	return json_container_item_count((JsonItem) array);
}

JsonItem json_array_item_at(JsonArray array, int position)
{
	return json_container_item_at((JsonItem) array, position);
}

static BOOL is_type_compatible(JsonValueType current, JsonValueType expected)
{
	if (expected & JSON_VALUE_INT64)
		return ((expected & current) || (JSON_VALUE_INT & current));

	return (expected & current);
}

static BOOL internal_json_array_validate_contents(JsonArray array, JsonValueType type, va_list args)
{
	while(type != JSON_VALUE_INVALID) {
		if (!array)
			return FALSE;
		if (!is_type_compatible(array->value_type, type))
			return FALSE;

		array = array->next;
		type = va_arg(args, JsonValueType);
	}
	
	return TRUE;
}

BOOL json_array_validate_contents(JsonArray array, JsonValueType type, ...)
{
	va_list args;

	va_start(args, type);
	return internal_json_array_validate_contents(array, type, args);
}

BOOL json_parse_and_validate_args(wchar_t * buf, JsonArray *array, JsonValueType type, ...)
{
	va_list args;

	if (!json_parse_args(buf, array))
		return FALSE;

	va_start(args, type);
	return internal_json_array_validate_contents(*array, type, args);
}

int json_object_prop_count(JsonObject object)
{
	return json_container_item_count((JsonItem) object);
}

JsonObjectItem json_object_prop_at(JsonObject object, int position)
{
	return (JsonObjectItem) json_container_item_at((JsonItem) object, position);
}

JsonObjectItem json_object_find_prop(JsonObject object, const wchar_t *id, JsonValueType type)
{
	while (object != NULL) {
		if (!wcsncmp(id, (wchar_t *) object->tag, wcslen(id)) &&
			wcslen(id) == object->tag_len && is_type_compatible(object->value_type, type))
				return (JsonObjectItem) object;
		object = (struct _JsonObjectItem *) object->next;
	}

	return NULL;
}

wchar_t *json_object_get_prop_id(JsonObject object)
{
	wchar_t *id = (wchar_t*) malloc(sizeof(wchar_t) * (object->tag_len + 1));

	wcsncpy_s(id, object->tag_len + 1, object->tag, object->tag_len);

	return id;
}

JsonObjectItem json_object_get_next(JsonObjectItem item)
{
	return (JsonObjectItem) item->next;
}
