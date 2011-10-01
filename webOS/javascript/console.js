
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * phonegap.Logger is a Blackberry WebWorks extension that will log to the 
 * BB Event Log and System.out.  Comment this line to disable.
 */ 
phonegap.Logger.enable();

/**
 * If Blackberry doesn't define a console object, we create our own.
 * console.log will use phonegap.Logger to log to BB Event Log and System.out.
 */
if (typeof console == "undefined") {    
    console = {};
}
console.log = function(msg) {
    phonegap.Logger.log(''+msg);
};
