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

#include "WebForm.h"

WebForm::WebForm(void)
	:__pWeb(null), __cordovaCommand(null)
{
	geolocation = null;
	device = null;
	accel = null;
	network = null;
	console = null;
	compass = null;
	contacts = null;
}

WebForm::~WebForm(void) {
}

bool
WebForm::Initialize()
{
	return true;
}

result
WebForm::OnInitializing(void)
{
	result r = E_SUCCESS;

	// TODO: Add your initialization code here

	r = CreateWebControl();
	if (IsFailed(r))
	{
		AppLog("CreateMainForm() has failed.\n");
		goto CATCH;
	}

	__pWeb->LoadUrl("file:///Res/index.html");
	//__pWeb->LoadUrl("file:///Res/mobile-spec/index.html");

	return r;

CATCH:
	return false;
}

result
WebForm::OnTerminating(void)
{
	result r = E_SUCCESS;

//	delete __cordovaCommand;
//	delete geolocation;
//	delete device;
//	delete accel;
//	delete network;
//	delete console;
//	delete compass;
//	delete contacts;
//	delete notification;
//	delete camera;
	return r;
}

void
WebForm::OnActionPerformed(const Osp::Ui::Control& source, int actionId)
{
	switch(actionId)
	{
	default:
		break;
	}
}

void
WebForm::LaunchBrowser(const String& url) {
	ArrayList* pDataList = null;
	pDataList = new ArrayList();
	pDataList->Construct();

	String* pData = null;
	pData = new String(L"url:");
	pData->Append(url);
	AppLogDebug("Launching Stock Browser with %S", pData->GetPointer());
	pDataList->Add(*pData);

	AppControl* pAc = AppManager::FindAppControlN(APPCONTROL_BROWSER, "");
	if(pAc) {
		pAc->Start(pDataList, null);
		delete pAc;
	}
	pDataList->RemoveAll(true);
	delete pDataList;
}

bool
WebForm::OnLoadingRequested (const Osp::Base::String& url, WebNavigationType type) {
	AppLogDebug("URL REQUESTED %S", url.GetPointer());
	if(url.StartsWith("gap://", 0)) {
//		__cordovaCommand = null;

		__cordovaCommand = new String(url);
		//	FIXME: for some reason this does not work if we return true. Web freezes.
//		__pWeb->StopLoading();
//		String* test;
//		test = __pWeb->EvaluateJavascriptN(L"'test'");
//		AppLogDebug("String is %S", test->GetPointer());
//		delete test;
//		return true;
		return false;
	} else if(url.StartsWith("http://", 0) || url.StartsWith("https://", 0)) {
		AppLogDebug("Non Cordova command. External URL. Launching WebBrowser");
		LaunchBrowser(url);
		return false;
	}

	return false;
}

void
WebForm::OnLoadingCompleted() {
	// Setting DeviceInfo to initialize Cordova (should be done only once) and firing onNativeReady event
	String* deviceInfo;
	deviceInfo = __pWeb->EvaluateJavascriptN(L"window.device.uuid");
	if(deviceInfo->IsEmpty()) {
		device->SetDeviceInfo();
		__pWeb->EvaluateJavascriptN("Cordova.onNativeReady.fire();");
	} else {
		//AppLogDebug("DeviceInfo = %S;", deviceInfo->GetPointer());
	}
	delete deviceInfo;

	// Analyzing Cordova command
	if(__cordovaCommand) {
		if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Geolocation", 0)) {
			geolocation->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Accelerometer", 0)) {
			accel->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Network", 0)) {
			network->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.DebugConsole", 0)) {
			console->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Compass", 0)) {
			compass->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Contacts", 0)) {
			contacts->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Notification", 0)) {
			notification->Run(*__cordovaCommand);
		}
		else if(__cordovaCommand->StartsWith(L"gap://org.apache.cordova.Camera", 0)) {
			camera->Run(*__cordovaCommand);
		}
		// Tell the JS code that we got this command, and we're ready for another
		__pWeb->EvaluateJavascriptN(L"Cordova.queue.ready = true;");
		delete __cordovaCommand;
		__cordovaCommand = null;
	}
	else {
		AppLogDebug("Non Cordova command completed");
	}
}

result
WebForm::CreateWebControl(void)
{
	result r = E_SUCCESS;
	int screen_width = 0;
	int screen_height = 0;

	/*screen*/
    r = SystemInfo::GetValue("ScreenWidth", screen_width);
    TryCatch(r == E_SUCCESS, , "SystemInfo: To get a value is failed");

    r = SystemInfo::GetValue("ScreenHeight", screen_height);
    TryCatch(r == E_SUCCESS, , "SystemInfo: To get a value is failed");

	/*Web*/
	__pWeb = new Web();
	r = __pWeb->Construct(Rectangle(0, 0, screen_width, screen_height - 38));
	TryCatch(r == E_SUCCESS, ,"Web is not constructed\n ");

	r = this->AddControl(*__pWeb);
	TryCatch(r == E_SUCCESS, ,"Web is not attached\n ");

	__pWeb->SetLoadingListener(this);

	__pWeb->SetFocus();

	if(__pWeb) {
		geolocation = new GeoLocation(__pWeb);
		device = new Device(__pWeb);
		accel = new Accelerometer(__pWeb);
		network = new Network(__pWeb);
		console = new DebugConsole(__pWeb);
		compass = new Compass(__pWeb);
		contacts = new Contacts(__pWeb);
		notification = new Notification(__pWeb);
		camera = new Kamera(__pWeb);
	}
	return r;

CATCH:
	AppLog("Error = %s\n", GetErrorMessage(r));
	return r;
}

