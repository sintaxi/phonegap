if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

function PhoneGap() {
	ready = true;
	available = true;
	sceneController = null;	
}; 

PhoneGap.exec = function(win, fail, clazz, action, args) {

 setTimeout(function() { 
	 PhoneGap.plugins[clazz].execute(action, args, win, fail); 
   }, 0);

}

PhoneGap.checkArgs = function(args, func) {
    if (typeof args == 'object')
        func.apply(null, args);
    else
        func(args);
}

PhoneGap.callback = function(success, win, fail) {
	if (success)
		win();
	else
		fail();    
}

// translates the action into an API call
accelerometerAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'setFastAccelerometer':				
				PhoneGap.checkArgs(args, navigator.accelerometer.setFastAccelerometer);    
				actionFound = true; 
				break;
			case 'getCurrentAcceleration':
				PhoneGap.checkArgs(args, navigator.accelerometer.getCurrentAcceleration);
				actionFound = true;
				break;	
			case 'watchAcceleration':
			    PhoneGap.checkArgs(args, navigator.accelerometer.watchAcceleration);
			    actionFound = true;
			    break;
			case 'clearWatch':
			    PhoneGap.checkArgs(args, navigator.accelerometer.clearWatch);
			    actionFound = true;
			    break;
			case 'start':
			    PhoneGap.checkArgs(args, navigator.accelerometer.start);
			    actionFound = true;
			    break;      		
		}

        PhoneGap.callback(actionFound, win, fail);
    }
}

applicationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'activate':				
				PhoneGap.checkArgs(args, navigator.application.activate);    
				actionFound = true; 
				break;
			case 'deactivate':
				PhoneGap.checkArgs(args, navigator.application.deactivate);
				actionFound = true;
				break;	
			case 'getIdentifier':
			    PhoneGap.checkArgs(args, navigator.application.getIdentifier);
			    actionFound = true;
			    break;      		
		}

		PhoneGap.callback(actionFound, win, fail);       
    }
}

cameraAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getPicture':
				console.log("in here");
				PhoneGap.checkArgs(args, navigator.camera.getPicture);    
				actionFound = true; 
				break;      		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

debugAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'log':				
				PhoneGap.checkArgs(args, window.debug.log);    
				actionFound = true; 
				break;
		    case 'warn':
			    PhoneGap.checkArgs(args, window.debug.warn);    
			    actionFound = true; 
			    break;		    
		    case 'error':
			    PhoneGap.checkArgs(args, window.debug.error);    
			    actionFound = true; 
			    break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

deviceAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getDeviceInfo':				
				PhoneGap.checkArgs(args, navigator.device.getDeviceInfo);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

geolocationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getCurrentPosition':				
				PhoneGap.checkArgs(args, navigator.geolocation.getCurrentPosition);    
				actionFound = true; 
				break; 
			case 'watchPosition':				
				PhoneGap.checkArgs(args, navigator.geolocation.watchPosition);    
				actionFound = true; 
				break;
			case 'clearWatch':
			    PhoneGap.checkArgs(args, navigator.geolocation.clearWatch);    
			    actionFound = true; 
			    break;
			case 'start':
			    PhoneGap.checkArgs(args, navigator.geolocation.start);    
			    actionFound = true; 
			    break;
			case 'stop':
			    PhoneGap.checkArgs(args, navigator.geolocation.stop);    
			    actionFound = true; 
			    break;								   	          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

mapAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'show':				
				PhoneGap.checkArgs(args, navigator.map.show);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

mouseAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'simulateMouseClick':				
				PhoneGap.checkArgs(args, navigator.mouse.simulateMouseClick);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
} 

networkAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'isReachable':				
				PhoneGap.checkArgs(args, navigator.network.isReachable);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

notificationAPI = {
    execute: function(action, args, win, fail) {
		var actionFound = false;
		switch(action) {
			case 'alert':				
				PhoneGap.checkArgs(args, navigator.notification.alert);    
				actionFound = true; 
				break;
			case 'showBanner':
				PhoneGap.checkArgs(args, navigator.notification.showBanner);
				actionFound = true;
				break;	
			case 'newDashboard':
			    PhoneGap.checkArgs(args, navigator.notification.newDashboard);
			    actionFound = true;
			    break;
			case 'removeBannerMessage':
			    PhoneGap.checkArgs(args, navigator.notification.removeBannerMessage);
			    actionFound = true;
			    break;
			case 'clearBannerMessage':
			    PhoneGap.checkArgs(args, navigator.notification.clearBannerMessage);
			    actionFound = true;
			    break;
			case 'vibrate':            
			    PhoneGap.checkArgs(args, navigator.notification.vibrate);
			    actionFound = true;
			    break;
			case 'beep':               
			    PhoneGap.checkArgs(args, navigator.notification.beep);
			    actionFound = true;
			    break;       		
		}

		PhoneGap.callback(actionFound, win, fail);
   }
}

orientationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'setOrientation':				
				PhoneGap.checkArgs(args, navigator.orientation.setOrientation);    
				actionFound = true; 
				break;
			case 'getOrientation':
			    PhoneGap.checkArgs(args, navigator.orientation.getOrientation);    
			    actionFound = true; 
			    break;			    
			case 'start':
			    PhoneGap.checkArgs(args, navigator.orientation.start);    
				actionFound = true; 
				break;
			case 'watchOrientation':
			    PhoneGap.checkArgs(args, navigator.orientation.watchOrientation);    
				actionFound = true; 
				break;
			case 'clearWatch':
                PhoneGap.checkArgs(args, navigator.orientation.clearWatch);    
			    actionFound = true; 
			    break;
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

smsAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				PhoneGap.checkArgs(args, navigator.sms.send);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

telephonyAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				PhoneGap.checkArgs(args, navigator.telephony.send);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

windowAPI = {
    execute: function(action, args, win, fail) {
   		var actionFound = false;
   		switch(action) {
   			case 'newCard':
   			    PhoneGap.checkArgs(args, navigator.window.newCard);  				    
   				actionFound = true; 
   				break;
   			case 'setFullScreen':
   			  	PhoneGap.checkArgs(args, navigator.window.setFullScreen);
   				actionFound = true; 
   				break;
   			case 'setWindowProperties':
   			    PhoneGap.checkArgs(args, navigator.window.setWindowProperties);
		        actionFound = true;
		        break;   			
   			case 'blockScreenTimeout':
   			    PhoneGap.checkArgs(args, navigator.window.blockScreenTimeout);
   			    actionFound = true;
		        break;
   			case 'setSubtleLightbar':
   			    PhoneGap.checkArgs(args, navigator.window.setSubtleLightbar);
   			    actionFound = true;
   			    break;
   				   			  	
   		}

   		PhoneGap.callback(actionFound, win, fail);
      }    
}

// this mapping acts as a shim to the webOS APIs
PhoneGap.plugins = {};
PhoneGap.plugins['navigator.accelerometer'] = accelerometerAPI;
PhoneGap.plugins['navigator.application'] = applicationAPI;
PhoneGap.plugins['navigator.camera'] = cameraAPI;
PhoneGap.plugins['window.debug'] = debugAPI;
PhoneGap.plugins['navigator.device'] = deviceAPI;
PhoneGap.plugins['navigator.geolocation'] = geolocationAPI;
PhoneGap.plugins['navigator.map'] = mapAPI;
PhoneGap.plugins['navigator.mouse'] = mouseAPI;
PhoneGap.plugins['navigator.network'] = networkAPI; 
PhoneGap.plugins['navigator.notification'] = notificationAPI;
PhoneGap.plugins['navigator.orientation'] = orientationAPI; 
PhoneGap.plugins['navigator.sms'] = smsAPI;
PhoneGap.plugins['navigator.telephony'] = telephonyAPI;  
PhoneGap.plugins['navigator.window'] = windowAPI;


document.addEventListener('DOMContentLoaded', function () {
    window.phonegap = new PhoneGap();
    navigator.device.deviceReady();
});
/*
 * This class contains acceleration information
 * @constructor
 * @param {Number} x The force applied by the device in the x-axis.
 * @param {Number} y The force applied by the device in the y-axis.
 * @param {Number} z The force applied by the device in the z-axis.
 */
function Acceleration(x, y, z) {
	/*
	 * The force applied by the device in the x-axis.
	 */
	this.x = x;
	/*
	 * The force applied by the device in the y-axis.
	 */
	this.y = y;
	/*
	 * The force applied by the device in the z-axis.
	 */
	this.z = z;
	/*
	 * The time that the acceleration was obtained.
	 */
	this.timestamp = new Date().getTime();
};

/*
 * This class specifies the options for requesting acceleration data.
 * @constructor
 */
