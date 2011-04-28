/*
 * Network.h
 *
 *  Created on: Mar 23, 2011
 *      Author: Anis Kadri
 */

#ifndef NETWORK_H_
#define NETWORK_H_

#include "PhoneGapCommand.h"
#include <FNet.h>
#include <FSystem.h>

using namespace Osp::Net;
using namespace Osp::Net::Http;
using namespace Osp::System;

class Network: public PhoneGapCommand, public IHttpTransactionEventListener  {
public:
	Network(Web* pWeb);
	virtual ~Network();
public:
	virtual void Run(const String& command);
	bool IsReachable(const String& hostAddr, const String& callbackId);
public:
	virtual void 	OnTransactionAborted (HttpSession &httpSession, HttpTransaction &httpTransaction, result r);
	virtual void 	OnTransactionCertVerificationRequiredN (HttpSession &httpSession, HttpTransaction &httpTransaction, Osp::Base::String *pCert) {};
	virtual void 	OnTransactionCompleted (HttpSession &httpSession, HttpTransaction &httpTransaction);
	virtual void 	OnTransactionHeaderCompleted (HttpSession &httpSession, HttpTransaction &httpTransaction, int headerLen, bool bAuthRequired) {};
	virtual void 	OnTransactionReadyToRead (HttpSession &httpSession, HttpTransaction &httpTransaction, int availableBodyLen) {};
	virtual void 	OnTransactionReadyToWrite (HttpSession &httpSession, HttpTransaction &httpTransaction, int recommendedChunkSize) {};
private:
	void IsReachable(const String& hostAddr);
	HttpSession* __pHttpSession;
	String callbackId;
};

#endif /* NETWORK_H_ */
