/*
 * CordovaCommand.h
 *
 *  Created on: Mar 7, 2011
 *      Author: Anis Kadri
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
