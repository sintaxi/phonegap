/*
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

#ifndef _WEBFORM_H_
#define _WEBFORM_H_

#include <FApp.h>
#include <FBase.h>
#include <FUi.h>
#include <FWeb.h>
#include <FSystem.h>
#include "CordovaCommand.h"
#include "GeoLocation.h"
#include "Device.h"
#include "Accelerometer.h"
#include "Network.h"
#include "DebugConsole.h"
#include "Compass.h"
#include "Contacts.h"
#include "Notification.h"
#include "Kamera.h"

using namespace Osp::Base;
using namespace Osp::Base::Collection;
using namespace Osp::App;
using namespace Osp::Ui;
using namespace Osp::Ui::Controls;
using namespace Osp::System;
using namespace Osp::Graphics;
using namespace Osp::Web::Controls;

class WebForm :
	public Osp::Ui::Controls::Form,
	public Osp::Ui::IActionEventListener,
	public Osp::Web::Controls::ILoadingListener
{

// Construction
public:
	WebForm(void);
	virtual ~WebForm(void);
	bool Initialize(void);

// Implementation
private:
	result CreateWebControl(void);

	Osp::Web::Controls::Web*	__pWeb;
	GeoLocation*                geolocation;
	Device*						device;
	Accelerometer*              accel;
	Network*					network;
	DebugConsole*				console;
	Compass*					compass;
	Contacts*					contacts;
	Notification*				notification;
	Kamera*						camera;
	String*						__cordovaCommand;

public:
	virtual result OnInitializing(void);
	virtual result OnTerminating(void);
	virtual void OnActionPerformed(const Osp::Ui::Control& source, int actionId);

public:
	virtual void  OnEstimatedProgress (int progress) {};
	virtual void  OnHttpAuthenticationCanceled (void) {};
	virtual bool  OnHttpAuthenticationRequestedN (const Osp::Base::String &host, const Osp::Base::String &realm, const Osp::Web::Controls::AuthenticationChallenge &authentication) { return false; };
	virtual void  OnLoadingCanceled (void) {};
	virtual void  OnLoadingCompleted (void);
	virtual void  OnLoadingErrorOccurred (LoadingErrorType error, const Osp::Base::String &reason) {};
	virtual bool  OnLoadingRequested (const Osp::Base::String &url, WebNavigationType type);
	virtual void  OnLoadingStarted (void) {};
	virtual void  OnPageTitleReceived (const Osp::Base::String &title) {};
	virtual DecisionPolicy  OnWebDataReceived (const Osp::Base::String &mime, const Osp::Net::Http::HttpHeader &httpHeader) { return WEB_DECISION_CONTINUE; };

	virtual void LaunchBrowser(const String& url);

};

#endif	//_WebForm_H_
