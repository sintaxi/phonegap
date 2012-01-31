#include "WebForm.h"

WebForm::WebForm(void)
	:__pWeb(null), __phonegapCommand(null)
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

//	delete __phonegapCommand;
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
//		__phonegapCommand = null;

		__phonegapCommand = new String(url);
		//	FIXME: for some reason this does not work if we return true. Web freezes.
//		__pWeb->StopLoading();
//		String* test;
//		test = __pWeb->EvaluateJavascriptN(L"'test'");
//		AppLogDebug("String is %S", test->GetPointer());
//		delete test;
//		return true;
		return false;
	} else if(url.StartsWith("http://", 0) || url.StartsWith("https://", 0)) {
		AppLogDebug("Non PhoneGap command. External URL. Launching WebBrowser");
		LaunchBrowser(url);
		return false;
	}

	return false;
}

void
WebForm::OnLoadingCompleted() {
	// Setting DeviceInfo to initialize PhoneGap (should be done only once) and firing onNativeReady event
	String* deviceInfo;
	deviceInfo = __pWeb->EvaluateJavascriptN(L"window.device.uuid");
	if(deviceInfo->IsEmpty()) {
		device->SetDeviceInfo();
		__pWeb->EvaluateJavascriptN("PhoneGap.onNativeReady.fire();");
	} else {
		//AppLogDebug("DeviceInfo = %S;", deviceInfo->GetPointer());
	}
	delete deviceInfo;

	// Analyzing PhoneGap command
	if(__phonegapCommand) {
		if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Geolocation", 0)) {
			geolocation->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Accelerometer", 0)) {
			accel->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Network", 0)) {
			network->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.DebugConsole", 0)) {
			console->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Compass", 0)) {
			compass->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Contacts", 0)) {
			contacts->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Notification", 0)) {
			notification->Run(*__phonegapCommand);
		}
		else if(__phonegapCommand->StartsWith(L"gap://com.phonegap.Camera", 0)) {
			camera->Run(*__phonegapCommand);
		}
		// Tell the JS code that we got this command, and we're ready for another
		__pWeb->EvaluateJavascriptN(L"PhoneGap.queue.ready = true;");
		delete __phonegapCommand;
		__phonegapCommand = null;
	}
	else {
		AppLogDebug("Non PhoneGap command completed");
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

