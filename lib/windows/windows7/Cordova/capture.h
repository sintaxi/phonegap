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

#include "shell.h"

void setup_capture (void);

void snap_picture (void);

void camera_resize_window (int width, int height);

void camera_notify_display_change (void);

void start_photo_capture (void);

void start_video_capture (void);
void start_video_framing (void);
void stop_video_capture (void);

HWND setup_capture_window (HWND hParent, BOOL video_mode);

void notify_capture_result (void);

DECLARE_CORDOVA_MODULE(Camera)
DECLARE_CORDOVA_MODULE(Capture)



