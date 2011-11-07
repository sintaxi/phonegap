/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */




/**
 * The order of events during page load and PhoneGap startup is as follows:
 *
 * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
 * window.onload              Body onload event.
 * onNativeReady              Internal event that indicates the PhoneGap native side is ready.
 * onPhoneGapInit             Internal event that kicks off creation of all PhoneGap JavaScript objects (runs constructors).
 * onPhoneGapReady            Internal event fired when all PhoneGap JavaScript objects have been created
 * onPhoneGapInfoReady        Internal event fired when device properties are available
 * onDeviceReady              User event fired to indicate that PhoneGap is ready
 * onResume                   User event fired to indicate a start/resume lifecycle event
 * onPause                    User event fired to indicate a pause lifecycle event
 * onDestroy                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The only PhoneGap events that user code should register for are:
 *      onDeviceReady
 *      onResume
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 */
 
 if (typeof(DeviceInfo) !== 'object') {
    var DeviceInfo = {};
}

var PhoneGap = {
	    queue: {
        ready: true,
        commands: [],
        timer: null
    },
	available:false,
	callbackId:0,
	callbacks:{}
};

PhoneGap.callbackStatus = {
    NO_RESULT: 0,
    OK: 1,
    CLASS_NOT_FOUND_EXCEPTION: 2,
    ILLEGAL_ACCESS_EXCEPTION: 3,
    INSTANTIATION_EXCEPTION: 4,
    MALFORMED_URL_EXCEPTION: 5,
    IO_EXCEPTION: 6,
    INVALID_ACTION: 7,
    JSON_EXCEPTION: 8,
    ERROR: 9
};

PhoneGap.exec = function(success, fail, service, action, args)
{
	
	var callbackId = service + PhoneGap.callbackId++;
    if (typeof success == "function" || typeof fail == "function") 
	{
        PhoneGap.callbacks[callbackId] = {success:success, fail:fail};
		console.log("added callback for " + callbackId);
    }

	 // generate a new command string, ex. DebugConsole/log/DebugConsole23/{"message":"wtf dude?"}
     var command = service + "/" + action + "/" + callbackId + "/" + JSON.stringify(args);
        // pass it on to Notify
     window.external.Notify(command);
};

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGapCallbackSuccess = function(callbackId, args) 
{
	var result = "result::" + (typeof PhoneGap.callbacks[callbackId]);
	var commandResult;
	try
	{
		commandResult  = JSON.parse(args);
	}
	catch(exception)
	{
		return exception.message;
	}
	
    if (PhoneGap.callbacks[callbackId] ) {

        // If result is to be sent to callback
        if (commandResult.status === PhoneGap.callbackStatus.OK) {
            try {
                if (PhoneGap.callbacks[callbackId].success) {
                    result = PhoneGap.callbacks[callbackId].success(commandResult.message);
                }
            }
            catch (e) {
                console.log("Error in success callback: "+callbackId+" = " + e.message);
            }
        }

        // Clear callback if not expecting any more results
        if (!commandResult.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
        }
    }
	return result;
};

/**
 * Called by native code when returning error result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGapCallbackError = function (callbackId, args) {
    if (PhoneGap.callbacks[callbackId]) {
        try {
            if (PhoneGap.callbacks[callbackId].fail) {
                PhoneGap.callbacks[callbackId].fail(args.message);
            }
        }
        catch (e) {
            console.log("Error in error callback: "+callbackId+" = "+e);
        }

        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
        }
    }
};

/**
 * Custom pub-sub channel that can have functions subscribed to it
 * @constructor
 */	
PhoneGap.Channel = function(type)
{
    this.type = type;
    this.handlers = {};
    this.guid = 0;
    this.fired = false;
    this.enabled = true;	
};

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
PhoneGap.Channel.prototype.subscribe = function(f, c, g) {
    // need a function to call
    if (f === null) { return; }

    var func = f;
    if (typeof c === "object" && typeof f === "function") { func = PhoneGap.close(c, f); }

    g = g || func.observer_guid || f.observer_guid || this.guid++;
    func.observer_guid = g;
    f.observer_guid = g;
    this.handlers[g] = func;
    return g;
};

