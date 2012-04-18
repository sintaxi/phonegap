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

#include "Cordova.h"
#include "WebForm.h"

using namespace Osp::App;
using namespace Osp::Base;
using namespace Osp::System;
using namespace Osp::Ui;
using namespace Osp::Ui::Controls;

Cordova::Cordova()
{
}

Cordova::~Cordova()
{
}

Application*
Cordova::CreateInstance(void)
{
	// Create the instance through the constructor.
	return new Cordova();
}

bool
Cordova::OnAppInitializing(AppRegistry& appRegistry)
{
	// TODO:
	// Initialize UI resources and application specific data.
	// The application's permanent data and context can be obtained from the appRegistry.
	//
	// If this method is successful, return true; otherwise, return false.
	// If this method returns false, the application will be terminated.

	// Uncomment the following statement to listen to the screen on/off events.
	//PowerManager::SetScreenEventListener(*this);

	Frame *pFrame = null;
	result r = E_SUCCESS;

	// Create a form
	WebForm *pWebForm = new WebForm();

	r = pWebForm->Construct(FORM_STYLE_INDICATOR);
	if (IsFailed(r))
	{
		AppLog("WebForm Construct() has failed.\n");
		goto CATCH;
	}

	// Add the form to the frame
	pFrame = GetAppFrame()->GetFrame();
	pFrame->AddControl(*pWebForm);

	// Set the current form
	pFrame->SetCurrentForm(*pWebForm);

	// Draw and Show the form
	pWebForm->Draw();
	pWebForm->Show();

	return true;

CATCH:
	return false;
}

bool
Cordova::OnAppTerminating(AppRegistry& appRegistry, bool forcedTermination)
{
	// TODO:
	// Deallocate resources allocated by this application for termination.
	// The application's permanent data and context can be saved via appRegistry.
	return true;
}

void
Cordova::OnForeground(void)
{
	// TODO:
	// Start or resume drawing when the application is moved to the foreground.
}

void
Cordova::OnBackground(void)
{
	// TODO:
	// Stop drawing when the application is moved to the background.
}

void
Cordova::OnLowMemory(void)
{
	// TODO:
	// Free unused resources or close the application.
}

void
Cordova::OnBatteryLevelChanged(BatteryLevel batteryLevel)
{
	// TODO:
	// Handle any changes in battery level here.
	// Stop using multimedia features(camera, mp3 etc.) if the battery level is CRITICAL.
}

void
Cordova::OnScreenOn (void)
{
	// TODO:
	// Get the released resources or resume the operations that were paused or stopped in OnScreenOff().
}

void
Cordova::OnScreenOff (void)
{
	// TODO:
	//  Unless there is a strong reason to do otherwise, release resources (such as 3D, media, and sensors) to allow the device to enter the sleep mode to save the battery.
	// Invoking a lengthy asynchronous method within this listener method can be risky, because it is not guaranteed to invoke a callback before the device enters the sleep mode.
	// Similarly, do not perform lengthy operations in this listener method. Any operation must be a quick one.
}
