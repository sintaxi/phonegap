/*
 * Notification.cpp
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

#include "../inc/Notification.h"

Notification::Notification(Web* pWeb) : CordovaCommand(pWeb) {
}

Notification::~Notification() {
}

void
Notification::Run(const String& command) {
	if(!command.IsEmpty()) {
		Uri commandUri;
		commandUri.SetUri(command);
		String method = commandUri.GetHost();
		StringTokenizer strTok(commandUri.GetPath(), L"/");
		if(strTok.GetTokenCount() < 1) {
			AppLogException("Not enough params");
			return;
		}
		if((method == L"org.apache.cordova.Notification.alert" || method == L"org.apache.cordova.Notification.confirm")) {
			strTok.GetNextToken(callbackId);
			AppLogDebug("%S %S", method.GetPointer(), callbackId.GetPointer());
			if(!callbackId.IsEmpty()) {
				Dialog();
			}
		} else if(method == L"org.apache.cordova.Notification.vibrate") {
			long duration;
			String durationStr;

			strTok.GetNextToken(durationStr);
			AppLogDebug("%S %S", method.GetPointer(), durationStr.GetPointer());
			// Parsing duration
			result r = Long::Parse(durationStr, duration);
			if(IsFailed(r)) {
				AppLogException("Could not parse duration");
				return;
			}
			Vibrate(duration);
		} else if(method == L"org.apache.cordova.Notification.beep") {
			int count;
			String countStr;

			strTok.GetNextToken(countStr);
			AppLogDebug("%S %S", method.GetPointer(), countStr.GetPointer());
			// Parsing count
			result r = Integer::Parse(countStr, count);
			if(IsFailed(r)) {
				AppLogException("Could not parse count");
				return;
			}

			Beep(count);
		}
	}
}

void
Notification::Dialog() {
	MessageBox messageBox;
	String* title;
	String* message;
	String* styleStr;
	String eval;

	title = pWeb->EvaluateJavascriptN(L"navigator.notification.messageBox.title");
	message = pWeb->EvaluateJavascriptN(L"navigator.notification.messageBox.message");
	styleStr = pWeb->EvaluateJavascriptN(L"navigator.notification.messageBox.messageBoxStyle");

	AppLogDebug("title %S message %S styleStr %S", title->GetPointer(), message->GetPointer(), styleStr->GetPointer());
	if(!title->IsEmpty() && !message->IsEmpty() && !styleStr->IsEmpty()) {
		int style;
		int modalResult = 0;
		if(Integer::Parse(*styleStr, style) != E_SUCCESS) {
			AppLogException("Could not get dialog style");
			return;
		}
		messageBox.Construct(*title, *message, (MessageBoxStyle)style, 0);
		messageBox.ShowAndWait(modalResult);
		switch(modalResult) {
		case MSGBOX_RESULT_CLOSE:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Close')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_OK:
			eval.Format(128, L"Cordova.callbacks['%S'].success('OK')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_CANCEL:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Cancel')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_YES:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Yes')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_NO:
			eval.Format(128, L"Cordova.callbacks['%S'].success('No')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_ABORT:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Abort')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_TRY:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Try')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_RETRY:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Retry')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_IGNORE:
			eval.Format(128, L"Cordova.callbacks['%S'].success('Ignore')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		case MSGBOX_RESULT_CONTINUE:
			eval.Format(64, L"Cordova.callbacks['%S'].success('Continue')", callbackId.GetPointer());
			pWeb->EvaluateJavascriptN(eval);
			break;
		}

	} else {
		AppLogException("Could not construct MessageBox");
	}
	delete title;
	delete message;
	delete styleStr;
}
void Notification::Vibrate(const long milliseconds) {
	AppLogDebug("Trying to vibrate the device for %d", milliseconds);
	Vibrator vibrator;
	vibrator.Construct();
	vibrator.Start(milliseconds, 99);
	Osp::Base::Runtime::Thread::Sleep(milliseconds + 1000);
}

void Notification::Beep(const int count) {
	AppLogDebug("Trying to beep the device");
	result r = E_SUCCESS;

	TouchEffect *pTouchEffect = null;
	pTouchEffect = new Osp::Uix::TouchEffect();

	r = pTouchEffect->Construct();

	if(r == E_SUCCESS) {
		for(int i = 0 ; i < count && r == E_SUCCESS ; i++) {
			r = pTouchEffect->Play(TOUCH_EFFECT_SOUND);
			Osp::Base::Runtime::Thread::Sleep(1000);
		}
	}
}