/**
 * Like subscribe but the function is only called once and then it
 * auto-unsubscribes itself.
 */
PhoneGap.Channel.prototype.subscribeOnce = function(f, c) {
    var g = null;
    var _this = this;
    var m = function() {
        f.apply(c || null, arguments);
        _this.unsubscribe(g);
    };
    if (this.fired) {
        if (typeof c === "object" && typeof f === "function") { f = PhoneGap.close(c, f); }
        f.apply(this, this.fireArgs);
    } else {
        g = this.subscribe(m);
    }
    return g;
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
PhoneGap.Channel.prototype.unsubscribe = function(g) {
    if (typeof g === "function") { g = g.observer_guid; }
    this.handlers[g] = null;
    delete this.handlers[g];
};

/**
 * Calls all functions subscribed to this channel.
 */
PhoneGap.Channel.prototype.fire = function(e) {
    if (this.enabled) {
        var fail = false;
        var item, handler, rv;
        for (item in this.handlers) {
            if (this.handlers.hasOwnProperty(item)) {
                handler = this.handlers[item];
                if (typeof handler === "function") {
                    rv = (handler.apply(this, arguments) === false);
                    fail = fail || rv;
                }
            }
        }
        this.fired = true;
        this.fireArgs = arguments;
        return !fail;
    }
    return true;
};

/**
 * Calls the provided function only after all of the channels specified
 * have been fired.
 */
PhoneGap.Channel.join = function(h, c) {
    var i = c.length;
    var f = function() {
        if (!(--i)) {
            h();
        }
    };
    var len = i;
    var j;
    for (j=0; j<len; j++) {
        if (!c[j].fired) {
            c[j].subscribeOnce(f);
        }
        else {
            i--;
        }
    }
    if (!i) {
        h();
    }
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
PhoneGap.available = DeviceInfo.uuid !== undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once PhoneGap has been initialized.
 * @param {Function} func The function callback you want run once PhoneGap is initialized
 */
PhoneGap.addConstructor = function(func) 
{
    PhoneGap.onPhoneGapInit.subscribeOnce(function() {
        try {
            func();
        } catch(e) {
            console.log("Failed to run constructor: " + e);
        }
    });
};

/**
 * Plugins object
 */
if (!window.plugins) {
    window.plugins = {};
};

/**
 * Adds a plugin object to window.plugins.
 * The plugin is accessed using window.plugins.<name>
 *
 * @param name          The plugin name
 * @param obj           The plugin object
 */
PhoneGap.addPlugin = function(name, obj) {
    if (!window.plugins[name]) {
        window.plugins[name] = obj;
    }
    else {
        console.log("Error: Plugin "+name+" already exists.");
    }
};

/**
 * onDOMContentLoaded channel is fired when the DOM content
 * of the page has been parsed.
 */
PhoneGap.onDOMContentLoaded = new PhoneGap.Channel('onDOMContentLoaded');

/**
 * onNativeReady channel is fired when the PhoneGap native code
 * has been initialized.
 */
PhoneGap.onNativeReady = new PhoneGap.Channel('onNativeReady');

/**
 * onPhoneGapInit channel is fired when the web page is fully loaded and
 * PhoneGap native code has been initialized.
 */
PhoneGap.onPhoneGapInit = new PhoneGap.Channel('onPhoneGapInit');

/**
 * onPhoneGapReady channel is fired when the JS PhoneGap objects have been created.
 */
PhoneGap.onPhoneGapReady = new PhoneGap.Channel('onPhoneGapReady');

/**
 * onPhoneGapInfoReady channel is fired when the PhoneGap device properties
 * has been set.
 */
PhoneGap.onPhoneGapInfoReady = new PhoneGap.Channel('onPhoneGapInfoReady');

/**
 * onPhoneGapConnectionReady channel is fired when the PhoneGap connection properties
 * has been set.
 */
PhoneGap.onPhoneGapConnectionReady = new PhoneGap.Channel('onPhoneGapConnectionReady');

/**
 * onResume channel is fired when the PhoneGap native code
 * resumes.
 */
PhoneGap.onResume = new PhoneGap.Channel('onResume');

/**
 * onPause channel is fired when the PhoneGap native code
 * pauses.
 */
PhoneGap.onPause = new PhoneGap.Channel('onPause');

/**
 * onDestroy channel is fired when the PhoneGap native code
 * is destroyed.  It is used internally.
 * Window.onunload should be used by the user.
 */
PhoneGap.onDestroy = new PhoneGap.Channel('onDestroy');
PhoneGap.onDestroy.subscribeOnce(function() {
    PhoneGap.shuttingDown = true;
});
PhoneGap.shuttingDown = false;

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any PhoneGap JS is ready.
if (typeof _nativeReady !== 'undefined') { PhoneGap.onNativeReady.fire(); }

/**
 * onDeviceReady is fired only after all PhoneGap objects are created and
 * the device properties are set.
 */
PhoneGap.onDeviceReady = new PhoneGap.Channel('onDeviceReady');


// Array of channels that must fire before "deviceready" is fired
PhoneGap.deviceReadyChannelsArray = [ PhoneGap.onPhoneGapReady, PhoneGap.onPhoneGapInfoReady, PhoneGap.onPhoneGapConnectionReady];

// Hashtable of user defined channels that must also fire before "deviceready" is fired
PhoneGap.deviceReadyChannelsMap = {};

/**
 * Indicate that a feature needs to be initialized before it is ready to be used.
 * This holds up PhoneGap's "deviceready" event until the feature has been initialized
 * and PhoneGap.initComplete(feature) is called.
 *
 * @param feature {String}     The unique feature name
 */
PhoneGap.waitForInitialization = function(feature) {
    if (feature) {
        var channel = new PhoneGap.Channel(feature);
        PhoneGap.deviceReadyChannelsMap[feature] = channel;
        PhoneGap.deviceReadyChannelsArray.push(channel);
    }
};

/**
 * Indicate that initialization code has completed and the feature is ready to be used.
 *
 * @param feature {String}     The unique feature name
 */
PhoneGap.initializationComplete = function(feature) {
    var channel = PhoneGap.deviceReadyChannelsMap[feature];
    if (channel) {
        channel.fire();
    }
};

/**
 * Create all PhoneGap objects once page has fully loaded and native side is ready.
 */
PhoneGap.Channel.join(
	function() 
	{
		
		setTimeout(function() 
		{
		    PhoneGap.UsePolling = false;
		    PhoneGap.JSCallback();
		},1);
		
	    // Run PhoneGap constructors
	    PhoneGap.onPhoneGapInit.fire();
	
	    // Fire event to notify that all objects are created
	    PhoneGap.onPhoneGapReady.fire();
	
	    // Fire onDeviceReady event once all constructors have run and PhoneGap info has been
	    // received from native side, and any user defined initialization channels.
	    PhoneGap.Channel.join(function() {
	        PhoneGap.onDeviceReady.fire();
	
	        // Fire the onresume event, since first one happens before JavaScript is loaded
	        PhoneGap.onResume.fire();
	    }, PhoneGap.deviceReadyChannelsArray);
	
	}, 
	[ PhoneGap.onDOMContentLoaded, PhoneGap.onNativeReady ]);



// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener('DOMContentLoaded', function() {
    PhoneGap.onDOMContentLoaded.fire();
}, false);
    




///////////////////////////////////////////////////////////////////////////////////////////////////////////

function SetDeviceProperties(platform, version, name, uuid, gap) 
{
  device.platform = platform;
  device.version = version;
  device.name = name;
  device.uuid = uuid;
  device.gap = gap;

  // in theory, everything is now set up and working so this is where we should fire the deviceready event
  // unfortunately IE7 mobile doesn't seem to support a way of dynamically raising events
  PhoneGap.available = true;
}

// Load device info
//PhoneGap.exec("Device.GetAll;SetDeviceProperties");

