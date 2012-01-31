/*
 * Network.cpp
 *
 *  Created on: Mar 23, 2011
 *      Author: Anis Kadri
 */

#include "../inc/Network.h"

Network::Network(Web* pWeb) : PhoneGapCommand(pWeb) {
}

Network::~Network() {
	delete __pHttpSession;
}

void
Network::Run(const String& command) {
	if (!command.IsEmpty()) {
		String args;
		String delim(L"/");
		command.SubString(String(L"gap://").GetLength(), args);
		StringTokenizer strTok(args, delim);
		if(strTok.GetTokenCount() < 3) {
			AppLogDebug("Not enough params");
			return;
		}
		String method;
		String hostAddr;
		strTok.GetNextToken(method);
		strTok.GetNextToken(callbackId);
		strTok.GetNextToken(hostAddr);

		// URL decoding
		Uri uri;
		uri.SetUri(hostAddr);
		AppLogDebug("Method %S, callbackId %S, hostAddr %S URI %S", method.GetPointer(), callbackId.GetPointer(), hostAddr.GetPointer(), uri.ToString().GetPointer());
		if(method == L"com.phonegap.Network.isReachable") {
			IsReachable(uri.ToString());
		}
		AppLogDebug("Network command %S completed", command.GetPointer());
		} else {
			AppLogDebug("Can't run empty command");
		}
}

void
Network::IsReachable(const String& hostAddr) {
	String* pProxyAddr = null;
	//String hostAddr = L"http://localhost:port";
	AppLogDebug("Trying to reach...%S", hostAddr.GetPointer());
	__pHttpSession = new HttpSession();
	__pHttpSession->Construct(NET_HTTP_SESSION_MODE_NORMAL, pProxyAddr, hostAddr, null);
	HttpTransaction* pHttpTransaction = __pHttpSession->OpenTransactionN();
	pHttpTransaction->AddHttpTransactionListener(*this);
	HttpRequest* pHttpRequest = pHttpTransaction->GetRequest();
	pHttpRequest->SetMethod(NET_HTTP_METHOD_GET);
	pHttpRequest->SetUri(hostAddr);
	pHttpTransaction->Submit();
}

void
Network::OnTransactionAborted (HttpSession &httpSession, HttpTransaction &httpTransaction, result r) {
	AppLogDebug("Transaction Aborted");
	String res;
	res.Format(128, L"PhoneGap.callbacks['%S'].fail({code:%d,message:'%s'});", callbackId.GetPointer(), r, GetErrorMessage(r));
	AppLogDebug("%S", res.GetPointer());
	pWeb->EvaluateJavascriptN(res);
}

void
Network::OnTransactionCompleted (HttpSession &httpSession, HttpTransaction &httpTransaction) {
	HttpResponse* pHttpResponse = httpTransaction.GetResponse();
	NetHttpStatusCode statusCode = pHttpResponse->GetStatusCode();
	int status = 1; // Default is DATA NETWORK

	// FIXME: Bada has no standard/apparent way of knowing the current network type
	// We have to get the network type from the system info
	// ...and if Wifi is enabled we override the setting to Wifi

	String key(L"NetworkType");
	String networkType;

	result r = SystemInfo::GetValue(key, networkType);

	if(r == E_SUCCESS && networkType != L"NoService" && networkType != L"Emergency") {
		AppLogDebug("Data Enabled, Network Type %S, Status Code: %d", networkType.GetPointer(), statusCode);
		status = 1;
	}

	Wifi::WifiManager manager;
	if(manager.IsActivated() && manager.IsConnected()) {
		AppLogDebug("Wifi Enabled");
		status = 2;
	}

	String res;

	res.Format(256, L"navigator.network.updateReachability({code:%d,http_code:%d});", status, statusCode);
	AppLogDebug("%S", res.GetPointer());
	pWeb->EvaluateJavascriptN(res);

	res.Format(128, L"PhoneGap.callbacks['%S'].success(%d);", callbackId.GetPointer(), status);
	AppLogDebug("%S", res.GetPointer());
	pWeb->EvaluateJavascriptN(res);
}
