
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.device
 * 
 * Represents the mobile device, and provides properties for inspecting the
 * model, version, UUID of the phone, etc.
 */
(function() {
    /**
     * @constructor
     */
    function Device() {
        this.platform = phonegap.device.platform;
        this.version  = blackberry.system.softwareVersion;
        this.name     = blackberry.system.model;
        this.uuid     = phonegap.device.uuid;
        this.phonegap = phonegap.device.phonegap;
    };

    /**
     * Define navigator.device.
     */
    PhoneGap.addConstructor(function() {
        window.device = new Device();

        /* Newer BlackBerry 6 devices now define `navigator.device` */
        if (typeof navigator.device === 'undefined') {
            navigator.device = {};
        }

        /* Add PhoneGap device properties */
        for (var key in window.device) {
            navigator.device[key] = window.device[key];
        }

        PhoneGap.onPhoneGapInfoReady.fire();
    });
}());