function AccelerationOptions() {
	/*
	 * The timeout after which if acceleration data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
};

/*
 * This class provides access to device accelerometer data.
 * @constructor
 */
function Accelerometer() {
	/*
	 * The last known acceleration.
	 */
	this.lastAcceleration = null;
};

/*
 * Tells WebOS to put higher priority on accelerometer resolution. Also relaxes the internal garbage collection events.
 * @param {Boolean} state
 * Dependencies: Mojo.windowProperties
 * Example:
 * 		navigator.accelerometer.setFastAccelerometer(true)
 */
Accelerometer.prototype.setFastAccelerometer = function(state) {
	navigator.windowProperties.fastAccelerometer = state;
	navigator.window.setWindowProperties();
};

/*
 * Asynchronously aquires the current acceleration.
 * @param {Function} successCallback The function to call when the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {

    var referenceTime = 0;
    if (this.lastAcceleration)
        referenceTime = this.lastAcceleration.timestamp;
    else
        this.start();
 
    var timeout = 20000;
    var interval = 500;
    if (typeof(options) == 'object' && options.interval)
        interval = options.interval;
 
    if (typeof(successCallback) != 'function')
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};
 
    var dis = this;
    var delay = 0;
    var timer = setInterval(function() {
        delay += interval;
 
		//if we have a new acceleration, call success and cancel the timer
        if (typeof(dis.lastAcceleration) == 'object' && dis.lastAcceleration != null && dis.lastAcceleration.timestamp > referenceTime) {
            successCallback(dis.lastAcceleration);
            clearInterval(timer);
        } else if (delay >= timeout) { //else if timeout has occured then call error and cancel the timer
            errorCallback();
            clearInterval(timer);
        }
		//else the interval gets called again
    }, interval);
};


/*
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
	this.getCurrentAcceleration(successCallback, errorCallback, options);
	// TODO: add the interval id to a list so we can clear all watches
 	var frequency = (options != undefined)? options.frequency : 10000;
	var that = this;
	return setInterval(function() {
		that.getCurrentAcceleration(successCallback, errorCallback, options);
	}, frequency);
};

/*
 * Clears the specified accelerometer watch.
 * @param {String} watchId The ID of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

/*
 * Starts the native acceleration listener.
 */

Accelerometer.prototype.start = function() {
	var that = this;
	//Mojo.Event.listen(document, "acceleration", function(event) {
	document.addEventListener("acceleration", function(event) {
		var accel = new Acceleration(event.accelX, event.accelY, event.accelZ);
		that.lastAcceleration = accel;
	});
};

if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();

function Application() {
	
};

/*
 * Tell webOS to activate the current page of your app, bringing it into focus.
 * Example:
 * 		navigator.application.activate();
 */	
Application.prototype.activate = function() {
	PalmSystem.activate();
};

/*
 * Tell webOS to deactivate your app.
 * Example:
 *		navigator.application.deactivate();
 */	
Application.prototype.deactivate = function() {
	PalmSystem.deactivate();
};

/*
 * Returns the identifier of the current running application (e.g. com.yourdomain.yourapp).
 * Example:
 *		navigator.application.getIdentifier();
 */
Application.prototype.getIdentifier = function() {
	return PalmSystem.identifier;
};

if (typeof navigator.application == "undefined") navigator.application = new Application();

/*
 * This class provides access to the device audio
 * @constructor
 */

PhoneGap.overrideAudio = function() {
	
	PhoneGap.MojoAudio = Audio;
	
	Audio = function(src) {
		this.src = src;							
	};

	Audio.prototype.play = function() {
		// this.src = src;
		// The 'end' event listener doesn't seem to work, so we have to call stop before playing
		// otherwise, we'll never be able to play again
		if (this.paused && !this.stopped) {
			this.paused = false;
			this.playing = true;	
			this.audioPlayer.play();
		} else {
			if (this.audioPlayer)
				this.stop();
			if (!this.playing) {
				this.paused = false;
				this.playing = true;	
				this.stopped = false;
				this.audioPlayer = new PhoneGap.MojoAudio();
				var file = Mojo.appPath + this.src;
				if (this.audioPlayer.palm) {
					this.audioPlayer.mojo.audioClass = "media";
				}
				this.audioPlayer.src = file;
		
				//event doesn't work, see above
				this.audioPlayer.addEventListener('end', this.endHandler, false);
				this.audioPlayer.play();
			}
		}
	};

	Audio.prototype.pause = function() {
		if (this.stopped)
			return;
		this.paused = true;	
		if (this.playing) {
			this.playing = false;
			this.stopped = false;
			this.audioPlayer.pause();
		} else {
			this.playing = false;	
			this.paused = false;
			this.stopped = true;
		}
	};

	Audio.prototype.stop = function() {
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.playing = false;	
		this.paused = false;
		this.stopped = true;
	};

	// End event handler not working (see comment in Audio.prototype.play)
	Audio.prototype.endHandler = function () {
		this.audioPlayer.removeEventListener('end', endHandler, false);
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.paused = false;
		this.stopped = true;
	};

	/*
	 * This class contains information about any Media errors.
	 * @constructor
	 */
	MediaError = function() {
		this.code = null,
		this.message = "";
	};

	MediaError.MEDIA_ERR_ABORTED 		= 1;
	MediaError.MEDIA_ERR_NETWORK 		= 2;
	MediaError.MEDIA_ERR_DECODE 		= 3;
	MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

}

document.addEventListener("deviceready", PhoneGap.overrideAudio, false);

/*
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
};

/*
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {

	var filename = "";

	if (typeof options != 'undefined' && typeof options.filename != 'undefined') {
		filename = options.filename;
	}	

	this.service = navigator.service.Request('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
		id: 'com.palm.app.camera',
		params: {
				appId: 'com.palm.app.camera',
				name: 'capture',
				sublaunch: true,
				filename: filename
			}
		},
		onSuccess: successCallback,
		onFailure: errorCallback
	});	
};

if (typeof navigator.camera == 'undefined') navigator.camera = new Camera();

/*
 * This class provides access to the device contacts.
 * @constructor
 */

function Contacts() {
	
};

function Contact() {
    this.phones = [];
    this.emails = [];
	this.name = {
		givenName: "",
		familyName: "",
		formatted: ""
	};
	this.id = "";
};

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.givenName + " " + this.familyName;
};

function ContactsFilter(name) {
	if (name)
		this.name = name;
	else
		this.name = "";
};

/*
 * @param {ContactsFilter} filter Object with filter properties. filter.name only for now.
 * @param {function} successCallback Callback function on success
 * @param {function} errorCallback Callback function on failure
 * @param {object} options Object with properties .page and .limit for paging
 */

Contacts.prototype.find = function(filter, successCallback, errorCallback, options) {
	errorCallback({ name: "ContactsError", message: "PhoneGap Palm contacts not implemented" });
};

Contacts.prototype.success_callback = function(contacts_iterator) {
};

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();
/*
 * This class provides access to the debugging console.
 * @constructor
 */
function DebugConsole() {
};

