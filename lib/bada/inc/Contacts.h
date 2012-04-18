/*
 * Contacts.h
 *
 *  Created on: Mar 25, 2011
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

#ifndef CONTACTS_H_
#define CONTACTS_H_

#include <FSocial.h>
#include "CordovaCommand.h"
using namespace Osp::Social;
using namespace Osp::Base::Collection;

class Contacts: public CordovaCommand {
public:
	Contacts(Web* pWeb);
	virtual ~Contacts();
public:
	void Run(const String& command);
	void Create(const int contactId);
	void Find(const String& filter);
	void Remove(const String& id);
private:
	String callbackId;
private:
	void SetNickname(Contact& contact, const int cid);
	void SetFirstName(Contact& contact, const int cid);
	void SetLastName(Contact& contact, const int cid);
	void SetPhoneNumbers(Contact& contact, const int cid);
	void SetEmails(Contact& contact, const int cid);
	void SetUrls(Contact& contact, const int cid);
	void SetOrganization(Contact& contact, const int cid);
	void SetBirthday(Contact& contact, const int cid);
	void SetAddress(Contact& contact, const int cid);

	void FindByName(const String& filter);
	void FindByEmail(const String& filter);
	void FindByPhoneNumber(const String& filter);
	void UpdateSearch(Contact* contact) const;

};

#endif /* CONTACTS_H_ */
