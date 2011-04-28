/*
 * PhoneGapCommand.h
 *
 *  Created on: Mar 7, 2011
 *      Author: Anis Kadri
 */

#ifndef PHONEGAPCOMMAND_H_
#define PHONEGAPCOMMAND_H_

#include <FWeb.h>
#include <FBase.h>

using namespace Osp::Web::Controls;
using namespace Osp::Base;
using namespace Osp::Base::Utility;

class PhoneGapCommand {
public:
	PhoneGapCommand();
	PhoneGapCommand(Web* pWeb);
	virtual ~PhoneGapCommand();
protected:
	Web* pWeb;
public:
	virtual void Run(const String& command) =0;
};

#endif /* PHONEGAPCOMMAND_H_ */