/*
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message) {
	if (typeof message == 'object')
		message = Object.toJSON(message);   
		
	this.error(message);
};

/*
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message) {
	if (typeof message == 'object')
		message = Object.toJSON(message);    
		
	this.error(message);
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message) {
	if (typeof message == 'object')
		message = Object.toJSON(message);
 
	console.log(JSON.stringify(message));
};

if (typeof window.debug == "undefined") window.debug = new DebugConsole();
/*
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.platform = "palm";
    this.version  = null;
    this.name     = null;
    this.uuid     = null;
    this.deviceInfo = null;
};

/*
 * A direct call to return device information.
 * Example:
 *		var deviceinfo = JSON.stringify(navigator.device.getDeviceInfo()).replace(/,/g, ', ');
 */
Device.prototype.getDeviceInfo = function() {
	return this.deviceInfo;//JSON.parse(PalmSystem.deviceInfo);
};

/*
 * needs to be invoked in a <script> nested within the <body> it tells WebOS that the app is ready
        TODO: see if we can get this added as in a document.write so that the user doesn't have to explicitly call this method
 * Dependencies: Mojo.onKeyUp
 * Example:
 *		navigator.device.deviceReady();
 */	
Device.prototype.deviceReady = function() {

	// tell webOS this app is ready to show
	if (window.PalmSystem) {
		// setup keystroke events for forward and back gestures
		document.body.addEventListener("keyup", Mojo.onKeyUp, true);

		setTimeout(function() { PalmSystem.stageReady(); PalmSystem.activate(); }, 1);
		alert = this.showBanner;
	}

    // fire deviceready event; taken straight from phonegap-iphone
    // put on a different stack so it always fires after DOMContentLoaded
    window.setTimeout(function () {
        var e = document.createEvent('Events');
        e.initEvent('deviceready');
        document.dispatchEvent(e);
    }, 10);
	
	this.setUUID();
	this.setDeviceInfo();
};

Device.prototype.setDeviceInfo = function() {
    var parsedData = JSON.parse(PalmSystem.deviceInfo);
    
    this.deviceInfo = parsedData;
    this.version = parsedData.platformVersion;
    this.name = parsedData.modelName;
};

Device.prototype.setUUID = function() {
	//this is the only system property webos provides (may change?)
	var that = this;
	this.service = navigator.service.Request('palm://com.palm.preferences/systemProperties', {
	    method:"Get",
	    parameters:{"key": "com.palm.properties.nduid" },
	    onSuccess: function(result) {
			that.uuid = result["com.palm.properties.nduid"];
		}
    });	


};


if (typeof window.device == 'undefined') window.device = navigator.device = new Device();

/*
 * This class provides generic read and write access to the mobile device file system.
 */
function File() {
	/**
	 * The data of a file.
	 */
	this.data = "";
	/**
	 * The name of the file.
	 */
	this.name = "";
};

/*
 * Reads a file from the mobile device. This function is asyncronous.
 * @param {String} fileName The name (including the path) to the file on the mobile device. 
 * The file name will likely be device dependant.
 * @param {Function} successCallback The function to call when the file is successfully read.
 * @param {Function} errorCallback The function to call when there is an error reading the file from the device.
 */
File.prototype.read = function(fileName, successCallback, errorCallback) {
	//Mojo has no file i/o yet, so we use an xhr. very limited
	var path = fileName;	//incomplete
	//Mojo.Log.error(path);
	navigator.debug.error(path);
	
	if (typeof successCallback != 'function')
		successCallback = function () {};
	if (typeof errorCallback != 'function')
		errorCallback = function () {};
	
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200 && xhr.responseText != null) {
				this.data = xhr.responseText;
				this.name = path;
				successCallback(this.data);
			} else {
				errorCallback({ name: xhr.status, message: "could not read file: " + path });
			}
		}
	};
	xhr.open("GET", path, true);
	xhr.send();
};

/*
 * Writes a file to the mobile device. 
 * @param {File} file The file to write to the device.
 */
File.prototype.write = function(file) {
	//Palm does not provide file i/o
};

if (typeof navigator.file == "undefined") navigator.file = new File();

/*
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
    this.lastPosition = null;
    this.lastError = null;
    this.callbacks = {
        onLocationChanged: [],
        onError: []
    };
};

/*
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    /*
	var referenceTime = 0;
    if (this.lastPosition)
        referenceTime = this.lastPosition.timestamp;
    else
        this.start(options);
	*/

    var timeout = 20000;
    if (typeof(options) == 'object' && options.timeout)
    timeout = options.timeout;

    if (typeof(successCallback) != 'function')
    successCallback = function() {};
    if (typeof(errorCallback) != 'function')
    errorCallback = function() {};

    /*
    var dis = this;
    var delay = 0;
    var timer = setInterval(function() {
        delay += interval;
		
		//if we have a new position, call success and cancel the timer
        if (dis.lastPosition && typeof(dis.lastPosition) == 'object' && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) { //else if timeout has occured then call error and cancel the timer
            errorCallback();
            clearInterval(timer);
        }
		//else the interval gets called again
    }, interval);
	*/

    var responseTime;
    if (timeout <= 5000)
    responseTime = 1;
    else if (5000 < timeout <= 20000)
    responseTime = 2;
    else
    responseTime = 3;

    var timer = setTimeout(function() {
        errorCallback({
            message: "timeout"
        });
    },
    timeout);

    var startTime = (new Date()).getTime();

    var alias = this;

    // It may be that getCurrentPosition is less reliable than startTracking ... but
    // not sure if we want to be starting and stopping the tracker if we're not watching.
    //new Mojo.Service.Request('palm://com.palm.location', {
    navigator.service.Request('palm://com.palm.location', {
        method: "getCurrentPosition",
        parameters: {
            responseTime: responseTime
        },
        onSuccess: function(event) {
            alias.lastPosition = {
                coords: {
                    latitude: event.latitude,
                    longitude: event.longitude,
                    altitude: (event.altitude >= 0 ? event.altitude: null),
                    speed: (event.velocity >= 0 ? event.velocity: null),
                    heading: (event.heading >= 0 ? event.heading: null),
                    accuracy: (event.horizAccuracy >= 0 ? event.horizAccuracy: null),
                    altitudeAccuracy: (event.vertAccuracy >= 0 ? event.vertAccuracy: null)
                },
                timestamp: new Date().getTime()
            };

            var responseTime = alias.lastPosition.timestamp - startTime;
            if (responseTime <= timeout)
            {
                clearTimeout(timer);
                successCallback(alias.lastPosition);
            }
        },
        onFailure: function() {
            errorCallback();
        }
    });

};

