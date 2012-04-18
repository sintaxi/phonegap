/*
 * CordovaCommand.h
 *
 *  Created on: Mar 7, 2011
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

#ifndef CORDOVACOMMAND_H_
#define CORDOVACOMMAND_H_

#include <FWeb.h>
#include <FBase.h>

using namespace Osp::Web::Controls;
using namespace Osp::Base;
using namespace Osp::Base::Utility;

class CordovaCommand {
public:
	CordovaCommand();
	CordovaCommand(Web* pWeb);
	virtual ~CordovaCommand();
protected:
	Web* pWeb;
public:
	virtual void Run(const String& command) =0;
};

#endif /* CORDOVACOMMAND_H_ */
