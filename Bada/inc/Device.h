/*
 * Device.h
 *
 *  Created on: Mar 8, 2011
 *      Author: Anis Kadri
 */

#ifndef DEVICE_H_
#define DEVICE_H_

#include "PhoneGapCommand.h"
#include <FSystem.h>

using namespace Osp::System;

class Device: public PhoneGapCommand {
public:
	Device();
	Device(Web* pWeb);
	virtual ~Device();
public:
	result SetDeviceInfo();
	virtual void Run(const String& command);
};

#endif /* DEVICE_H_ */
