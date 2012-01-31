/*
 * Contacts.h
 *
 *  Created on: Mar 25, 2011
 *      Author: Anis Kadri
 */

#ifndef CONTACTS_H_
#define CONTACTS_H_

#include <FSocial.h>
#include "PhoneGapCommand.h"
using namespace Osp::Social;
using namespace Osp::Base::Collection;

class Contacts: public PhoneGapCommand {
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
