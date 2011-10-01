
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * navigator.camera 
 * 
 * Provides access to the device camera.
 */
var Camera = Camera || (function() {
    /**
     * Format of image that returned from getPicture.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
     */
    var DestinationType = {
        DATA_URL: 0,                // Return base64 encoded string
        FILE_URI: 1                 // Return file URI
    };

    /**
     * Source to getPicture from.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
     */
    var PictureSourceType = {       // Ignored on Blackberry
        PHOTOLIBRARY : 0,           // Choose image from picture library 
        CAMERA : 1,                 // Take picture from camera
        SAVEDPHOTOALBUM : 2         // Choose image from picture library 
    };

    /**
     * @constructor
     */
    function Camera() {
    };

    /**
     * Attach constants to Camera.prototype (this is not really necessary, but
     * we do it for backward compatibility).
     */
    Camera.prototype.DestinationType = DestinationType;
    Camera.prototype.PictureSourceType = PictureSourceType;
    
    /**
     * Gets a picture from source defined by "options.sourceType", and returns the
     * image as defined by the "options.destinationType" option.

     * The defaults are sourceType=CAMERA and destinationType=DATA_URL.
     *
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {Object} options
     */
    Camera.prototype.getPicture = function(successCallback, errorCallback, options) {

        // successCallback required
        if (typeof successCallback != "function") {
            console.log("Camera Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback != "function")) {
            console.log("Camera Error: errorCallback is not a function");
            return;
        }

        var quality = 80;
        if (options.quality) {
            quality = options.quality;
        }
        var destinationType = DestinationType.DATA_URL;
        if (options.destinationType) {
            destinationType = options.destinationType;
        }
        var sourceType = PictureSourceType.CAMERA;
        if (typeof options.sourceType == "number") {
            sourceType = options.sourceType;
        }
        PhoneGap.exec(successCallback, errorCallback, "Camera", "takePicture", [quality, destinationType, sourceType]);
    };

    /**
     * Define navigator.camera object.
     */
    PhoneGap.addConstructor(function() {
        navigator.camera = new Camera();
    });
    
    /**
     * Return an object that contains the static constants.
     */
    return {
        DestinationType: DestinationType,
        PictureSourceType: PictureSourceType
    };
}());
