
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

/**
 * MediaFileData error.
 */
function MediaFileDataError() {
    this.code = 0;
};

MediaFileDataError.UNKNOWN_ERROR = 0;
MediaFileDataError.TIMEOUT_ERROR = 1;

/**
 * Represents media file properties.
 */
var MediaFile = MediaFile || (function() {
    /**
     * Constructor.
     */
    function MediaFile() {
        MediaFile.__super__.constructor.apply(this, arguments);
    };
 
    // extend File
    PhoneGap.extend(MediaFile, File);
    
    /**
     * Media file data.
     * codecs {DOMString} The actual format of the audio and video content.
     * bitrate {Number} The average bitrate of the content. In the case of an image, this attribute has value 0.
     * height {Number} The height of the image or video in pixels. In the case of a sound clip, this attribute has value 0.
     * width {Number The width of the image or video in pixels. In the case of a sound clip, this attribute has value 0.
     * duration {Number} The length of the video or sound clip in seconds. In the case of an image, this attribute has value 0.
     */
    function MediaFileData() {
        this.codecs = null;
        this.bitrate = 0;
        this.height = 0;
        this.width = 0;
        this.duration = 0;
    };
    
    /**
     * Obtains the format data of the media file.
     */
    MediaFile.prototype.getFormatData = function(successCallback, errorCallback) {
        // there is no API (WebWorks or native) that provides this info
        try {
            successCallback(new MediaFileData());
        } 
        catch (e) {
            console.log('Unable to invoke success callback: ' + e);
        }
    };
    
    return MediaFile;
}());

/**
 * Media capture error.
 */
function CaptureError() {
    this.code = 0;
};

// Camera or microphone failed to capture image or sound. 
CaptureError.CAPTURE_INTERNAL_ERR = 0;
// Camera application or audio capture application is currently serving other capture request.
CaptureError.CAPTURE_APPLICATION_BUSY = 1;
// Invalid use of the API (e.g. limit parameter has value less than one).
CaptureError.CAPTURE_INVALID_ARGUMENT = 2;
// User exited camera application or audio capture application before capturing anything.
CaptureError.CAPTURE_NO_MEDIA_FILES = 3;
// The requested capture operation is not supported.
CaptureError.CAPTURE_NOT_SUPPORTED = 20;

/**
 * Encapsulates a set of parameters that the capture device supports.
 */
function ConfigurationData() {
    // The ASCII-encoded string in lower case representing the media type. 
    this.type; 
    // The height attribute represents height of the image or video in pixels. 
    // In the case of a sound clip this attribute has value 0. 
    this.height = 0;
    // The width attribute represents width of the image or video in pixels. 
    // In the case of a sound clip this attribute has value 0
    this.width = 0;
};

/**
 * Encapsulates all image capture operation configuration options.
 */
function CaptureImageOptions() {
    // Upper limit of images user can take. Value must be equal or greater than 1.
    this.limit = 1; 
    // The selected image mode. Must match with one of the elements in supportedImageModes array.
    this.mode; 
};

/**
 * Encapsulates all video capture operation configuration options.
 */
function CaptureVideoOptions() {
    // Upper limit of videos user can record. Value must be equal or greater than 1.
    this.limit = 1;
    // Maximum duration of a single video clip in seconds.
    this.duration;
    // The selected video mode. Must match with one of the elements in supportedVideoModes array.
    this.mode;
};

/**
 * Encapsulates all audio capture operation configuration options.
 */
function CaptureAudioOptions() {
    // Upper limit of sound clips user can record. Value must be equal or greater than 1.
    this.limit = 1;
    // Maximum duration of a single sound clip in seconds.
    this.duration;
    // The selected audio mode. Must match with one of the elements in supportedAudioModes array.
    this.mode;
};

/**
 * navigator.device.capture 
 */
