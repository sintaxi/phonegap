/*
 * Contacts.cpp
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

#include "../inc/Contacts.h"

Contacts::Contacts(Web* pWeb) : CordovaCommand(pWeb) {
}

Contacts::~Contacts() {
}

void
Contacts::Run(const String& command) {
	if(!command.IsEmpty()) {
		Uri commandUri;
		commandUri.SetUri(command);
		String method = commandUri.GetHost();
		StringTokenizer strTok(commandUri.GetPath(), L"/");
		if(strTok.GetTokenCount() < 2) {
			AppLogException("Not enough params");
			return;
		}
		strTok.GetNextToken(callbackId);
		// Saving a new contact
		if(method == L"org.apache.cordova.Contacts.save" && !callbackId.IsEmpty()) {
			String contactId;
			strTok.GetNextToken(contactId);
			int cid = -1;
			result r = E_SUCCESS;
			r = Integer::Parse(contactId, cid);
			if(IsFailed(r)) {
				AppLogException("Could not retrieve contact ID");
			}
			AppLogDebug("Method %S callbackId %S contactId %d", method.GetPointer(), callbackId.GetPointer(), cid);
			Create(cid);
		// Finding an exisiting contact by Name/Phone Number/Email
		} else if(method == L"org.apache.cordova.Contacts.find" && !callbackId.IsEmpty()) {
			String filter;
			strTok.GetNextToken(filter);
			AppLogDebug("Method %S callbackId %S filter %S", method.GetPointer(), callbackId.GetPointer(), filter.GetPointer());
			Find(filter);
		} else if(method == L"org.apache.cordova.Contacts.remove" && !callbackId.IsEmpty()) {
			String id;
			strTok.GetNextToken(id);
			AppLogDebug("Method %S callbackId %S ID to remove %S", method.GetPointer(), callbackId.GetPointer(), id.GetPointer());
			Remove(id);
		}

	}
}

void
Contacts::SetNickname(Contact& contact, const int cid) {
	String* value = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].nickname", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("nickname: %S", value->GetPointer());
		contact.SetValue(CONTACT_PROPERTY_ID_NICK_NAME, *value);
	}
	delete value;
}

void
Contacts::SetFirstName(Contact& contact, const int cid) {
	String* value = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].name.givenName", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("First Name: %S", value->GetPointer());
		contact.SetValue(CONTACT_PROPERTY_ID_FIRST_NAME, *value);
	}
	delete value;
}

void
Contacts::SetLastName(Contact& contact, const int cid) {
	String* value = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].name.familyName", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("Last Name: %S", value->GetPointer());
		contact.SetValue(CONTACT_PROPERTY_ID_LAST_NAME, *value);
	}
	delete value;
}

void
Contacts::SetPhoneNumbers(Contact& contact, const int cid) {
	// Getting phone numbers length
	String* lengthStr = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].phoneNumbers.length", cid);
	lengthStr = pWeb->EvaluateJavascriptN(eval);
	if(!lengthStr->IsEmpty()) {
		int length;
		result r = Integer::Parse(*lengthStr, length);
		if(IsFailed(r)) {
			AppLogException("Could not get phoneNumbers length");
			return;
		}
		delete lengthStr;
		for(int i = 0 ; i < length ; i++) {
			String* type = NULL;
			String* number = NULL;

			// Getting phone number type
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].phoneNumbers[%d].type", cid, i);
			type = pWeb->EvaluateJavascriptN(eval);

			// Getting phone number
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].phoneNumbers[%d].value", cid, i);
			number = pWeb->EvaluateJavascriptN(eval);

			if(!type->IsEmpty() && !number->IsEmpty()) {
				if(*type == "Home") {
					AppLogDebug("Adding HOME phone number %S", number->GetPointer());
					PhoneNumber phoneNumber(PHONENUMBER_TYPE_HOME, *number);
					contact.AddPhoneNumber(phoneNumber);
				} else if(*type == "Mobile") {
					AppLogDebug("Adding MOBILE phone number %S", number->GetPointer());
					PhoneNumber phoneNumber(PHONENUMBER_TYPE_MOBILE, *number);
					contact.AddPhoneNumber(phoneNumber);
				} else if(*type == "Pager") {
					AppLogDebug("Adding PAGER phone number %S", number->GetPointer());
					PhoneNumber phoneNumber(PHONENUMBER_TYPE_PAGER, *number);
					contact.AddPhoneNumber(phoneNumber);
				} else if(*type == "Work") {
					AppLogDebug("Adding WORK phone number %S", number->GetPointer());
					PhoneNumber phoneNumber(PHONENUMBER_TYPE_WORK, *number);
					contact.AddPhoneNumber(phoneNumber);
				} else if(*type == "Other") {
					AppLogDebug("Adding OTHER phone number %S", number->GetPointer());
					PhoneNumber phoneNumber(PHONENUMBER_TYPE_OTHER, *number);
					contact.AddPhoneNumber(phoneNumber);
				}
			}
			delete type;
			delete number;
		}
	}
}

void
Contacts::SetEmails(Contact& contact, const int cid) {
	// Getting emails length
	String* lengthStr = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].emails.length", cid);
	lengthStr = pWeb->EvaluateJavascriptN(eval);
	if(!lengthStr->IsEmpty()) {
		int length;
		result r = Integer::Parse(*lengthStr, length);
		if(IsFailed(r)) {
			AppLogException("Could not get emails length");
			return;
		}
		delete lengthStr;
		for(int i = 0 ; i < length ; i++) {
			String* type = NULL;
			String* address = NULL;

			// Getting email type
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].emails[%d].type", cid, i);
			type = pWeb->EvaluateJavascriptN(eval);

			// Getting email
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].emails[%d].value", cid, i);
			address = pWeb->EvaluateJavascriptN(eval);

			if(!type->IsEmpty() && !address->IsEmpty()) {
				if(*type == "Personal") {
					AppLogDebug("Adding PERSONAL email %S", address->GetPointer());
			        Email email(EMAIL_TYPE_PERSONAL, *address);
			        contact.AddEmail(email);
				} else if(*type == "Work") {
					AppLogDebug("Adding WORK email %S", address->GetPointer());
			        Email email(EMAIL_TYPE_WORK, *address);
			        contact.AddEmail(email);
				} else if(*type == "Other") {
					AppLogDebug("Adding OTHER email %S", address->GetPointer());
			        Email email(EMAIL_TYPE_OTHER, *address);
			        contact.AddEmail(email);
				}
			}
			delete type;
			delete address;
		}
	}
}

void
Contacts::SetUrls(Contact& contact, const int cid) {
	// Getting emails length
	String* lengthStr = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].urls.length", cid);
	lengthStr = pWeb->EvaluateJavascriptN(eval);
	if(!lengthStr->IsEmpty()) {
		int length;
		result r = Integer::Parse(*lengthStr, length);
		if(IsFailed(r)) {
			AppLogException("Could not get urls length");
			return;
		}
		delete lengthStr;
		for(int i = 0 ; i < length ; i++) {
			String* type = NULL;
			String* address = NULL;

			// Getting url type
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].urls[%d].type", cid, i);
			type = pWeb->EvaluateJavascriptN(eval);

			// Getting url
			eval.Clear();
			eval.Format(128, L"navigator.service.contacts.records[%d].urls[%d].value", cid, i);
			address = pWeb->EvaluateJavascriptN(eval);

			if(!type->IsEmpty() && !address->IsEmpty()) {
				if(*type == "Personal") {
					AppLogDebug("Adding PERSONAL URL %S", address->GetPointer());
			        Url url(URL_TYPE_PERSONAL, *address);
			        contact.AddUrl(url);
				} else if(*type == "Work") {
					AppLogDebug("Adding WORK URL %S", address->GetPointer());
			        Url url(URL_TYPE_WORK, *address);
			        contact.AddUrl(url);
				} else if(*type == "Other") {
					AppLogDebug("Adding OTHER URL %S", address->GetPointer());
			        Url url(URL_TYPE_OTHER, *address);
			        contact.AddUrl(url);
				}
			}
			delete type;
			delete address;
		}
	}
}

void
Contacts::SetOrganization(Contact& contact, const int cid) {
	// Setting Organization Name
	String* value = NULL;
	String eval;
	eval.Format(128, L"navigator.service.contacts.records[%d].organization.name", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("Organization Name: %S", value->GetPointer());
		contact.SetValue(CONTACT_PROPERTY_ID_COMPANY, *value);
	}
	delete value;

	// Setting Organization Title
	eval.Clear();
	eval.Format(128, L"navigator.service.contacts.records[%d].organization.title", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("Organization Title: %S", value->GetPointer());
		contact.SetValue(CONTACT_PROPERTY_ID_JOB_TITLE, *value);
	}
	delete value;
}
void
Contacts::SetBirthday(Contact& contact, const int cid) {
	String* value;
	String eval;
	int year, month, day;
	DateTime birthday;

	// Setting Year
	eval.Format(128, L"navigator.service.contacts.records[%d].birthday.getFullYear()", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		result r = Integer::Parse(*value, year);
		if(IsFailed(r)) {
			AppLogException("Could not get birthday Year");
			return;
		}
		AppLogDebug("Birthday Year: %S", value->GetPointer());
	}
	delete value;

	// Setting Month
	eval.Clear();
	eval.Format(128, L"navigator.service.contacts.records[%d].birthday.getMonth() + 1", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		result r = Integer::Parse(*value, month);
		if(IsFailed(r)) {
			AppLogException("Could not get birthday Month");
			return;
		}
		AppLogDebug("Birthday Month: %S", value->GetPointer());
	}
	delete value;

	// Setting Day
	eval.Clear();
	eval.Format(128, L"navigator.service.contacts.records[%d].birthday.getDate()", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		result r = Integer::Parse(*value, day);
		if(IsFailed(r)) {
			AppLogException("Could not get birthday Day");
			return;
		}
		AppLogDebug("Birthday Day: %S", value->GetPointer());
	}
	delete value;

	birthday.SetValue(year, month, day);
	contact.SetValue(CONTACT_PROPERTY_ID_BIRTHDAY, birthday);
	AppLogDebug("Birthday %d/%d/%d added", year, month, day);
}

void
Contacts::SetAddress(Contact& contact, const int cid) {
	Address address;
	String* value;
	String eval;
	// Setting Street Address
	eval.Format(128, L"navigator.service.contacts.records[%d].address.streetAddress", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("Street Address: %S", value->GetPointer());
		address.SetStreet(*value);
	}
	delete value;

	// Setting City
	eval.Format(128, L"navigator.service.contacts.records[%d].address.locality", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("City: %S", value->GetPointer());
		address.SetCity(*value);
	}
	delete value;

	// Setting State
	eval.Format(128, L"navigator.service.contacts.records[%d].address.region", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("State: %S", value->GetPointer());
		address.SetState(*value);
	}
	delete value;

	// Setting Postal Code
	eval.Format(128, L"navigator.service.contacts.records[%d].address.postalCode", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("Postal Code: %S", value->GetPointer());
		address.SetPostalCode(*value);
	}
	delete value;

	// Setting Country
	eval.Format(128, L"navigator.service.contacts.records[%d].address.country", cid);
	value = pWeb->EvaluateJavascriptN(eval);
	if(!value->IsEmpty()) {
		AppLogDebug("County: %S", value->GetPointer());
		address.SetPostalCode(*value);
	}
	delete value;

	contact.AddAddress(address);
	AppLogDebug("Address Added");
}

void
Contacts::Create(const int cid) {
	result r = E_SUCCESS;
	Addressbook addressbook;

	r = addressbook.Construct();

	if(IsFailed(r)) {
		AppLogException("Could not create AddressBook");
		return;
	}

	Contact contact;
	SetNickname(contact, cid);
	SetFirstName(contact, cid);
	SetLastName(contact, cid);
	SetPhoneNumbers(contact, cid);
	SetEmails(contact, cid);
	SetUrls(contact, cid);
	SetOrganization(contact, cid);
	SetBirthday(contact, cid);
	SetAddress(contact, cid);

	r = addressbook.AddContact(contact);

	String eval;

	if(IsFailed(r)) {
		AppLogException("Could not add contact");
		eval.Format(128, L"Cordova.callbacks['%S'].fail({message:'%s',code:%d})", callbackId.GetPointer(), r, GetErrorMessage(r));
		pWeb->EvaluateJavascriptN(eval);
	} else {
		AppLogDebug("Contact Successfully Added");
		eval.Format(128, L"Cordova.callbacks['%S'].success({message:'Contact added successfully'})", callbackId.GetPointer());
		AppLogDebug("%S", eval.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	}
}

void
Contacts::UpdateSearch(Contact* pContact) const {
	// TODO: update this add other fields too (emails, urls, phonenumbers, etc...)
	String eval, displayName, firstName, lastName;
	RecordId recordId = pContact->GetRecordId();
	LongLong test(recordId);
	pContact->GetValue(CONTACT_PROPERTY_ID_DISPLAY_NAME, displayName);
	pContact->GetValue(CONTACT_PROPERTY_ID_FIRST_NAME, firstName);
	pContact->GetValue(CONTACT_PROPERTY_ID_LAST_NAME, lastName);
	eval.Format(256, L"navigator.service.contacts._findCallback({id:'%S', displayName:'%S', name:{firstName:'%S',lastName:'%S'}})",
				test.ToString().GetPointer(),
				displayName.GetPointer(),
				firstName.GetPointer(),
				lastName.GetPointer());
	//AppLogDebug("%S", eval.GetPointer());
	pWeb->EvaluateJavascriptN(eval);
}

void
Contacts::FindByName(const String& filter) {
	Addressbook addressbook;
	Contact* pContact = null;
	IList* pContactList = null;
	IEnumerator* pContactEnum = null;
	String displayName, firstName, lastName;

	result r = addressbook.Construct();
	if(IsFailed(r))
	{
		return;
	}

	// Searching by Email
	pContactList = addressbook.SearchContactsByNameN(filter);
	AppLogDebug("Names Matched %d", pContactList->GetCount());
	pContactEnum = pContactList->GetEnumeratorN();
	while (E_SUCCESS == pContactEnum->MoveNext())
	{
		pContact = (Contact*) pContactEnum->GetCurrent();
		UpdateSearch(pContact);
	}
	delete pContactEnum;
	pContactList->RemoveAll(true);
	delete pContactList;
}
void
Contacts::FindByEmail(const String& filter) {
	Addressbook addressbook;
	Contact* pContact = null;
	IList* pContactList = null;
	IEnumerator* pContactEnum = null;
	String displayName, firstName, lastName;

	result r = addressbook.Construct();
	if(IsFailed(r))
	{
		return;
	}

	// Searching by Email
	pContactList = addressbook.SearchContactsByEmailN(filter);
	AppLogDebug("Emails Matched %d", pContactList->GetCount());
	pContactEnum = pContactList->GetEnumeratorN();
	while (E_SUCCESS == pContactEnum->MoveNext())
	{
		pContact = (Contact*) pContactEnum->GetCurrent();
		UpdateSearch(pContact);
	}
	delete pContactEnum;
	pContactList->RemoveAll(true);
	delete pContactList;
}
void
Contacts::FindByPhoneNumber(const String& filter) {
	Addressbook addressbook;
	Contact* pContact = null;
	IList* pContactList = null;
	IEnumerator* pContactEnum = null;
	String displayName, firstName, lastName;

	result r = addressbook.Construct();
	if(IsFailed(r))
	{
		return;
	}
	// Searching by Email
	pContactList = addressbook.SearchContactsByPhoneNumberN(filter);
	AppLogDebug("Phone Number Matched %d", pContactList->GetCount());
	pContactEnum = pContactList->GetEnumeratorN();
	while (E_SUCCESS == pContactEnum->MoveNext())
	{
		pContact = (Contact*) pContactEnum->GetCurrent();
		UpdateSearch(pContact);
	}
	delete pContactEnum;
	pContactList->RemoveAll(true);
	delete pContactList;
}

void
Contacts::Find(const String& filter) {
	String eval;
	String* value;
	int length = 0;

	// Resetting previous results
	pWeb->EvaluateJavascriptN(L"navigator.service.contacts.results = new Array();");

	// Searching by Name
	FindByName(filter);
	// Searching by PhoneNumber
	FindByPhoneNumber(filter);
	// Searching by Email
	FindByEmail(filter);

	value = pWeb->EvaluateJavascriptN(L"navigator.service.contacts.results.length");
	AppLogDebug("Results length: %S", value->GetPointer());
	result r = Integer::Parse(*value, length);
	if(IsFailed(r)) {
		AppLogException("Could not get Contact Results Length");
		return;
	}

	delete value;
	if(length > 0) {
		eval.Format(128, L"Cordova.callbacks['%S'].success(navigator.service.contacts.results)", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	} else {
		eval.Format(128, L"Cordova.callbacks['%S'].fail({message:'no contacts found',code:00})", callbackId.GetPointer());
		pWeb->EvaluateJavascriptN(eval);
	}
}

void
Contacts::Remove(const String& idStr) {
	String eval;
	Addressbook addressbook;
	RecordId id;
	result r = addressbook.Construct();
	if(IsFailed(r))
	{
		AppLogException("Could not construct Address Book");
		return;
	}
	r = LongLong::Parse(idStr, id);
	if(IsFailed(r)) {
		AppLogException("Could not parse ID");
	} else {
		AppLogDebug("Trying to remove contact with ID %S", idStr.GetPointer());
		r = addressbook.RemoveContact(id);
		if(IsFailed(r)) {
			AppLogDebug("Contact Could not be removed %s %d", GetErrorMessage(r), r);
			eval.Format(256, L"Cordova.callbacks['%S'].fail({message:'%s', code:ContactError.NOT_FOUND_ERROR})",
															 callbackId.GetPointer(), GetErrorMessage(r));
			pWeb->EvaluateJavascriptN(eval);
		} else {
			AppLogDebug("Contact %S removed", idStr.GetPointer());
			eval.Format(256, L"Cordova.callbacks['%S'].success({message:'Contact with ID %d removed', code:01})", callbackId.GetPointer(), id);
			pWeb->EvaluateJavascriptN(eval);
		}
	}
}
