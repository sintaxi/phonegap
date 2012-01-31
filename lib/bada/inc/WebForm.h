#ifndef _WEBFORM_H_
#define _WEBFORM_H_

#include <FApp.h>
#include <FBase.h>
#include <FUi.h>
#include <FWeb.h>
#include <FSystem.h>
#include "PhoneGapCommand.h"
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
	String*						__phonegapCommand;

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