/*
 * Asynchronously aquires the position repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout and the frequency of the watch.
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
    // Invoke the appropriate callback with a new Position object every time the implementation
    // determines that the position of the hosting device has changed.
    var frequency = 10000;
    if (typeof(options) == 'object' && options.frequency)
    frequency = options.frequency;

    this.start(options, errorCallback);

    var referenceTime = 0;
    if (this.lastPosition)
    referenceTime = this.lastPosition.timestamp;

    var alias = this;
    return setInterval(function() {
        // check if we have a new position, if so call our successcallback
        if (!alias.lastPosition)
        return;

        if (alias.lastPosition.timestamp > referenceTime)
        successCallback(alias.lastPosition);
    },
    frequency);
};


/*
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function(watchId) {
    clearInterval(watchId);
    this.stop();
};

Geolocation.prototype.start = function(options, errorCallback) {
    //options.timeout;
    //options.interval;
    if (typeof(errorCallback) != 'function')
    errorCallback = function() {};

    var that = this;
    var frequency = 10000;
    if (typeof(options) == 'object' && options.frequency)
    frequency = options.frequency;

    var responseTime;
    if (frequency <= 5000)
    responseTime = 1;
    else if (5000 < frequency <= 20000)
    responseTime = 2;
    else
    responseTime = 3;

    //location tracking does not support setting a custom interval :P
    this.trackingHandle = navigator.service.Request('palm://com.palm.location', {
        method: 'startTracking',
        parameters: {
            subscribe: true
        },
        onSuccess: function(event) {
            that.lastPosition = {
                coords: {
                    latitude: event.latitude,
                    longitude: event.longitude,
                    altitude: (event.altitude >= 0 ? event.altitude: null),
                    speed: (event.velocity >= 0 ? event.velocity: null),
                    heading: (event.heading >= 0 ? event.heading: null),
                    accuracy: (event.horizAccuracy >= 0 ? event.horizAccuracy: null),
                    altitudeAccuracy: (event.vertAccuracy >= 0 ? event.vertAccuracy: null)
                },
                timestamp: new Date().getTime()
            };
        },
        onFailure: function() {
            errorCallback();
        }
    });
};

Geolocation.prototype.stop = function() {
    this.trackingHandle.cancel();
};

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();

/*
 * This class provides access to native mapping applications on the device.
 */
function Map() {
	
};

/*
 * Shows a native map on the device with pins at the given positions.
 * @param {Array} positions
 */
Map.prototype.show = function(positions) {

	var jsonPos = {};
	var pos = null;
	if (typeof positions == 'object') {
		// If positions is an array, then get the first only, since google's query
		// can't take more than one marker (believe it or not).
		// Otherwise we assume its a single position object.
		if (positions.length) {
			pos = positions[0];
		} else {
			pos = positions;
		}
	} 
	else if (navigator.geolocation.lastPosition) {
		pos = navigator.geolocation.lastPosition;
	} else {
		// If we don't have a position, lets use nitobi!
		pos = { coords: { latitude: 49.28305, longitude: -123.10689 } };
	}

	this.service = navigator.service.Request('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
		id: 'com.palm.app.maps',
		params: {
			query: "@" + pos.coords.latitude + "," + pos.coords.longitude
			}
		}
	});

};

if (typeof navigator.map == "undefined") navigator.map = new Map();

//===========================
//		Mojo Dependencies - we still need to rely on these minimal parts of the Mojo framework - should try to find if we can get access to lower level APIs
//							so that we can remove dependence of Mojo
//===========================
	
