/*
 * DebugConsole.cpp
 *
 *  Created on: Mar 24, 2011
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

#include "../inc/DebugConsole.h"

DebugConsole::DebugConsole(Web* pWeb): CordovaCommand(pWeb) {
	// TODO Auto-generated constructor stub
}

DebugConsole::~DebugConsole() {
	// TODO Auto-generated destructor stub
}

void
DebugConsole::CleanUp(String& str) {
	Uri uri;
	uri.SetUri(str);
	str.Clear();
	str.Append(uri.ToString());
}

void
DebugConsole::Run(const String& command) {
	if(!command.IsEmpty()) {
		String args;
		String delim(L"/");
		command.SubString(String(L"gap://").GetLength(), args);
		StringTokenizer strTok(args, delim);
		if(strTok.GetTokenCount() < 3) {
			AppLogDebug("Not enough params");
			return;
		}
		String method;
		String statement(64);
		String logLevel;
		strTok.GetNextToken(method);
		strTok.GetNextToken(statement);
		CleanUp(statement);
		strTok.GetNextToken(logLevel);
		//AppLogDebug("method %S statement %S loglevel %S", method.GetPointer(), statement.GetPointer(), logLevel.GetPointer());
		if(method == L"org.apache.cordova.DebugConsole.log") {
			Log(statement, logLevel);
		}
	}
}

void
DebugConsole::Log(String& statement, String& logLevel) {
	if(!statement.IsEmpty()) {
		if(logLevel == L"INFO" || logLevel == L"WARN") {
			AppLog("[%S] %S", logLevel.GetPointer(), statement.GetPointer());
		}
		else if(logLevel == "DEBUG") {
			AppLogDebug("[%S] %S", logLevel.GetPointer(), statement.GetPointer());
		}
		else if(logLevel == L"ERROR") {
			AppLogException("[%S] %S", logLevel.GetPointer(), statement.GetPointer());
		}
	}
}
