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

typedef enum {
	JSON_VALUE_EMPTY = (1 << 0),
	JSON_VALUE_STRING = (1 << 1),
	JSON_VALUE_INT = (1 << 2),
	JSON_VALUE_INT64 = (1 << 3),
	JSON_VALUE_DOUBLE = (1 << 4),
	JSON_VALUE_ARRAY = (1 << 5),
	JSON_VALUE_BOOL = (1 << 6),
	JSON_VALUE_NULL = (1 << 7),
	JSON_VALUE_OBJECT = (1 << 8),
	JSON_VALUE_INVALID = (1 << 9)	// Used in validation functions
} JsonValueType;

struct _JsonItem;
struct _JsonObjectItem; // Inherits from _JsonItem

typedef struct _JsonItem *JsonItem;
typedef struct _JsonObjectItem *JsonObjectItem;
typedef struct _JsonItem *JsonArray;
typedef struct _JsonObjectItem *JsonObject;

__inline JsonItem to_item(JsonObjectItem item) { return (JsonItem) item; }

BOOL json_parse_args(wchar_t * buf, JsonArray *array);
BOOL json_parse_and_validate_args(wchar_t * buf, JsonArray *array, JsonValueType type, ...);
void json_free_args(JsonArray array);
int json_array_item_count(JsonArray array);
JsonItem json_array_item_at(JsonArray array, int position);
BOOL json_array_validate_contents(JsonArray array, JsonValueType type, ...);
__inline JsonItem json_array_get_first(JsonArray array) { return (JsonItem) array; }
JsonItem json_array_get_next(JsonItem item);

JsonValueType json_get_value_type(JsonItem item);
int json_get_int_value(JsonItem item);
INT64 json_get_int64_value(JsonItem item);
BOOL json_get_bool_value(JsonItem item);
double json_get_double_value(JsonItem item);
wchar_t *json_get_string_value(JsonItem item);
JsonObject json_get_object_value(JsonItem item);
JsonArray json_get_array_value(JsonItem item);

int json_object_prop_count(JsonObject object);
JsonObjectItem json_object_prop_at(JsonObject object, int position);
JsonObjectItem json_object_find_prop(JsonObject object, const wchar_t *id, JsonValueType type);
wchar_t *json_object_get_prop_id(JsonObjectItem item);
__inline JsonObjectItem json_object_get_first(JsonObject object) { return (JsonObjectItem) object; }
JsonObjectItem json_object_get_next(JsonObjectItem item);