Mojo = {
	contentIndicator: false,

	// called by webOS in certain cases
	relaunch: function() {
		var launch = JSON.parse(PalmSystem.launchParams);
		
		if (launch['palm-command'] && launch['palm-command'] == 'open-app-menu')
			this.fireEvent(window, "appmenuopen");
		else
			this.fireEvent(window, "palmsystem", launch);
	},
	
	// called by webOS when your app gets focus
	stageActivated: function() {
		this.fireEvent(window, "activate");
	},

	// called by webOS when your app loses focus
	stageDeactivated: function() {
		this.fireEvent(window, "deactivate");
	},

	// this is a stub -- called by webOS when orientation changes
	// but the preferred method is to use the orientationchanged
	// DOM event
	screenOrientationChanged: function(dir) {
	},
	
	// used to redirect keyboard events to DOM event "back"
	onKeyUp: function(e) {
		if (e.keyCode == 27)
			this.fireEvent(window, "back");
	},
		
	// private method, used to fire off DOM events
	fireEvent: function(element, event, data) {
		var e = document.createEvent("Event");
		e.initEvent(event, false, true);
		
		if (data)
			e.data = data;
		
		element.dispatchEvent(e);
	},
	
	/*
	 	not sure if these stubs are still needed since the Log object is encapsulated in debugconsole class 
		and the Service object is encapsulated in the Service class
	*/
	// stubs to make v8 happier
	Service: {},
	Log: {}
	
};function Mouse() {
	
};

/*
 * Possibly useful for automated testing, this call to PalmSystem triggers a mouse click (i.e. touch event). 
 * x coordinate & y coordinate of where the screen was touched and also a true/false flag to tell WebOS if it should simulate the mouse click
 * @param {Number} x
 * @param {Number} y
 * @param {Boolean} state
 * Example:
 *		navigator.mouse.simulateMouseClick(10, 10, true);
 */	
Mouse.prototype.simulateMouseClick = function(x, y, state) {
	PalmSystem.simulateMouseClick(x, y, state || true);
};

if (typeof navigator.mouse == "undefined") navigator.mouse = new Mouse();

function Network() {
    /*
     * The last known Network status.
     */
	this.lastReachability = null;
};

Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.request = navigator.service.Request('palm://com.palm.connectionmanager', {
	    method: 'getstatus',
	    parameters: {},
	    onSuccess: function(result) { 
			var status = NetworkStatus.NOT_REACHABLE;
			if (result.isInternetConnectionAvailable == true)
			{
				// don't know whether its via wifi or carrier ... so return the worst case
				status = NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK;
			}
			successCallback(status); 
		},
	    onFailure: function() {}
	});

};

/*
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
};

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

if (typeof navigator.network == "undefined") navigator.network = new Network();

/*
 * This class provides access to notifications on the device.
 */
function Notification() {

    };

/*
 * adds a dashboard to the WebOS app
 * @param {String} url
 * @param {String} html
 * Example:
 *		navigator.notification.newDashboard("dashboard.html");
 */
Notification.prototype.newDashboard = function(url, html) {
    var win = window.open(url, "_blank", "attributes={\"window\":\"dashboard\"}");
    html && win.document.write(html);
    win.PalmSystem.stageReady();
};

/*
 * Displays a banner notification. If specified, will send your 'response' object as data via the 'palmsystem' DOM event.
 * If no 'icon' filename is specified, will use a small version of your application icon.
 * @param {String} message
 * @param {Object} response
 * @param {String} icon 
 * @param {String} soundClass class of the sound; supported classes are: "ringtones", "alerts", "alarm", "calendar", "notification"
 * @param {String} soundFile partial or full path to the sound file
 * @param {String} soundDurationMs of sound in ms
 * Example:
 *		navigator.notification.showBanner('test message');
 */
Notification.prototype.showBanner = function(message, response, icon, soundClass, soundFile, soundDurationMs) {
    var response = response || {
        banner: true
    };
    PalmSystem.addBannerMessage(message, JSON.stringify(response), icon, soundClass, soundFile, soundDurationMs);
};

/**
 * Remove a banner from the banner area. The category parameter defaults to 'banner'. Will not remove
 * messages that are already displayed.
 * @param {String} category 
		Value defined by the application and usually same one used in {@link showBanner}. 
		It is used if you have more than one kind of banner message. 
 */
Notification.prototype.removeBannerMessage = function(category) {
    var bannerKey = category || 'banner';
    var bannerId = this.banners.get(bannerKey);
    if (bannerId) {
        try {
            PalmSystem.removeBannerMessage(bannerId);
        } catch(removeBannerException) {
            window.debug.error(removeBannerException.toString());
        }
    }
};

/*
 * Remove all pending banner messages from the banner area. Will not remove messages that are already displayed.
 */
Notification.prototype.clearBannerMessage = function() {
    PalmSystem.clearBannerMessage();
};

/*
 * This function vibrates the device
 * @param {number} duration The duration in ms to vibrate for.
 * @param {number} intensity The intensity of the vibration
 */
Notification.prototype.vibrate = function(duration, intensity) {
    //the intensity for palm is inverted; 0=high intensity, 100=low intensity
    //this is opposite from our api, so we invert
    if (isNaN(intensity) || intensity > 100 || intensity <= 0)
    intensity = 0;
    else
    intensity = 100 - intensity;

    // if the app id does not have the namespace "com.palm.", an error will be thrown here
    //this.vibhandle = new Mojo.Service.Request("palm://com.palm.vibrate", {
    this.vibhandle = navigator.service.Request("palm://com.palm.vibrate", {
        method: 'vibrate',
        parameters: {
            'period': intensity,
            'duration': duration
        }
    },
    false);
};

/* 
 * Plays the specified sound
 * @param {String} soundClass class of the sound; supported classes are: "ringtones", "alerts", "alarm", "calendar", "notification"
 * @param {String} soundFile partial or full path to the sound file
 * @param {String} soundDurationMs of sound in ms
 */
