/*
 * Kamera.h
 *
 *  Created on: Apr 19, 2011
 *      Author: Anis Kadri
 */

#ifndef KAMERA_H_
#define KAMERA_H_

#include "PhoneGapCommand.h"
#include <FApp.h>
#include <FIo.h>

using namespace Osp::App;
using namespace Osp::Base::Collection;
using namespace Osp::Io;

class Kamera: public PhoneGapCommand, IAppControlEventListener {
public:
	Kamera(Web* pWeb);
	virtual ~Kamera();
public:
	String callbackId;
public:
	void Run(const String& command);
	void GetPicture();
	void OnAppControlCompleted (const String &appControlId, const String &operationId, const IList *pResultList);
};

#endif /* KAMERA_H_ */