(function() {
    /**
     * Check that navigator.device.capture has not been initialized.
     */
    if (navigator.device && typeof navigator.device.capture !== 'undefined') {
        return;
    }
    
    /**
     * Identification string for the capture plugin.
     */
    var captureId = 'navigator.device.capture';
    
    /**
     * Media capture object.
     */
    function Capture() {
        var self = this, 
            // let PhoneGap know we're ready after retrieving all of the 
            // supported capture modes         
            addCaptureModes = function(type, modes) {
                self[type] = modes;
                if (typeof self.supportedAudioModes !== 'undefined' 
                    && typeof self.supportedImageModes !== 'undefined'
                    && typeof self.supportedVideoModes !== 'undefined') {
                    PhoneGap.initializationComplete(captureId);                    
                }
            };
        
        // populate supported capture modes
        PhoneGap.exec(function(modes) {
            addCaptureModes('supportedAudioModes', parseArray(modes));
        }, function(error) {
            console.log('Unable to retrieve supported audio modes: ' + error);
            addCaptureModes('supportedAudioModes', []);
        }, 'MediaCapture', 'getSupportedAudioModes', []); 
        
        PhoneGap.exec(function(modes) {
            addCaptureModes('supportedImageModes', parseArray(modes));
        }, function(error) {
            console.log('Unable to retrieve supported image modes: ' + error);
            addCaptureModes('supportedImageModes', []);
        }, 'MediaCapture', 'getSupportedImageModes', []); 
        
        PhoneGap.exec(function(modes) {
            addCaptureModes('supportedVideoModes', parseArray(modes));
        }, function(error) {
            console.log('Unable to retrieve supported video modes: ' + error);
            addCaptureModes('supportedVideoModes', []);
        }, 'MediaCapture', 'getSupportedVideoModes', []); 
    };
    
    /**
     * Utility function to parse JSON array.
     */
    var parseArray = function(array) {
        var result = [];

        // get objects from JSONArray
        try {
            result = JSON.parse(array);
        }
        catch (e) {
            console.log('unable to parse JSON: ' + e);
            return result;
        }
        
        return result;
    };
    
    /**
     * Utility function to create MediaFile objects from JSON.
     */
    var getMediaFiles = function(array) {
        var mediaFiles = [], file, objs, obj, len, i, j;
        
        objs = parseArray(array);
        for (i = 0; len = objs.length, i < len; i += 1) {
            obj = objs[i];
            file = new MediaFile();
            for (j in obj) {
                file[j] = obj[j];
            }
            mediaFiles.push(file);
        }
        
        return mediaFiles;
    };
    
    /**
     * Static method for invoking error callbacks.
     * 
     * @param error         CaptureError code
     * @param errorCallback error callback to invoke
     */
    Capture.onError = function(error, errorCallback) {
        var err = new CaptureError();
        err.code = error;
        try {
            errorCallback(err);
        } catch (e) {
            console.log('Error invoking callback: ' + e);
        }
    };

    /**
     * Launch camera application and start an operation to record images.
     * 
     * @param successCallback
     *            invoked with a list of MediaFile objects containing captured
     *            image file properties
     * @param errorCallback
     *            invoked with a CaptureError if capture is unsuccessful
     * @param options
     *            {CaptureVideoOptions} options for capturing video
     */
    Capture.prototype.captureImage = function(successCallback, errorCallback, options) {
        var limit = 1,
            mode = null;

        if (options) {
            if (typeof options.limit === 'number' && options.limit > limit) {
                limit = options.limit;
            }
            if (options.mode) { 
                mode = options.mode;
            }
        }
        
        PhoneGap.exec(function(mediaFiles) {
            successCallback(getMediaFiles(mediaFiles));
        }, function(error) {
            Capture.onError(error, errorCallback);
        }, 'MediaCapture', 'captureImage', [limit, mode]);         
    };
    
    /**
     * Launch video recorder application and start an operation to record video
     * clips.
     * 
     * @param successCallback
     *            invoked with a list of MediaFile objects containing captured
     *            video file properties
     * @param errorCallback
     *            invoked with a CaptureError if capture is unsuccessful
     * @param options
     *            {CaptureVideoOptions} options for capturing video
     */
    Capture.prototype.captureVideo = function(successCallback, errorCallback, options) { 
        var limit = 1,
            duration = 0,
            mode = null;

        if (options) {
            if (typeof options.limit === 'number' && options.limit > limit) {
                limit = options.limit;
            }
            if (typeof options.duration === 'number' && options.duration > 0) {
                duration = options.duration;
            }   
            if (options.mode) { 
                mode = options.mode;
            }
        }
        
        PhoneGap.exec(function(mediaFiles) {
            successCallback(getMediaFiles(mediaFiles));
        }, function(error) {
            Capture.onError(error, errorCallback);
        }, 'MediaCapture', 'captureVideo', [limit, duration, mode]);         
    };

    /**
     * Launch audio recorder application and start an operation to record audio
     * clip(s).
     * 
     * @param successCallback
     *            invoked with a list of MediaFile objects containing captured
     *            audio file properties
     * @param errorCallback
     *            invoked with a CaptureError if capture is unsuccessful
     * @param options
     *            {CaptureAudioOptions} options for capturing audio
     */
    Capture.prototype.captureAudio = function(successCallback, errorCallback, options) { 
        var limit = 1, 
            duration = 0,
            mode = null;
        
        if (options) {
            if (typeof options.limit === 'number' && options.limit > limit) {
                limit = options.limit;
            }
            if (typeof options.duration === 'number' && options.duration > 0) {
                duration = options.duration;
            }   
            if (options.mode) { 
                mode = options.mode;
            }
        }   
        
        PhoneGap.exec(function(mediaFiles) {
            successCallback(getMediaFiles(mediaFiles));
        }, function(error) {
            Capture.onError(error, errorCallback);
        }, 'MediaCapture', 'captureAudio', [limit, duration, mode]);         
    };
    
    /**
     * Cancels all pending capture operations.
     */
    Capture.prototype.cancelCaptures = function() { 
        PhoneGap.exec(null, null, 'MediaCapture', 'stopCaptures', []);
    }
    
    /**
     * Define navigator.device.capture object.
     */
    PhoneGap.addConstructor(function() {
        PhoneGap.waitForInitialization(captureId);
        navigator.device.capture = new Capture();
    });
}());