Notification.prototype.beep = function(soundClass, soundFile, soundDurationMs) {
    PalmSystem.playSoundNotification(soundClass, soundFile, soundDurationMs);
};

/*
 * displays a notification
 * @param {String} message
 * @param {Object} response
 * @param {String} icon
 */
Notification.prototype.alert = function(message, response, icon) {
    var response = response || {
        banner: true
    };
    navigator.notification.showBanner(message, response, icon);
};

if (typeof navigator.notification == 'undefined') {
    navigator.notification = new Notification();
    alert = navigator.notification.alert;
}

/*
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	this.started = false;
};

/*
 * Manually sets the orientation of the application window. 
 * 'up', 'down', 'left' or 'right' used to specify fixed window orientation
 * 'free' WebOS will change the window orientation to match the device orientation
 * @param {String} orientation
 * Example:
 *		navigator.orientation.setOrientation('up');
 */
Orientation.prototype.setOrientation = function(orientation) {
	PalmSystem.setWindowOrientation(orientation);   
};

/*
 * Returns the current window orientation
 */
Orientation.prototype.getCurrentOrientation = function() {
  	return PalmSystem.windowOrientation;
};

/*
 * Starts the native orientationchange event listener.
 */  
Orientation.prototype.start = function (successCallback) {
	var that = this;
	// This subscribes the callback once for the successCallback function
	that.callback = function (e) {
		document.removeEventListener("orientationChanged", that.callback);
		successCallback(e.orientation);
	}
	
	document.addEventListener("orientationChanged", that.callback);
	
	// This subscribes setOrientation to be constantly updating the currentOrientation property
	document.addEventListener("orientationchange", function(event) {
		var orient = null;
		switch (event.position) {
			case 0: orient = DisplayOrientation.FACE_UP; break;
			case 1: orient = DisplayOrientation.FACE_DOWN; break;
			case 2: orient = DisplayOrientation.PORTRAIT; break;
			case 3: orient = DisplayOrientation.REVERSE_PORTRAIT; break;
			case 4: orient = DisplayOrientation.LANDSCAPE_RIGHT_UP; break;
			case 5: orient = DisplayOrientation.LANDSCAPE_LEFT_UP; break;
			default: return; 	//orientationchange event seems to get thrown sometimes with a null event position
		}
		that.setOrientation(orient);
	});
	this.started = true;
};

/*
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */             
Orientation.prototype.watchOrientation = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentOrientation(successCallback, errorCallback);
	var interval = 1000;
	if (options && !isNaN(options.interval))
		interval = options.interval;
	var that = this;
	return setInterval(function() {
		that.getCurrentOrientation(successCallback, errorCallback);
	}, interval);
};
       
/*
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */     
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};
  
/*
 * This class encapsulates the possible orientation values.
 * @constructor
 */  
function DisplayOrientation() {
	this.code = null;
	this.message = "";
};

DisplayOrientation.PORTRAIT = 0;
DisplayOrientation.REVERSE_PORTRAIT = 1;
DisplayOrientation.LANDSCAPE_LEFT_UP = 2;
DisplayOrientation.LANDSCAPE_RIGHT_UP = 3;
DisplayOrientation.FACE_UP = 4;
DisplayOrientation.FACE_DOWN = 5;

if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();

function Position(coords) {
	this.coords = coords;
    this.timestamp = new Date().getTime();
};

function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
	/*
	 * The latitude of the position.
	 */
	this.latitude = lat;
	/*
	 * The longitude of the position,
	 */
	this.longitude = lng;
	/*
	 * The accuracy of the position.
	 */
	this.accuracy = acc;
	/*
	 * The altitude of the position.
	 */
	this.altitude = alt;
	/*
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/*
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
	/*
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (typeof(altacc) != 'undefined') ? altacc : null;
};

/*
 * This class specifies the options for requesting position data.
 * @constructor
 */
