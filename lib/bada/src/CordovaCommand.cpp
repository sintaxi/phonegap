/*
 * CordovaCommand.cpp
 *
 *  Created on: Mar 7, 2011
 *      Author: Anis Kadri
 */

#include "CordovaCommand.h"

CordovaCommand::CordovaCommand() : pWeb(null) {
}
CordovaCommand::CordovaCommand(Web* pWeb) : pWeb(pWeb) {
}

CordovaCommand::~CordovaCommand() {
}
