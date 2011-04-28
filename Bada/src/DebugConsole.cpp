/*
 * DebugConsole.cpp
 *
 *  Created on: Mar 24, 2011
 *      Author: Anis Kadri
 */

#include "../inc/DebugConsole.h"

DebugConsole::DebugConsole(Web* pWeb): PhoneGapCommand(pWeb) {
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
		if(method == L"com.phonegap.DebugConsole.log") {
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