function PositionOptions() {
	/*
	 * Specifies the desired position accuracy.
	 */
	this.enableHighAccuracy = true;
	/*
	 * The timeout after which if position data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
};

/*
 * This class contains information about any GSP errors.
 * @constructor
 */
function PositionError() {
	this.code = null;
	this.message = "";
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

function Service() {
	
};

Service.prototype.Request = function (uri, params) {
	var req = new PalmServiceBridge();
	var url = uri + "/" + (params.method || "");
	req.url = url;

	this.req = req;
	this.url = url;
	this.params = params || {};
	
	this.call(params);
	
	return this;
};

Service.prototype.call = function(params) {
	var onsuccess = null;
	var onfailure = null;
	var oncomplete = null;

	if (typeof params.onSuccess === 'function')
		onsuccess = params.onSuccess;

	if (typeof params.onFailure === 'function')
		onerror = params.onFailure;

	if (typeof params.onComplete === 'function')
		oncomplete = params.onComplete;

	this.req.onservicecallback = callback;

	function callback(msg) {
		var response = JSON.parse(msg);

		if ((response.errorCode) && onfailure)
			onfailure(response);
		else if (onsuccess)
			onsuccess(response);
		
		if (oncomplete)
			oncomplete(response);
	}

	this.data = (typeof params.parameters === 'object') ? JSON.stringify(params.parameters) : '{}';

	this.req.call(this.url, this.data);
}

if (typeof navigator.service == "undefined") navigator.service = new Service();

/*
 * This class provides access to the device SMS functionality.
 * @constructor
 */
function Sms() {

    };

/*
 * Sends an SMS message.
 * @param {Integer} number The phone number to send the message to.
 * @param {String} message The contents of the SMS message to send.
 * @param {Function} successCallback The function to call when the SMS message is sent.
 * @param {Function} errorCallback The function to call when there is an error sending the SMS message.
 * @param {PositionOptions} options The options for accessing the GPS location such as timeout and accuracy.
 */
Sms.prototype.send = function(number, message, successCallback, errorCallback, options) {
    try {
        this.service = navigator.service.Request('palm://com.palm.applicationManager', {
            method: 'launch',
            parameters: {
                id: "com.palm.app.messaging",
                params: {
                    composeAddress: number,
                    messageText: message
                }
            }
        });
        successCallback();
    } catch(ex) {
        errorCallback({
            name: "SMSerror",
            message: ex.name + ": " + ex.message
        });
    }
};

if (typeof navigator.sms == "undefined") navigator.sms = new Sms();

/*
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
    this.number = "";
};

/*
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.send = function(number) {
    this.number = number;
    this.service = navigator.service.Request('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            target: "tel://" + number
        }
    });
};

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();

function Window() {

    };

/*
 * This is a thin wrapper for 'window.open()' which optionally sets document contents to 'html', and calls 'PalmSystem.stageReady()'
 * on your new card. Note that this new card will not come with your framework (if any) or anything for that matter.
 * @param {String} url
 * @param {String} html
 * Example:
 *		navigator.window.newCard('about:blank', '<html><body>Hello again!</body></html>');
 */
Window.prototype.newCard = function(url, html) {
    var win = window.open(url || "");
    if (html)
        win.document.write(html);
    win.PalmSystem.stageReady();
};

/*
 * Enable or disable full screen display (full screen removes the app menu bar and the rounded corners of the screen).
 * @param {Boolean} state
 * Example:
 *		navigator.window.setFullScreen(true);
 */
Window.prototype.setFullScreen = function(state) {
    // valid state values are: true or false
    PalmSystem.enableFullScreenMode(state);
};

/*
 * used to set the window properties of the WebOS app
 * @param {Object} props
 * Example:
 * 		private method used by other member functions - ideally we shouldn't call this method
 */
Window.prototype.setWindowProperties = function(props) {
    if (typeof props === 'object')
        navigator.windowProperties = props;

    PalmSystem.setWindowProperties(props || this.windowProperties);
};

/*
 * Enable or disable screen timeout. When enabled, the device screen will not dim. This is useful for navigation, clocks or other "dock" apps.
 * @param {Boolean} state
 * Example:
 *		navigator.window.blockScreenTimeout(true);
 */
Window.prototype.blockScreenTimeout = function(state) {
    navigator.windowProperties.blockScreenTimeout = state;
    this.setWindowProperties();
};

/*
 * Sets the lightbar to be a little dimmer for screen locked notifications.
 * @param {Boolean} state
 * Example:
 *		navigator.window.setSubtleLightbar(true);
 */
Window.prototype.setSubtleLightbar = function(state) {
    navigator.windowProperties.setSubtleLightbar = state;
    this.setWindowProperties();
};

if (typeof navigator.window == 'undefined') navigator.window = new Window();

/*
 * Object for storing WebOS window properties
 */
function WindowProperties() {
    blockScreenTimeout = false;
    setSubtleLightbar = false;
    fastAccelerometer = false;
};

if (typeof navigator.windowProperties == 'undefined') navigator.windowProperties = new WindowProperties();(function(window) {

    /**
     * Do not use thumbs.js on touch-enabled devices
     * 
     * Thanks to Jesse MacFadyen (purplecabbage):
     * https://gist.github.com/850593#gistcomment-22484
     */
    try {
        document.createEvent('TouchEvent');
        return;
    }
    catch(e) {
    }

    /**
     * Map touch events to mouse events
     */
    var eventMap = {
        'mousedown': 'touchstart',
        'mouseup':   'touchend',
        'mousemove': 'touchmove'
    };

    /**
     * Fire touch events
     *
     * Monitor mouse events and fire a touch event on the
     * object broadcasting the mouse event. This approach
     * likely has poorer performance than hijacking addEventListener
     * but it is a little more browser friendly.
     */
    window.addEventListener('load', function() {
        for (var key in eventMap) {
            document.body.addEventListener(key, function(e) {
                // Supports:
                //   - addEventListener
                //   - setAttribute
                var event = createTouchEvent(eventMap[e.type], e);
                e.target.dispatchEvent(event);

                // Supports:
                //   - element.ontouchstart
                var fn = e.target['on' + eventMap[e.type]];
                if (typeof fn === 'function') fn(e);
            }, false);
        }
    }, false);

    /**
     * Utility function to create a touch event.
     *
     * @param  name  {String} of the event
     * @return event {Object}
     */
    var createTouchEvent = function(name, e) {
        var event = document.createEvent('MouseEvents');

        event.initMouseEvent(
            name,
            e.bubbles,
            e.cancelable,
            e.view,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            e.relatedTarget
        );

        return event;
    };

})(window);
