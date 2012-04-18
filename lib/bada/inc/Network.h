/*
 * Network.h
 *
 *  Created on: Mar 23, 2011
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

#ifndef NETWORK_H_
#define NETWORK_H_

#include "CordovaCommand.h"
#include <FNet.h>
#include <FSystem.h>

using namespace Osp::Net;
using namespace Osp::Net::Http;
using namespace Osp::System;

class Network: public CordovaCommand, public IHttpTransactionEventListener  {
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
