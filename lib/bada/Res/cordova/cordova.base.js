/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
 * window.onload              Body onload event.
 * onNativeReady              Internal event that indicates the Cordova native side is ready.
 * onCordovaInit             Internal event that kicks off creation of all Cordova JavaScript objects (runs constructors).
 * onCordovaReady            Internal event fired when all Cordova JavaScript objects have been created
 * onCordovaInfoReady        Internal event fired when device properties are available
 * onDeviceReady              User event fired to indicate that Cordova is ready
 * onResume                   User event fired to indicate a start/resume lifecycle event
 *
 * The only Cordova events that user code should register for are:
 *      onDeviceReady
 *      onResume
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 */

function debugPrint(body) {
    var list = document.getElementById("debuglist");
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(body));
    list.appendChild(item);
}
/**
 * This represents the Cordova API itself, and provides a global namespace for accessing
 * information about the state of Cordova.
 * @class
 */
Cordova = { 
   queue: {
        ready: true,
        commands: [],
        timer: null
    },
    _constructors: []
};

/**
 * Boolean flag indicating if the Cordova API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
Cordova.available = function() {
  return window.device.uuid != undefined;
}

/**
 * Custom pub-sub channel that can have functions subscribed to it
 */
Cordova.Channel = function(type)
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
Cordova.Channel.prototype.subscribe = function(f, c, g) {
    // need a function to call
    if (f == null) { return; }

    var func = f;
    if (typeof c == "object" && f instanceof Function) { func = Cordova.close(c, f); }

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
Cordova.Channel.prototype.subscribeOnce = function(f, c) {
    var g = null;
    var _this = this;
    var m = function() {
        f.apply(c || null, arguments);
        _this.unsubscribe(g);
    }
    if (this.fired) {
        if (typeof c == "object" && f instanceof Function) { f = Cordova.close(c, f); }
        f.apply(this, this.fireArgs);
    } else {
        g = this.subscribe(m);
    }
    return g;
};

/** 
 * Unsubscribes the function with the given guid from the channel.
 */
Cordova.Channel.prototype.unsubscribe = function(g) {
    if (g instanceof Function) { g = g.observer_guid; }
    this.handlers[g] = null;
    delete this.handlers[g];
};

/** 
 * Calls all functions subscribed to this channel.
 */
Cordova.Channel.prototype.fire = function(e) {
    if (this.enabled) {
        var fail = false;
        for (var item in this.handlers) {
            var handler = this.handlers[item];
            if (handler instanceof Function) {
                var rv = (handler.apply(this, arguments)==false);
                fail = fail || rv;
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
Cordova.Channel.join = function(h, c) {
    var i = c.length;
    var f = function() {
        if (!(--i)) h();
    }
    for (var j=0; j<i; j++) {
        (!c[j].fired?c[j].subscribeOnce(f):i--);
    }
    if (!i) h();
};

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once Cordova has been initialized.
 * @param {Function} func The function callback you want run once Cordova is initialized
 */
Cordova.addConstructor = function(func) {
    Cordova.onCordovaInit.subscribeOnce(function() {
        // try {
            func();
        // } catch(e) {
        //     if (typeof(debug['log']) == 'function') {
        //         debug.log("Failed to run constructor: " + debug.processMessage(e));
        //     } else {
        //         alert("Failed to run constructor: " + e.message);
        //     }
        // }
    });
};

/**
 * Plugins object.
 */
if (!window.plugins) {
    window.plugins = {};
}

/**
 * Adds new plugin object to window.plugins.
 * The plugin is accessed using window.plugins.<name>
 * 
 * @param name      The plugin name
 * @param obj       The plugin object
 */
Cordova.addPlugin = function(name, obj) {
    if (!window.plugins[name]) {
        window.plugins[name] = obj;
    }
    else {
        console.log("Plugin " + name + " already exists.");
    }
};

/**
 * onDOMContentLoaded channel is fired when the DOM content 
 * of the page has been parsed.
 */
Cordova.onDOMContentLoaded = new Cordova.Channel('onDOMContentLoaded');

/**
 * onNativeReady channel is fired when the Cordova native code
 * has been initialized.
 */
Cordova.onNativeReady = new Cordova.Channel('onNativeReady');

/**
 * onCordovaInit channel is fired when the web page is fully loaded and
 * Cordova native code has been initialized.
 */
Cordova.onCordovaInit = new Cordova.Channel('onCordovaInit');

/**
 * onCordovaReady channel is fired when the JS Cordova objects have been created.
 */
Cordova.onCordovaReady = new Cordova.Channel('onCordovaReady');

/**
 * onCordovaInfoReady channel is fired when the Cordova device properties
 * has been set.
 */
Cordova.onCordovaInfoReady = new Cordova.Channel('onCordovaInfoReady');

/**
 * onResume channel is fired when the Cordova native code
 * resumes.
 */
Cordova.onResume = new Cordova.Channel('onResume');

/**
 * onPause channel is fired when the Cordova native code
 * pauses.
 */
Cordova.onPause = new Cordova.Channel('onPause');

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since 
// it may be called before any Cordova JS is ready.
if (typeof _nativeReady !== 'undefined') { Cordova.onNativeReady.fire(); }

/**
 * onDeviceReady is fired only after all Cordova objects are created and
 * the device properties are set.
 */
Cordova.onDeviceReady = new Cordova.Channel('onDeviceReady');

/**
 * Create all Cordova objects once page has fully loaded and native side is ready.
 */
Cordova.Channel.join(function() {

    // Run Cordova constructors
    Cordova.onCordovaInit.fire();

    // Fire event to notify that all objects are created
    Cordova.onCordovaReady.fire();

}, [ Cordova.onDOMContentLoaded, Cordova.onNativeReady ]);

/**
 * Fire onDeviceReady event once all constructors have run and Cordova info has been
 * received from native side.
 */
Cordova.Channel.join(function() {
    Cordova.onDeviceReady.fire();
    
    // Fire the onresume event, since first one happens before JavaScript is loaded
    Cordova.onResume.fire();
}, [ Cordova.onCordovaReady, Cordova.onCordovaInfoReady]);

// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener('DOMContentLoaded', function() {
    Cordova.onDOMContentLoaded.fire();
}, false);

// Intercept calls to document.addEventListener and watch for deviceready
Cordova.m_document_addEventListener = document.addEventListener;

document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
    if (e == 'deviceready') {
        Cordova.onDeviceReady.subscribeOnce(handler);
    } else if (e == 'resume') {
        Cordova.onResume.subscribe(handler);
        // if subscribing listener after event has already fired, invoke the handler
        if (Cordova.onResume.fired && handler instanceof Function) {
            handler();
        }
    } else if (e == 'pause') {
        Cordova.onPause.subscribe(handler);
    } else {
        Cordova.m_document_addEventListener.call(document, evt, handler, capture);
    }
};

Cordova.m_element_addEventListener = Element.prototype.addEventListener;

/**
 * For BlackBerry, the touchstart event does not work so we need to do click
 * events when touchstart events are attached.
 */
Element.prototype.addEventListener = function(evt, handler, capture) {
    if (evt === 'touchstart') {
        evt = 'click';
    }
    Cordova.m_element_addEventListener.call(this, evt, handler, capture);
};

/**
 * Does a deep clone of the object.
 *
 * @param obj
 * @return
 */
Cordova.clone = function(obj) {
    if(!obj) { 
        return obj;
    }
    
    if(obj instanceof Array){
        var retVal = new Array();
        for(var i = 0; i < obj.length; ++i){
            retVal.push(Cordova.clone(obj[i]));
        }
        return retVal;
    }
    
    if (obj instanceof Function) {
        return obj;
    }
    
    if(!(obj instanceof Object)){
        return obj;
    }
    
    if(obj instanceof Date){
        return obj;
    }

    retVal = new Object();
    for(i in obj){
        if(!(i in retVal) || retVal[i] != obj[i]) {
            retVal[i] = Cordova.clone(obj[i]);
        }
    }
    return retVal;
};

Cordova.close = function(context, func, params) {
    if (typeof params === 'undefined') {
        return function() {
            return func.apply(context, arguments);
        }
    } else {
        return function() {
            return func.apply(context, params);
        }
    }
};

Cordova.callbackId = 0;
Cordova.callbacks  = {};
Cordova.callbackStatus = {
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

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 */
Cordova.callbackSuccess = function(callbackId, args) {
    if (Cordova.callbacks[callbackId]) {

        // If result is to be sent to callback
        if (args.status == Cordova.callbackStatus.OK) {
            try {
                if (Cordova.callbacks[callbackId].success) {
                    Cordova.callbacks[callbackId].success(args.message);
                }
            }
            catch (e) {
                console.log("Error in success callback: "+callbackId+" = "+e);
            }
        }

        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete Cordova.callbacks[callbackId];
        }
    }
};

/**
 * Called by native code when returning error result from an action.
 *
 * @param callbackId
 * @param args
 */
Cordova.callbackError = function(callbackId, args) {
    if (Cordova.callbacks[callbackId]) {
        try {
            if (Cordova.callbacks[callbackId].fail) {
                Cordova.callbacks[callbackId].fail(args.message);
            }
        }
        catch (e) {
            console.log("Error in error callback: "+callbackId+" = "+e);
        }

        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete Cordova.callbacks[callbackId];
        }
    }
};

/**
 * Create a UUID
 *
 * @return
 */
Cordova.createUUID = function() {
    return Cordova.UUIDcreatePart(4) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(6);
};

Cordova.UUIDcreatePart = function(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
        var uuidchar = parseInt((Math.random() * 256)).toString(16);
        if (uuidchar.length == 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
};
/**
 * Execute a Cordova command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when Cordova is ready to
 * receive them.
 *
 */
Cordova.exec = function() { 
	
    Cordova.queue.commands.push(arguments);
    if (Cordova.queue.timer == null)
        Cordova.queue.timer = setInterval(Cordova.run_command, 10);
};

/**
 * Internal function used to dispatch the request to Cordova.  It processes the
 * command queue and executes the next command on the list.  Simple parameters are passed
 * as arguments on the url.  JavaScript objects converted into a JSON string and passed as a
 * query string argument of the url.
 * Arguments may be in one of two formats:
 *   FORMAT ONE (preferable)
 * The native side will call Cordova.callbackSuccess or Cordova.callbackError,
 * depending upon the result of the action.
 *
 * @param {Function} success    The success callback
 * @param {Function} fail       The fail callback
 * @param {String} service      The name of the service to use
 * @param {String} action		The name of the action to use
 * @param {String[]} [args]     Zero or more arguments to pass to the method
 *  	
 * FORMAT TWO
 * @param {String} command Command to be run in Cordova, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 * object parameters are passed as an array object [object1, object2] each object will be passed as JSON strings 
 * @private
 */
Cordova.run_command = function() {
    if (!Cordova.available() || !Cordova.queue.ready)
        return;

    var args = Cordova.queue.commands.shift();
    if (Cordova.queue.commands.length == 0) {
        clearInterval(Cordova.queue.timer);
        Cordova.queue.timer = null;
    }
	
	var service;
	var callbackId = null;
	var start=0;
    try {
 		if (args[0] == null || typeof args[0] === "function") {
 			var success = args[0];
 			var fail = args[1];
 			service = args[2] + "." + args[3];
			args = args[4];  //array of arguments to 
      if (success || fail) {
          callbackId = service + Cordova.callbackId++;
          Cordova.callbacks[callbackId] = {success:success, fail:fail};
      }
 		} else { 
 			service = args[0]; 
 			start = 1;
 		}
        
      var uri = [];
      var query = [];
    	for (var i = start; i < args.length; i++) {
        	var arg = args[i];
        	if (arg == undefined || arg == null)
            	continue;
        	if (typeof(arg) == 'object') {
              for(i in arg) {
                if(typeof(arg[i]) != 'object') {
                  query.push(encodeURIComponent(i) + '=' + encodeURIComponent(arg[i]));
                }
              }
          }
        	else {
            	uri.push(encodeURIComponent(arg));
          }
    	}
    	var next = callbackId != null  ?  ("/" + callbackId + "/") : "/";
    	var url = "gap://" + service + next + uri.join("/");

    	if (query.length > 0) {
        	url += "?" + query.join("&");
    	}
      Cordova.queue.ready = false;
      document.location = url;
   
    } catch (e) {
        console.log("CordovaExec Error: "+e);
    }
    

};

