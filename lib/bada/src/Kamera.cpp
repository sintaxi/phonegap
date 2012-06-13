/*
 * Kamera.cpp
 *
 *  Created on: Apr 19, 2011
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

#include "../inc/Kamera.h"

Kamera::Kamera(Web* pWeb) : CordovaCommand(pWeb) {
}

Kamera::~Kamera() {
}

void
Kamera::Run(const String& command) {
	if(!command.IsEmpty()) {
		Uri commandUri;
		commandUri.SetUri(command);
		String method = commandUri.GetHost();
		StringTokenizer strTok(commandUri.GetPath(), L"/");
		if(strTok.GetTokenCount() < 1) {
			AppLogException("Not enough params");
			return;
		}
		strTok.GetNextToken(callbackId);
		if(method == "org.apache.cordova.Camera.getPicture" && !callbackId.IsEmpty()) {
			GetPicture();
		}
	}
}

void
Kamera::GetPicture() {
	AppLogDebug("Taking picture");

	ArrayList* pDataList = null;
	pDataList = new ArrayList();
	pDataList->Construct();

	String* pData = null;
	pData = new String(L"type:camera");
	pDataList->Add(*pData);

	AppControl* pAc = AppManager::FindAppControlN(APPCONTROL_CAMERA, OPERATION_CAPTURE);
	if(pAc)
	{
	  pAc->Start(pDataList, this);
	  delete pAc;
	}
	pDataList->RemoveAll(true);
	delete pDataList;
}

void
Kamera::OnAppControlCompleted (const String &appControlId, const String &operationId, const IList *pResultList) {
	//This method is invoked when an application control callback event occurs.

	String* pCaptureResult = null;
	if (appControlId.Equals(APPCONTROL_CAMERA) && operationId.Equals(OPERATION_CAPTURE))
	{
	  pCaptureResult = (Osp::Base::String*)pResultList->GetAt(0);
	  if (pCaptureResult->Equals(String(APPCONTROL_RESULT_SUCCEEDED)))
	  {
		String eval;
		AppLog("Camera capture success.");
		String* pCapturePath = (String*)pResultList->GetAt(1);

		// copying to app Home Folder
		String homeFilename;
		homeFilename.Format(128, L"/Home/%S", File::GetFileName(*pCapturePath).GetPointer());
		result r = File::Copy(*pCapturePath, homeFilename, true);

		if(IsFailed(r)) {
			AppLogException("Could not copy picture");
			eval.Format(512, L"Cordova.callbacks['%S'].fail('Could not copy picture')", callbackId.GetPointer());
			AppLogDebug("%S", eval.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
		}

//		Uri imageUri;
//		imageUri.setUri(homeFilename);
		eval.Clear();
		eval.Format(512, L"Cordova.callbacks['%S'].success('file://%S')", callbackId.GetPointer(), homeFilename.GetPointer());
		AppLogDebug("%S", eval.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	  }
	  else if (pCaptureResult->Equals(String(APPCONTROL_RESULT_CANCELED)))
	  {
		AppLog("Camera capture canceled.");
		String eval;
		eval.Format(512, L"Cordova.callbacks['%S'].fail('Camera capture canceled')", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	  }
	  else if (pCaptureResult->Equals(String(APPCONTROL_RESULT_FAILED)))
	  {
		AppLog("Camera capture failed.");
		String eval;
		eval.Format(512, L"Cordova.callbacks['%S'].fail('Camera capture failed')", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	  }
	}
}
