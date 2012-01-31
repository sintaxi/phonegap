/*
 * Notification.h
 *
 *  Created on: Apr 5, 2011
 *      Author: Anis Kadri
 */

#ifndef NOTIFICATION_H_
#define NOTIFICATION_H_

#include <FUi.h>
#include <FUix.h>
#include <FSystem.h>
#include "PhoneGapCommand.h"
using namespace Osp::System;
using namespace Osp::Ui;
using namespace Osp::Ui::Controls;
using namespace Osp::Uix;

class Notification: public PhoneGapCommand {
public:
	Notification(Web* pWeb);
	virtual ~Notification();
public:
	String callbackId;
public:
	void Run(const String& command);
	void Dialog();
	void Vibrate(const long milliseconds);
	void Beep(const int count);
};

#endif /* NOTIFICATION_H_ */
