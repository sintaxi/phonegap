/*
 * Notification.h
 *
 *  Created on: Apr 5, 2011
 *      Author: Anis Kadri <anis@adobe.com>
 *
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

#ifndef NOTIFICATION_H_
#define NOTIFICATION_H_

#include <FUi.h>
#include <FUix.h>
#include <FSystem.h>
#include "CordovaCommand.h"
using namespace Osp::System;
using namespace Osp::Ui;
using namespace Osp::Ui::Controls;
using namespace Osp::Uix;

class Notification: public CordovaCommand {
public:
	Notification(Web* pWeb);
	virtual ~Notification();
public:
	String callbackId;
public:
	void Run(const String& command);
	void Dialog();
	void Vibrate(const long milliseconds);
	void Beep(const int count);
};

#endif /* NOTIFICATION_H_ */
