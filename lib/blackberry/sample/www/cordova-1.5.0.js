/*
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

/**
 * This represents the Cordova API itself, and provides a global namespace for accessing
 * information about the state of Cordova.
 */
var Cordova = Cordova || (function() {

    /**
     * Cordova object.
     */
    var Cordova = {
        documentEventHandler: {},   // Collection of custom document event handlers
        windowEventHandler: {}      // Collection of custom window event handlers
    };

    //----------------------------------------------
    // Publish/subscribe channels for initialization
    //----------------------------------------------

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
     *
     * The only Cordova event that user code should register for is:
     *      onDeviceReady
     *
     * Listener can be registered as:
     *      document.addEventListener("deviceready", myDeviceReadyListener, false);
     *
     * Additional lifecycle events are enforced by the App plugin.  Reference
     * app.js for details.
     */

    /**
     * Custom pub-sub channel that can have functions subscribed to it
     */
    Cordova.Channel = function(type) {
        this.type = type;
        this.handlers = { };
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
        };
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
        var len = i;
        var f = function() {
            if (!(--i)) h();
        };
        for (var j=0; j<len; j++) {
            (!c[j].fired?c[j].subscribeOnce(f):i--);
        }
        if (!i) h();
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
     * onCordovaConnectionReady channel is fired when the Cordova connection
     * properties have been set.
     */
    Cordova.onCordovaConnectionReady = new Cordova.Channel('onCordovaConnectionReady');

    /**
     * onDeviceReady is fired only after all Cordova objects are created and
     * the device properties are set.
     */
    Cordova.onDeviceReady = new Cordova.Channel('onDeviceReady');

    /**
     * Cordova Channels that must fire before "deviceready" is fired.
     */
    Cordova.deviceReadyChannelsArray = [ Cordova.onCordovaReady, Cordova.onCordovaInfoReady, Cordova.onCordovaConnectionReady ];

    /**
     * User-defined channels that must also fire before "deviceready" is fired.
     */
    Cordova.deviceReadyChannelsMap = {};

    /**
     * Indicate that a feature needs to be initialized before it is ready to be
     * used. This holds up Cordova's "deviceready" event until the feature has been
     * initialized and Cordova.initializationComplete(feature) is called.
     *
     * @param feature {String} The unique feature name
     */
    Cordova.waitForInitialization = function(feature) {
        if (feature) {
            var channel = new Cordova.Channel(feature);
            Cordova.deviceReadyChannelsMap[feature] = channel;
            Cordova.deviceReadyChannelsArray.push(channel);
        }
    };

    /**
     * Indicate that initialization code has completed and the feature is ready to
     * be used.
     *
     * @param feature {String} The unique feature name
     */
    Cordova.initializationComplete = function(feature) {
        var channel = Cordova.deviceReadyChannelsMap[feature];
        if (channel) {
            channel.fire();
        }
    };

    /**
     * Create all Cordova objects once page has fully loaded and native side is ready.
     */
    Cordova.Channel.join(function() {

        // Run Cordova constructors
        Cordova.onCordovaInit.fire();

        // Fire event to notify that all objects are created
        Cordova.onCordovaReady.fire();

        // Fire onDeviceReady event once all constructors have run and
        // Cordova info has been received from native side.
        Cordova.Channel.join(function() {
            Cordova.onDeviceReady.fire();
        }, Cordova.deviceReadyChannelsArray);

    }, [ Cordova.onDOMContentLoaded, Cordova.onNativeReady ]);

    //---------------
    // Event handling
    //---------------

    /**
     * Listen for DOMContentLoaded and notify our channel subscribers.
     */
    document.addEventListener('DOMContentLoaded', function() {
        Cordova.onDOMContentLoaded.fire();
    }, false);

    // Intercept calls to document.addEventListener
    Cordova.m_document_addEventListener = document.addEventListener;

    // Intercept calls to window.addEventListener
    Cordova.m_window_addEventListener = window.addEventListener;

    /**
     * Add a custom window event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    Cordova.addWindowEventHandler = function(event, callback) {
        Cordova.windowEventHandler[event] = callback;
    };

    /**
     * Add a custom document event handler.
     *
     * @param {String} event            The event name that callback handles
     * @param {Function} callback       The event handler
     */
    Cordova.addDocumentEventHandler = function(event, callback) {
        Cordova.documentEventHandler[event] = callback;
    };

    /**
     * Intercept adding document event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    document.addEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();
        if (e == 'deviceready') {
            Cordova.onDeviceReady.subscribeOnce(handler);
        } else {
            if (typeof Cordova.documentEventHandler[e] !== "undefined") {
                if (Cordova.documentEventHandler[e](e, handler, true)) {
                    return; // Stop default behavior
                }
            }

            Cordova.m_document_addEventListener.call(document, evt, handler, capture);
        }
    };

    /**
     * Intercept adding window event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    window.addEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If subscribing to an event that is handled by a plugin
        if (typeof Cordova.windowEventHandler[e] !== "undefined") {
            if (Cordova.windowEventHandler[e](e, handler, true)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_window_addEventListener.call(window, evt, handler, capture);
    };

    // Intercept calls to document.removeEventListener and watch for events that
    // are generated by Cordova native code
    Cordova.m_document_removeEventListener = document.removeEventListener;

    // Intercept calls to window.removeEventListener
    Cordova.m_window_removeEventListener = window.removeEventListener;

    /**
     * Intercept removing document event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    document.removeEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If unsubcribing from an event that is handled by a plugin
        if (typeof Cordova.documentEventHandler[e] !== "undefined") {
            if (Cordova.documentEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_document_removeEventListener.call(document, evt, handler, capture);
    };

    /**
     * Intercept removing window event listeners and handle our own
     *
     * @param {Object} evt
     * @param {Function} handler
     * @param capture
     */
    window.removeEventListener = function(evt, handler, capture) {
        var e = evt.toLowerCase();

        // If unsubcribing from an event that is handled by a plugin
        if (typeof Cordova.windowEventHandler[e] !== "undefined") {
            if (Cordova.windowEventHandler[e](e, handler, false)) {
                return; // Stop default behavior
            }
        }

        Cordova.m_window_removeEventListener.call(window, evt, handler, capture);
    };

    /**
     * Method to fire document event
     *
     * @param {String} type             The event type to fire
     * @param {Object} data             Data to send with event
     */
    Cordova.fireDocumentEvent = function(type, data) {
        var e = document.createEvent('Events');
        e.initEvent(type, false, false);
        if (data) {
            for (var i in data) {
                e[i] = data[i];
            }
        }
        document.dispatchEvent(e);
    };

    /**
     * Method to fire window event
     *
     * @param {String} type             The event type to fire
     * @param {Object} data             Data to send with event
     */
    Cordova.fireWindowEvent = function(type, data) {
        var e = document.createEvent('Events');
        e.initEvent(type, false, false);
        if (data) {
            for (var i in data) {
                e[i] = data[i];
            }
        }
        window.dispatchEvent(e);
    };

    //--------
    // Plugins
    //--------

    /**
     * Add an initialization function to a queue that ensures it will run and
     * initialize application constructors only once Cordova has been initialized.
     *
     * @param {Function} func The function callback you want run once Cordova is initialized
     */
    Cordova.addConstructor = function(func) {
        Cordova.onCordovaInit.subscribeOnce(function() {
            try {
                func();
            } catch(e) {
                if (typeof(debug) != 'undefined' && typeof(debug['log']) == 'function') {
                    debug.log("Failed to run constructor: " + debug.processMessage(e));
                } else {
                    alert("Failed to run constructor: " + e.message);
                }
            }
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
     * Plugin callback mechanism.
     */
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
     * Execute a Cordova command.  It is up to the native side whether this action
     * is synchronous or asynchronous.  The native side can return:
     *      Synchronous: PluginResult object as a JSON string
     *      Asynchrounous: Empty string ""
     * If async, the native side will Cordova.callbackSuccess or Cordova.callbackError,
     * depending upon the result of the action.
     *
     * @param {Function} success    The success callback
     * @param {Function} fail       The fail callback
     * @param {String} service      The name of the service to use
     * @param {String} action       Action to be run in Cordova
     * @param {String[]} [args]     Zero or more arguments to pass to the method
     */
    Cordova.exec = function(success, fail, service, action, args) {
        try {
            var v = cordova.PluginManager.exec(success, fail, service, action, args);

            // If status is OK, then return value back to caller
            if (v.status == Cordova.callbackStatus.OK) {

                // If there is a success callback, then call it now with returned value
                if (success) {
                    try {
                        success(v.message);
                    }
                    catch (e) {
                        console.log("Error in success callback: "+callbackId+" = "+e);
                    }

                }
                return v.message;
            } else if (v.status == Cordova.callbackStatus.NO_RESULT) {

            } else {
                // If error, then display error
                console.log("Error: Status="+v.status+" Message="+v.message);

                // If there is a fail callback, then call it now with returned value
                if (fail) {
                    try {
                        fail(v.message);
                    }
                    catch (e) {
                        console.log("Error in error callback: "+callbackId+" = "+e);
                    }
                }
                return null;
            }
        } catch (e) {
            console.log("Error: "+e);
        }
    };

    //------------------
    // Utility functions
    //------------------

    /**
     * Does a deep clone of the object.
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
            };
        } else {
            return function() {
                return func.apply(context, params);
            };
        }
    };

    /**
     * Create a UUID
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
     * Extends a child object from a parent object using classical inheritance
     * pattern.
     */
    Cordova.extend = (function() {
        // proxy used to establish prototype chain
        var F = function() {};
        // extend Child from Parent
        return function(Child, Parent) {
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.__super__ = Parent.prototype;
            Child.prototype.constructor = Child;
        };
    }());

    return Cordova;
}());

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any Cordova JS is ready.
if (typeof _nativeReady !== 'undefined') { Cordova.onNativeReady.fire(); }

/*
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

 //BlackBerry attaches the Java plugin manager at cordova.PluginManager, we go to the same
//spot for compatibility
if (!window.cordova) { window.cordova = {}; }

(function () {
    "use strict";
    var retAsyncCall = { "status" : Cordova.callbackStatus.NO_RESULT, "message" : "WebWorks Is On It" },
        retInvalidAction = { "status" : Cordova.callbackStatus.INVALID_ACTION, "message" : "Action not found" },
        // Define JavaScript plugin implementations that are common across
        // WebWorks platforms (phone/tablet).
        plugins = {};

    cordova.WebWorksPluginManager = function () {
    };

    cordova.WebWorksPluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        if (plugins[clazz]) {
            return plugins[clazz].execute(action, args, win, fail);
        }

        return {"status" : Cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION, "message" : "Class " + clazz + " cannot be found"};
    };
}());

/*
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
 * Copyright (c) 2011, Research In Motion Limited
 */

(function () {
    "use strict";

    function Logger() {
        if (typeof (cordova.Logger) !== 'undefined') {
            return;
        }

        /**
         * If Blackberry doesn't define a console object, we create our own.
         * console.log will use cordova.Logger to log to BB Event Log and System.out.
         */
        if (typeof console === "undefined") {
            console = { log :
                function (msg) {
                    Cordova.exec(null, null, 'Logger', 'log', msg);
                }
                };
        }
    }

    Logger.prototype.log = function (msg) {
        Cordova.exec(null, null, 'Logger', 'log', msg);
    };

    /**
     * Define cordova.Logger object where the BB API expects to see it
     */
    Cordova.addConstructor(function () {
        cordova.Logger = new Logger();
    });
}());

/*
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
 */

/**
 * navigator.battery
 */
(function() {
  /**
   * Check to see that navigator.battery has not been initialized.
   */
  if (typeof navigator.battery !== "undefined") {
    return;
  }

  /**
   * This class contains information about the current battery status.
   * @constructor
   */
  var Battery = function() {
    this._level = null;
    this._isPlugged = null;
    this._batteryListener = [];
    this._lowListener = [];
    this._criticalListener = [];
  };

  /**
   * Registers as an event producer for battery events.
   *
   * @param {Object} eventType
   * @param {Object} handler
   * @param {Object} add
   */
  Battery.prototype.eventHandler = function(eventType, handler, add) {
    var me = navigator.battery;
    if (add) {
      // If there are no current registered event listeners start the
      // battery listener on native side.
      if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
        Cordova.exec(me._status, me._error, "Battery", "start", []);
      }

      // Register the event listener in the proper array
      if (eventType === "batterystatus") {
        var pos = me._batteryListener.indexOf(handler);
        if (pos === -1) {
          me._batteryListener.push(handler);
        }
      } else if (eventType === "batterylow") {
        var pos = me._lowListener.indexOf(handler);
        if (pos === -1) {
          me._lowListener.push(handler);
        }
      } else if (eventType === "batterycritical") {
        var pos = me._criticalListener.indexOf(handler);
        if (pos === -1) {
          me._criticalListener.push(handler);
        }
      }
    } else {
      // Remove the event listener from the proper array
      if (eventType === "batterystatus") {
        var pos = me._batteryListener.indexOf(handler);
        if (pos > -1) {
          me._batteryListener.splice(pos, 1);
        }
      } else if (eventType === "batterylow") {
        var pos = me._lowListener.indexOf(handler);
        if (pos > -1) {
          me._lowListener.splice(pos, 1);
        }
      } else if (eventType === "batterycritical") {
        var pos = me._criticalListener.indexOf(handler);
        if (pos > -1) {
          me._criticalListener.splice(pos, 1);
        }
      }

      // If there are no more registered event listeners stop the battery
      // listener on native side.
      if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
        Cordova.exec(null, null, "Battery", "stop", []);
      }
    }
  };

  /**
   * Callback for battery status
   *
   * @param {Object} info         keys: level, isPlugged
   */
  Battery.prototype._status = function(info) {
    if (info) {
      var me = this;
      if (me._level != info.level || me._isPlugged != info.isPlugged) {
        // Fire batterystatus event
        Cordova.fireWindowEvent("batterystatus", info);

        // Fire low battery event
        if (info.level == 20 || info.level == 5) {
          if (info.level == 20) {
            Cordova.fireWindowEvent("batterylow", info);
          } else {
            Cordova.fireWindowEvent("batterycritical", info);
          }
        }
      }
      me._level = info.level;
      me._isPlugged = info.isPlugged;
    }
  };

  /**
   * Error callback for battery start
   */
  Battery.prototype._error = function(e) {
    console.log("Error initializing Battery: " + e);
  };

  Cordova.addConstructor(function() {
    if (typeof navigator.battery === "undefined") {
      navigator.battery = new Battery();
      Cordova.addWindowEventHandler("batterystatus", navigator.battery.eventHandler);
      Cordova.addWindowEventHandler("batterylow", navigator.battery.eventHandler);
      Cordova.addWindowEventHandler("batterycritical", navigator.battery.eventHandler);
    }
  });

}());


/*
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

window.cordova.PluginManager = (function (webworksPluginManager) {
    "use strict";

    var retInvalidAction = { "status" : Cordova.callbackStatus.INVALID_ACTION, "message" : "Action not found" },

        loggerAPI = {
            execute: function (webWorksResult, action, args, win, fail) {
                switch (action) {
                case 'log':
                    org.apache.cordova.Logger.log(args);
                    return {"status" : Cordova.callbackStatus.OK,
                            "message" : 'Message logged to console: ' + args};
                }
                return retInvalidAction;
            }
        },
        plugins = {'Logger': loggerAPI};

    cordova.BlackBerryPluginManager = function () {
    };

    cordova.BlackBerryPluginManager.prototype.exec = function (win, fail, clazz, action, args) {
        var result = webworksPluginManager.exec(win, fail, clazz, action, args);

        //We got a sync result or a not found from WW that we can pass on to get a native mixin
        //For async calls there's nothing to do
        if (result.status === Cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION  ||
                result.status === Cordova.callbackStatus.INVALID_ACTION ||
                result.status === Cordova.callbackStatus.OK) {
            if (plugins[clazz]) {
                return plugins[clazz].execute(result.message, action, args, win, fail);
            } else {
                result = this.subExec(win, fail, clazz, action, args);
            }
        }

        return result;
    };

    cordova.BlackBerryPluginManager.prototype.subExec = function (win, fail, clazz, action, args) {
        var callbackId = clazz + Cordova.callbackId++,
            origResult,
            evalResult,
            execResult;

        try {

            if (win || fail) {
                Cordova.callbacks[callbackId] = {success: win, fail: fail};
            }

            // Note: Device returns string, but for some reason emulator returns object - so convert to string.
            origResult = "" + org.apache.cordova.JavaPluginManager.exec(clazz, action, callbackId, JSON.stringify(args), true);

            // If a result was returned
            if (origResult.length > 0) {
                eval("evalResult = " + origResult + ";");

                // If status is OK, then return evalResultalue back to caller
                if (evalResult.status === Cordova.callbackStatus.OK) {

                    // If there is a success callback, then call it now with returned evalResultalue
                    if (win) {
                        // Clear callback if not expecting any more results
                        if (!evalResult.keepCallback) {
                            delete Cordova.callbacks[callbackId];
                        }
                    }
                } else if (evalResult.status === Cordova.callbackStatus.NO_RESULT) {

                    // Clear callback if not expecting any more results
                    if (!evalResult.keepCallback) {
                        delete Cordova.callbacks[callbackId];
                    }
                } else {
                    console.log("Error: Status=" + evalResult.status + " Message=" + evalResult.message);

                    // If there is a fail callback, then call it now with returned evalResultalue
                    if (fail) {

                        // Clear callback if not expecting any more results
                        if (!evalResult.keepCallback) {
                            delete Cordova.callbacks[callbackId];
                        }
                    }
                }
                execResult = evalResult;
            } else {
                // Asynchronous calls return an empty string. Return a NO_RESULT
                // status for those executions.
                execResult = {"status" : Cordova.callbackStatus.NO_RESULT,
                        "message" : ""};
            }
        } catch (e) {
            console.log("BlackBerryPluginManager Error: " + e);
            execResult = {"status" : Cordova.callbackStatus.ERROR,
                          "message" : e.message};
        }

        return execResult;
    };

    cordova.BlackBerryPluginManager.prototype.resume = org.apache.cordova.JavaPluginManager.resume;
    cordova.BlackBerryPluginManager.prototype.pause = org.apache.cordova.JavaPluginManager.pause;
    cordova.BlackBerryPluginManager.prototype.destroy = org.apache.cordova.JavaPluginManager.destroy;

    //Instantiate it
    return new cordova.BlackBerryPluginManager();
}(new cordova.WebWorksPluginManager()));

/*
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
 * Copyright (c) 2011, Research In Motion Limited.
 */

/**
 * navigator.device
 *
 * Represents the mobile device, and provides properties for inspecting the
 * model, version, UUID of the phone, etc.
 */
(function () {
    "use strict";

    /**
     * @constructor
     */
    function Device() {
        var me = this;

        Cordova.exec(
            function (device) {
                me.platform = device.platform;
                me.version  = device.version;
                me.name     = device.name;
                me.uuid     = device.uuid;
                me.cordova  = device.cordova;
            },
            function (e) {
                console.log("Error initializing Cordova: " + e);
            },
            "Device",
            "getDeviceInfo",
            []
        );

    }

    /**
     * Define navigator.device.
     */
    Cordova.addConstructor(function () {
        var key;

        window.device = new Device();

        /* Newer BlackBerry 6 devices now define `navigator.device` */
        if (typeof navigator.device === 'undefined') {
            navigator.device = {};
        }

        /* Add Cordova device properties */
        for (key in window.device) {
            navigator.device[key] = window.device[key];
        }

        Cordova.onCordovaInfoReady.fire();
    });
}());

/*
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
 */

/**
 * FileError
 */
function FileError() {
    this.code = null;
};

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by File API specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

/**
 * navigator.fileMgr
 *
 * Provides file utility methods.
 */
(function() {
    /**
     * Check that navigator.fileMgr has not been initialized.
     */
    if (typeof navigator.fileMgr !== "undefined") {
        return;
    }

    /**
     * @constructor
     */
    function FileMgr() {
    };

    /**
     * Returns the available memory in bytes for the root file system of the
     * specified file path.
     *
     * @param filePath A file system path
     */
    FileMgr.prototype.getFreeDiskSpace = function(filePath) {
        return blackberry.io.dir.getFreeSpaceForRoot(filePath);
    };

    /**
     * Tests whether file exists.  Will return false if the path specifies a directory.
     *
     * @param fullPath             The full path of the file
     */
    FileMgr.prototype.testFileExists = function(fullPath) {
        return blackberry.io.file.exists(fullPath);
    };

    /**
     * Tests whether directory exists.  Will return false if the path specifies a file.
     *
     * @param fullPath             The full path of the directory
     */
    FileMgr.prototype.testDirectoryExists = function(fullPath) {
        return blackberry.io.dir.exists(fullPath);
    };

    /**
     * Reads a file from the device and encodes the contents using the specified
     * encoding.
     *
     * @param fileName          The full path of the file to read
     * @param encoding          The encoding to use to encode the file's content
     * @param successCallback   Callback invoked with file contents
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.readAsText = function(fileName, encoding, successCallback, errorCallback) {
        Cordova.exec(successCallback, errorCallback, "File", "readAsText", [fileName, encoding]);
    };

    /**
     * Reads a file from the device and encodes the contents using BASE64 encoding.
     *
     * @param fileName          The full path of the file to read.
     * @param successCallback   Callback invoked with file contents
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.readAsDataURL = function(fileName, successCallback, errorCallback) {
        Cordova.exec(successCallback, errorCallback, "File", "readAsDataURL", [fileName]);
    };

    /**
     * Writes data to the specified file.
     *
     * @param fileName          The full path of the file to write
     * @param data              The data to be written
     * @param position          The position in the file to begin writing
     * @param successCallback   Callback invoked after successful write operation
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.write = function(fileName, data, position, successCallback, errorCallback) {
        Cordova.exec(successCallback, errorCallback, "File", "write", [fileName, data, position]);
    };

    /**
     * Changes the length of the specified file.  Data beyond new length is discarded.
     *
     * @param fileName          The full path of the file to truncate
     * @param size              The size to which the length of the file is to be adjusted
     * @param successCallback   Callback invoked after successful write operation
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.truncate = function(fileName, size, successCallback, errorCallback) {
        Cordova.exec(successCallback, errorCallback, "File", "truncate", [fileName, size]);
    };

    /**
     * Define navigator.fileMgr object.
     */
    Cordova.addConstructor(function() {
        navigator.fileMgr = new FileMgr();
    });
}());

/**
 * FileReader
 *
 * Reads files from the device file system.
 */
var FileReader = FileReader || (function() {
    /**
     * @constructor
     */
    function FileReader() {
        this.fileName = "";

        this.readyState = 0;

        // File data
        this.result = null;

        // Error
        this.error = null;

        // Event handlers
        this.onloadstart = null;    // When the read starts.
        this.onprogress = null;     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
        this.onload = null;         // When the read has successfully completed.
        this.onerror = null;        // When the read has failed (see errors).
        this.onloadend = null;      // When the request has completed (either in success or failure).
        this.onabort = null;        // When the read has been aborted. For instance, by invoking the abort() method.
    };

    /**
     * States
     */
    FileReader.EMPTY = 0;
    FileReader.LOADING = 1;
    FileReader.DONE = 2;

    /**
     * Abort read file operation.
     */
    FileReader.prototype.abort = function() {
        var event;

        // reset everything
        this.readyState = FileReader.DONE;
        this.result = null;

        // set error
        var error = new FileError();
        error.code = error.ABORT_ERR;
        this.error = error;

        // abort procedure
        if (typeof this.onerror == "function") {
            event = {"type":"error", "target":this};
            this.onerror(event);
        }
        if (typeof this.onabort == "function") {
            event = {"type":"abort", "target":this};
            this.onabort(event);
        }
        if (typeof this.onloadend == "function") {
            event = {"type":"loadend", "target":this};
            this.onloadend(event);
        }
    };

    /**
     * Reads and encodes a text file.
     *
     * @param file          {File} File object containing file properties
     * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
     */
    FileReader.prototype.readAsText = function(file, encoding) {
        var event;

        // Use UTF-8 as default encoding
        var enc = encoding ? encoding : "UTF-8";

        // start
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart == "function") {
            event = {"type":"loadstart", "target":this};
            this.onloadstart(event);
        }

        // read and encode file
        this.fileName = file.fullPath;
        var me = this;
        navigator.fileMgr.readAsText(file.fullPath, enc,

            // success callback
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // success procedure
                me.result = result;
                if (typeof me.onload == "function") {
                    event = {"type":"load", "target":me};
                    me.onload(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            },

            // error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // capture error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                me.result = null;
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            }
        );
    };

    /**
     * Read file and return data as a base64 encoded data url.
     * A data url is of the form:
     *      data:[<mediatype>][;base64],<data>
     *
     * @param file          {File} File object containing file properties
     */
    FileReader.prototype.readAsDataURL = function(file) {
        var event;

        // start
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart == "function") {
            event = {"type":"loadstart", "target":this};
            this.onloadstart(event);
        }

        // read and encode file
        this.fileName = file.fullPath;
        var me = this;
        navigator.fileMgr.readAsDataURL(file.fullPath,

            // success callback
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // success procedure
                me.result = result;
                if (typeof me.onload == "function") {
                    event = {"type":"load", "target":me};
                    me.onload(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            },

            // error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // capture error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                me.result = null;
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            }
        );
    };

    /**
     * Read file and return data as a binary data.
     *
     * @param file          {File} File object containing file properties
     */
    FileReader.prototype.readAsBinaryString = function(file) {
        // TODO - Can't return binary data to browser.
        if (typeof file.fullPath === "undefined") {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
    };

    /**
     * Read file and return data as a binary data.
     *
     * @param file          {File} File object containing file properties
     */
    FileReader.prototype.readAsArrayBuffer = function(file) {
        // TODO - Can't return binary data to browser.
        if (typeof file.fullPath === "undefined") {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
    };

    return FileReader;
}());

/**
 * FileWriter
 *
 * Writes files to the device file system.
 */
var FileWriter = FileWriter || (function() {
    /**
     * @constructor
     * @param file {File} a File object representing a file on the file system
     */
    function FileWriter(file) {
        this.fileName = file.fullPath || null;
        this.length = file.size || 0;

        // default is to write at the beginning of the file
        this.position = 0;

        this.readyState = 0; // EMPTY

        // Error
        this.error = null;

        // Event handlers
        this.onwritestart = null;   // When writing starts
        this.onprogress = null;     // While writing the file, and reporting partial file data
        this.onwrite = null;        // When the write has successfully completed.
        this.onwriteend = null;     // When the request has completed (either in success or failure).
        this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
        this.onerror = null;        // When the write has failed (see errors).
    };

    /**
     * States
     */
    FileWriter.INIT = 0;
    FileWriter.WRITING = 1;
    FileWriter.DONE = 2;

    /**
     * Abort writing file.
     */
    FileWriter.prototype.abort = function() {
        var event;

        // check for invalid state
        if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
            throw FileError.INVALID_STATE_ERR;
        }

        // set error
        var error = new FileError();
        error.code = error.ABORT_ERR;
        this.error = error;

        // dispatch progress events
        if (typeof this.onerror == "function") {
            event = {"type":"error", "target":this};
            this.onerror(event);
        }
        if (typeof this.onabort == "function") {
            event = {"type":"abort", "target":this};
            this.onabort(event);
        }

        // set state
        this.readyState = FileWriter.DONE;

        // done
        if (typeof this.writeend == "function") {
            event = {"type":"writeend", "target":this};
            this.writeend(event);
        }
    };

    /**
     * Sets the file position at which the next write will occur.
     *
     * @param offset    Absolute byte offset into the file
     */
    FileWriter.prototype.seek = function(offset) {
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        if (!offset) {
            return;
        }

        // offset is bigger than file size, set to length of file
        if (offset > this.length) {
            this.position = this.length;
        }
        // seek back from end of file
        else if (offset < 0) {
            this.position = Math.max(offset + this.length, 0);
        }
        // offset in the middle of file
        else {
            this.position = offset;
        }
    };

    /**
     * Truncates the file to the specified size.
     *
     * @param size      The size to which the file length is to be adjusted
     */
    FileWriter.prototype.truncate = function(size) {
        var event;

        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        // start
        this.readyState = FileWriter.WRITING;
        if (typeof this.onwritestart == "function") {
            event = {"type":"writestart", "target":this};
            this.onwritestart(event);
        }

        // truncate file
        var me = this;
        navigator.fileMgr.truncate(this.fileName, size,
            // Success callback receives the new file size
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // new file size is returned
                me.length = result;
                // position is lesser of old position or new file size
                me.position = Math.min(me.position, result);

                // success procedure
                if (typeof me.onwrite == "function") {
                    event = {"type":"write", "target":me};
                    me.onwrite(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            },

            // Error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            }
        );
    };

    /**
     * Writes the contents of a file to the device.
     *
     * @param data      contents to be written
     */
    FileWriter.prototype.write = function(data) {
        var event;

        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        // WRITING state
        this.readyState = FileWriter.WRITING;
        if (typeof this.onwritestart == "function") {
            event = {"type":"writestart", "target":this};
            this.onwritestart(event);
        }

        // Write file
        var me = this;
        navigator.fileMgr.write(this.fileName, data, this.position,

            // Success callback receives bytes written
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // position always increases by bytes written because file would be extended
                me.position += result;

                // new length is now where writing finished
                me.length = me.position;

                // success procedure
                if (typeof me.onwrite == "function") {
                    event = {"type":"write", "target":me};
                    me.onwrite(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            },

            // Error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            }
        );
    };

    return FileWriter;
}());

/**
 * Represents a file or directory on the local file system.
 */
var Entry = Entry || (function() {
    /**
     * Represents a file or directory on the local file system.
     *
     * @param isFile
     *            {boolean} true if Entry is a file (readonly)
     * @param isDirectory
     *            {boolean} true if Entry is a directory (readonly)
     * @param name
     *            {DOMString} name of the file or directory, excluding the path
     *            leading to it (readonly)
     * @param fullPath
     *            {DOMString} the absolute full path to the file or directory
     *            (readonly)
     */
    function Entry(entry) {
        // protect against not using 'new'
        if (!(this instanceof Entry)) {
            return new Entry(entry);
        }
        this.isFile = (entry && entry.isFile === true) ? true : false;
        this.isDirectory = (entry && entry.isDirectory === true) ? true : false;
        this.name = (entry && entry.name) || "";
        this.fullPath = (entry && entry.fullPath) || "";
    };

    /**
     * Look up the metadata of the entry.
     *
     * @param successCallback
     *            {Function} is called with a Metadata object
     * @param errorCallback
     *            {Function} is called with a FileError
     */
    Entry.prototype.getMetadata = function(successCallback, errorCallback) {
        var success = function(lastModified) {
                var metadata = new Metadata();
                metadata.modificationTime = new Date(lastModified);
                if (typeof successCallback === "function") {
                    successCallback(metadata);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        Cordova.exec(success, fail, "File", "getMetadata", [this.fullPath]);
    };

    /**
     * Move a file or directory to a new location.
     *
     * @param parent
     *            {DirectoryEntry} the directory to which to move this entry
     * @param newName
     *            {DOMString} new name of the entry, defaults to the current name
     * @param successCallback
     *            {Function} called with the new DirectoryEntry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
        // source path
        var srcPath = this.fullPath,
            // entry name
            name = newName || this.name,
            // destination path
            dstPath,
            success = function(entry) {
                var result;

                if (entry) {
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }
                }
                else {
                    // no Entry object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        // user must specify parent Entry
        if (!parent) {
            fail(FileError.NOT_FOUND_ERR);
            return;
        }

        // copy
        Cordova.exec(success, fail, "File", "moveTo", [srcPath, parent.fullPath, name]);
    };

    /**
     * Copy a directory to a different location.
     *
     * @param parent
     *            {DirectoryEntry} the directory to which to copy the entry
     * @param newName
     *            {DOMString} new name of the entry, defaults to the current name
     * @param successCallback
     *            {Function} called with the new Entry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
            // source path
        var srcPath = this.fullPath,
            // entry name
            name = newName || this.name,
            // success callback
            success = function(entry) {
                var result;

                if (entry) {
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }
                }
                else {
                    // no Entry object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        // user must specify parent Entry
        if (!parent) {
            fail(FileError.NOT_FOUND_ERR);
            return;
        }

        // copy
        Cordova.exec(success, fail, "File", "copyTo", [srcPath, parent.fullPath, name]);
    };

    /**
     * Return a URI that can be used to identify this entry.
     *
     * @param mimeType
     *            {DOMString} for a FileEntry, the mime type to be used to
     *            interpret the file, when loaded through this URI.
     * @param successCallback
     *            {Function} called with the new Entry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.toURL = function() {
        // fullPath attribute contains the full URI on BlackBerry
        return this.fullPath;
    };

    /**
     * Return a URI that can be used to identify this entry.
     *
     * @param mimeType
     *            {DOMString} for a FileEntry, the mime type to be used to
     *            interpret the file, when loaded through this URI.
     * @param successCallback
     *            {Function} called with the new Entry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.toURI = function(mimeType, successCallback, errorCallback) {
        // fullPath attribute contains the full URI on BlackBerry
        console.log("DEPRECATED: Update your code to use 'toURL'");
        return this.fullPath;
    };

    /**
     * Remove a file or directory. It is an error to attempt to delete a
     * directory that is not empty. It is an error to attempt to delete a
     * root directory of a file system.
     *
     * @param successCallback {Function} called with no parameters
     * @param errorCallback {Function} called with a FileError
     */
    Entry.prototype.remove = function(successCallback, errorCallback) {
        var path = this.fullPath,
            // directory contents
            contents = [];

        // file
        if (blackberry.io.file.exists(path)) {
            try {
                blackberry.io.file.deleteFile(path);
                if (typeof successCallback === "function") {
                    successCallback();
                }
            }
            catch (e) {
                // permissions don't allow
                LocalFileSystem.onError(FileError.INVALID_MODIFICATION_ERR, errorCallback);
            }
        }
        // directory
        else if (blackberry.io.dir.exists(path)) {
            // it is an error to attempt to remove the file system root
            if (LocalFileSystem.isFileSystemRoot(path)) {
                LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
            }
            else {
                // check to see if directory is empty
                contents = blackberry.io.dir.listFiles(path);
                if (contents.length !== 0) {
                    LocalFileSystem.onError(FileError.INVALID_MODIFICATION_ERR, errorCallback);
                }
                else {
                    try {
                        // delete
                        blackberry.io.dir.deleteDirectory(path, false);
                        if (typeof successCallback === "function") {
                            successCallback();
                        }
                    }
                    catch (e) {
                        // permissions don't allow
                        LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
                    }
                }
            }
        }
        // not found
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * Look up the parent DirectoryEntry of this entry.
     *
     * @param successCallback {Function} called with the parent DirectoryEntry object
     * @param errorCallback {Function} called with a FileError
     */
    Entry.prototype.getParent = function(successCallback, errorCallback) {
        var that = this;

        try {
            // On BlackBerry, the TEMPORARY file system is actually a temporary
            // directory that is created on a per-application basis.  This is
            // to help ensure that applications do not share the same temporary
            // space.  So we check to see if this is the TEMPORARY file system
            // (directory).  If it is, we must return this Entry, rather than
            // the Entry for its parent.
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
                    function(fileSystem) {
                        if (fileSystem.root.fullPath === that.fullPath) {
                            successCallback(fileSystem.root);
                        }
                        else {
                            window.resolveLocalFileSystemURI(
                                    blackberry.io.dir.getParentDirectory(that.fullPath),
                                    successCallback,
                                    errorCallback);
                        }
                    },
                    function (error) {
                        LocalFileSystem.onError(error, errorCallback);
                    });
        }
        catch (e) {
            // FIXME: need a generic error code
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    return Entry;
}());

/**
 * Represents a directory on the local file system.
 */
var DirectoryEntry = DirectoryEntry || (function() {
    /**
     * Represents a directory on the local file system.
     */
    function DirectoryEntry(entry) {
        DirectoryEntry.__super__.constructor.apply(this, arguments);
    };

    // extend Entry
    Cordova.extend(DirectoryEntry, Entry);

    /**
     * Create or look up a file.
     *
     * @param path {DOMString}
     *            either a relative or absolute path from this directory in
     *            which to look up or create a file
     * @param options {Flags}
     *            options to create or exclusively create the file
     * @param successCallback {Function}
     *            called with the new FileEntry object
     * @param errorCallback {Function}
     *            called with a FileError object if error occurs
     */
    DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
            // create file if it doesn't exist
        var create = (options && options.create === true) ? true : false,
            // if true, causes failure if create is true and path already exists
            exclusive = (options && options.exclusive === true) ? true : false,
            // file exists
            exists,
            // create a new FileEntry object and invoke success callback
            createEntry = function() {
                var path_parts = path.split('/'),
                    name = path_parts[path_parts.length - 1],
                    fileEntry = new FileEntry({name: name,
                        isDirectory: false, isFile: true, fullPath: path});

                // invoke success callback
                if (typeof successCallback === 'function') {
                    successCallback(fileEntry);
                }
            };

        // determine if path is relative or absolute
        if (!path) {
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }
        else if (path.indexOf(this.fullPath) !== 0) {
            // path does not begin with the fullPath of this directory
            // therefore, it is relative
            path = this.fullPath + '/' + path;
        }

        // determine if file exists
        try {
            // will return true if path exists AND is a file
            exists = blackberry.io.file.exists(path);
        }
        catch (e) {
            // invalid path
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }

        // path is a file
        if (exists) {
            if (create && exclusive) {
                // can't guarantee exclusivity
                LocalFileSystem.onError(FileError.PATH_EXISTS_ERR, errorCallback);
            }
            else {
                // create entry for existing file
                createEntry();
            }
        }
        // will return true if path exists AND is a directory
        else if (blackberry.io.dir.exists(path)) {
            // the path is a directory
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // path does not exist, create it
        else if (create) {
            // create empty file
            navigator.fileMgr.write(path, "", 0,
                function(result) {
                    // file created
                    createEntry();
                },
                function(error) {
                    // unable to create file
                    LocalFileSystem.onError(error, errorCallback);
                });
        }
        // path does not exist, don't create
        else {
            // file doesn't exist
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * Creates or looks up a directory.
     *
     * @param path
     *            {DOMString} either a relative or absolute path from this
     *            directory in which to look up or create a directory
     * @param options
     *            {Flags} options to create or exclusively create the
     *            directory
     * @param successCallback
     *            {Function} called with the new DirectoryEntry
     * @param errorCallback
     *            {Function} called with a FileError
     */
    DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
            // create directory if it doesn't exist
        var create = (options && options.create === true) ? true : false,
            // if true, causes failure if create is true and path already exists
            exclusive = (options && options.exclusive === true) ? true : false,
            // directory exists
            exists,
            // create a new DirectoryEntry object and invoke success callback
            createEntry = function() {
                var path_parts = path.split('/'),
                    name = path_parts[path_parts.length - 1],
                    dirEntry = new DirectoryEntry({name: name,
                        isDirectory: true, isFile: false, fullPath: path});

                // invoke success callback
                if (typeof successCallback === 'function') {
                    successCallback(dirEntry);
                }
            };

        // determine if path is relative or absolute
        if (!path) {
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }
        else if (path.indexOf(this.fullPath) !== 0) {
            // path does not begin with the fullPath of this directory
            // therefore, it is relative
            path = this.fullPath + '/' + path;
        }

        // determine if directory exists
        try {
            // will return true if path exists AND is a directory
            exists = blackberry.io.dir.exists(path);
        }
        catch (e) {
            // invalid path
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }

        // path is a directory
        if (exists) {
            if (create && exclusive) {
                // can't guarantee exclusivity
                LocalFileSystem.onError(FileError.PATH_EXISTS_ERR, errorCallback);
            }
            else {
                // create entry for existing directory
                createEntry();
            }
        }
        // will return true if path exists AND is a file
        else if (blackberry.io.file.exists(path)) {
            // the path is a file
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // path does not exist, create it
        else if (create) {
            try {
                // directory path must have trailing slash
                var dirPath = path;
                if (dirPath.substr(-1) !== '/') {
                    dirPath += '/';
                }
                blackberry.io.dir.createNewDir(dirPath);
                createEntry();
            }
            catch (e) {
                // unable to create directory
                LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
            }
        }
        // path does not exist, don't create
        else {
            // directory doesn't exist
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * Delete a directory and all of it's contents.
     *
     * @param successCallback {Function} called with no parameters
     * @param errorCallback {Function} called with a FileError
     */
    DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
        // we're removing THIS directory
        var path = this.fullPath;

        // attempt to delete directory
        if (blackberry.io.dir.exists(path)) {
            // it is an error to attempt to remove the file system root
            if (LocalFileSystem.isFileSystemRoot(path)) {
                LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
            }
            else {
                try {
                    // delete the directory, setting recursive flag to true
                    blackberry.io.dir.deleteDirectory(path, true);
                    if (typeof successCallback === "function") {
                        successCallback();
                    }
                } catch (e) {
                    // permissions don't allow deletion
                    console.log(e);
                    LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
                }
            }
        }
        // it's a file, not a directory
        else if (blackberry.io.file.exists(path)) {
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // not found
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * An interface that lists the files and directories in a directory.
     */
    function DirectoryReader(path) {
        this.path = path || null;
    };

    /**
     * Creates a new DirectoryReader to read entries from this directory
     */
    DirectoryEntry.prototype.createReader = function() {
        return new DirectoryReader(this.fullPath);
    };

    /**
     * Reads the contents of the directory.
     * @param successCallback {Function} called with a list of entries
     * @param errorCallback {Function} called with a FileError
     */
    DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
        var path = this.path,
            // process directory contents
            createEntries = function(array) {
                var entries, entry, num_entries, i, name, result = [];

                // get objects from JSONArray
                try {
                    entries = JSON.parse(array);
                }
                catch (e) {
                    console.log('unable to parse JSON: ' + e);
                    LocalFileSystem.onError(FileError.SYNTAX_ERR, errorCallback);
                    return;
                }

                // append file separator to path
                if (/\/$/.test(path) === false) {
                    path += '/';
                }

                // create FileEntry or DirectoryEntry object for each listing
                for (i = 0, num_entries = entries.length; i < num_entries; i += 1) {
                    name = entries[i];

                    // if name ends with '/', it's a directory
                    if (/\/$/.test(name) === true) {
                        // trim file separator
                        name = name.substring(0, name.length - 1);
                        entry = new DirectoryEntry({
                            name: name,
                            fullPath: path + name,
                            isFile: false,
                            isDirectory: true
                        });
                    }
                    else {
                        entry = new FileEntry({
                            name: name,
                            fullPath: path + name,
                            isFile: true,
                            isDirectory: false
                        });
                    }
                    result.push(entry);
                }
                try {
                    successCallback(result);
                }
                catch (e) {
                    console.log("Error invoking callback: " + e);
                }
            };

        // sanity check
        if (!blackberry.io.dir.exists(path)) {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
            return;
        }

        // list directory contents
        Cordova.exec(createEntries, errorCallback, "File", "readEntries", [path]);
    };

    return DirectoryEntry;
}());

/**
 * Represents a file on the local file system.
 */
var FileEntry = FileEntry || (function() {
    /**
     * Represents a file on the local file system.
     */
    function FileEntry(entry) {
        FileEntry.__super__.constructor.apply(this, arguments);
    };

    // extend Entry
    Cordova.extend(FileEntry, Entry);

    /**
     * Creates a new FileWriter associated with the file that this FileEntry
     * represents.
     *
     * @param successCallback
     *            {Function} called with the new FileWriter
     * @param errorCallback
     *            {Function} called with a FileError
     */
    FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
        var writer;

        // create a FileWriter using a File object for this entry
        this.file(function(file) {
            try {
                writer = new FileWriter(file);
                successCallback(writer);
            }
            catch (e) {
                console.log("Error invoking callback: " + e);
            }
        }, errorCallback);
    };

    /**
     * Returns a File that represents the current state of the file that this
     * FileEntry represents.
     *
     * @param successCallback
     *            {Function} called with the new File object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    FileEntry.prototype.file = function(successCallback, errorCallback) {
        var properties, file;

        // check that file still exists
        if (blackberry.io.file.exists(this.fullPath)) {
            // get file properties
            properties = blackberry.io.file.getFileProperties(this.fullPath);
            file = new File();
            file.name = this.name;
            file.fullPath = this.fullPath;
            file.type = properties.mimeType;
            file.lastModifiedDate = properties.dateModified;
            file.size = properties.size;

            try {
                successCallback(file);
            }
            catch (e) {
                console.log("Error invoking callback: " + e);
            }
        }
        // entry is a directory
        else if (blackberry.io.dir.exists(this.fullPath)) {
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // entry has been deleted
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    return FileEntry;
}());

/**
 * An interface representing a file system
 *
 * name {DOMString} unique name of the file system (readonly)
 * root {DirectoryEntry} directory of the file system (readonly)
 */
function FileSystem() {
    this.name = null;
    this.root = null;
};

/**
 * Information about the state of the file or directory.
 *
 * modificationTime {Date} (readonly)
 */
function Metadata() {
    this.modificationTime = null;
};

/**
 * Supplies arguments to methods that lookup or create files and directories.
 *
 * @param create
 *            {boolean} file or directory if it doesn't exist
 * @param exclusive
 *            {boolean} used with create; if true the command will fail if
 *            target path exists
 */
function Flags(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
};

/**
 * Contains properties of a file on the file system.
 */
var File = (function() {
    /**
     * Constructor.
     * name {DOMString} name of the file, without path information
     * fullPath {DOMString} the full path of the file, including the name
     * type {DOMString} mime type
     * lastModifiedDate {Date} last modified date
     * size {Number} size of the file in bytes
     */
    function File() {
        this.name = null;
        this.fullPath = null;
        this.type = null;
        this.lastModifiedDate = null;
        this.size = 0;
    };

    return File;
}());

/**
 * Represents a local file system.
 */
var LocalFileSystem = LocalFileSystem || (function() {

    /**
     * Define file system types.
     */
    var LocalFileSystem = {
        TEMPORARY: 0,    // temporary, with no guarantee of persistence
        PERSISTENT: 1    // persistent
    };

    /**
     * Static method for invoking error callbacks.
     * @param error FileError code
     * @param errorCallback error callback to invoke
     */
    LocalFileSystem.onError = function(error, errorCallback) {
        var err = new FileError();
        err.code = error;
        try {
            errorCallback(err);
        }
        catch (e) {
            console.log('Error invoking callback: ' + e);
        }
    };

    /**
     * Utility method to determine if the specified path is the root file
     * system path.
     * @param path fully qualified path
     */
    LocalFileSystem.isFileSystemRoot = function(path) {
        return Cordova.exec(null, null, "File", "isFileSystemRoot", [path]);
    };

    /**
     * Request a file system in which to store application data.
     * @param type  local file system type
     * @param size  indicates how much storage space, in bytes, the application expects to need
     * @param successCallback  invoked with a FileSystem object
     * @param errorCallback  invoked if error occurs retrieving file system
     */
    var _requestFileSystem = function(type, size, successCallback, errorCallback) {
            // if successful, return a FileSystem object
        var success = function(file_system) {
            var result;

                if (file_system) {
                    // grab the name from the file system object
                    result = {
                        name: file_system.name || null
                    };

                    // create Entry object from file system root
                    result.root = new DirectoryEntry(file_system.root);
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }
                }
                else {
                    // no FileSystem object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            // error callback
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        Cordova.exec(success, fail, "File", "requestFileSystem", [type, size]);
    };

    /**
     * Look up file system Entry referred to by local URI.
     * @param {DOMString} uri  URI referring to a local file or directory
     * @param successCallback  invoked with Entry object corresponding to URI
     * @param errorCallback    invoked if error occurs retrieving file system entry
     */
    var _resolveLocalFileSystemURI = function(uri, successCallback, errorCallback) {
        // if successful, return either a file or directory entry
        var success = function(entry) {
            var result;

            if (entry) {
                // create appropriate Entry object
                result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);
                try {
                    successCallback(result);
                }
                catch (e) {
                    console.log('Error invoking callback: ' + e);
                }
            }
            else {
                // no Entry object returned
                fail(FileError.NOT_FOUND_ERR);
            }
        };

        // error callback
        var fail = function(error) {
            LocalFileSystem.onError(error, errorCallback);
        };
        Cordova.exec(success, fail, "File", "resolveLocalFileSystemURI", [uri]);
    };

    /**
     * Add the FileSystem interface into the browser.
     */
    Cordova.addConstructor(function() {
        if(typeof window.requestFileSystem === "undefined") {
            window.requestFileSystem  = _requestFileSystem;
        }
        if(typeof window.resolveLocalFileSystemURI === "undefined") {
            window.resolveLocalFileSystemURI = _resolveLocalFileSystemURI;
        }
    });

    return LocalFileSystem;
}());

/*
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
 */

/**
 * Acceleration object has 3D coordinates and timestamp.
 */
var Acceleration = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.timestamp = new Date().getTime();
};

/**
 * navigator.accelerometer
 *
 * Provides access to device accelerometer data.
 */
(function() {
    /**
     * Check that navigator.accelerometer has not been initialized.
     */
    if (typeof navigator.accelerometer !== "undefined") {
        return;
    }

    /**
     * @constructor
     */
    function Accelerometer() {
        /**
         * The last known acceleration. type=Acceleration()
         */
        this.lastAcceleration = null;

        /**
         * List of accelerometer watch timers
         */
        this.timers = {};
    };

    /**
     * Asynchronously acquires the current acceleration.
     *
     * @param {Function} successCallback    The function to call when the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     */
    Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
        // successCallback required
        if (typeof successCallback !== "function") {
            console.log("Accelerometer Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback !== "function")) {
            console.log("Accelerometer Error: errorCallback is not a function");
            return;
        }

        // Get acceleration
        Cordova.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
    };

    /**
     * Asynchronously acquires the device acceleration at a given interval.
     *
     * @param {Function} successCallback    The function to call each time the acceleration data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
     * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
        // Default interval (10 sec)
        var frequency = (options != undefined)? options.frequency : 10000;

        // successCallback required
        if (typeof successCallback != "function") {
            console.log("Accelerometer Error: successCallback is not a function");
            return;
        }

        // errorCallback optional
        if (errorCallback && (typeof errorCallback != "function")) {
            console.log("Accelerometer Error: errorCallback is not a function");
            return;
        }

        // Make sure accelerometer timeout > frequency + 10 sec
        Cordova.exec(
                function(timeout) {
                    if (timeout < (frequency + 10000)) {
                        Cordova.exec(null, null, "Accelerometer", "setTimeout", [frequency + 10000]);
                    }
                },
                function(e) { }, "Accelerometer", "getTimeout", []);

        // Start watch timer
        var id = Cordova.createUUID();
        navigator.accelerometer.timers[id] = setInterval(function() {
            Cordova.exec(successCallback, errorCallback, "Accelerometer", "getAcceleration", []);
        }, (frequency ? frequency : 1));

        return id;
    };

    /**
     * Clears the specified accelerometer watch.
     *
     * @param {String} id The id of the watch returned from #watchAcceleration.
     */
    Accelerometer.prototype.clearWatch = function(id) {
        // Stop timer & remove from timer list
        if (id && navigator.accelerometer.timers[id] != undefined) {
            clearInterval(navigator.accelerometer.timers[id]);
            delete navigator.accelerometer.timers[id];
        }
    };

    /**
     * Define navigator.accelerometer object.
     */
    Cordova.addConstructor(function() {
        navigator.accelerometer = new Accelerometer();
    });
}());

/*
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
 */

/**
 * navigator.app
 */
(function() {
    /**
     * Check to see that navigator.app has not been initialized.
     */
    if (typeof navigator.app !== "undefined") {
        return;
    }

    /**
     * This class provides general application management (clear cache/history,
     * navigate back history) as well as implementing the desired lifecycle
     * events.
     *
     * The lifecycle events for an application are defined as follows:
     *     Load page:               onload
     *     Load next page:          Previous page onunload, Next page onload
     *     Start another app:       pause
     *     Return to app:           resume
     *     Turn off display:        pause
     *     Turn on display:         resume
     *     Exit app:                onunload
     *
     * The WebWorks framework handles the onload of a page and onunload when
     * leaving a page.  All other events are enforced by this plugin.
     *
     * @constructor
     */
    var App = function() {
        this._resumeListener = [];
        this._pauseListener = [];
    };

    /**
     * Function to fire the resume event and notify the plugins that a resume
     * has occurred.  Used when display turns on and when returning to this
     * application from another application.
     */
    var resumeApp = function() {
        Cordova.fireDocumentEvent("resume");

        // notify Cordova JavaScript Extension
        cordova.PluginManager.resume();
    };

    /**
     * Function to fire the pause event and notify the plugins that a pause has
     * occurred.  Used when display turns off and when switching to another
     * application from this application.
     */
    var pauseApp = function() {
        Cordova.fireDocumentEvent("pause");

        // notify Cordova JavaScript Extension
        cordova.PluginManager.pause();
    };

    /**
     * Function to exit the application. Calls the window.onunload() method if
     * it is defined, cleans up the plugins and exits the application.
     */
    var exitApp = function() {
        // Call onunload if it is defined since BlackBerry does not invoke
        // on application exit.
        if (typeof window.onunload === "function") {
            window.onunload();
        }

        // allow Cordova JavaScript Extension opportunity to cleanup
        cordova.PluginManager.destroy();

        // exit the app
        blackberry.app.exit();
    };

    /**
     * Navigate back in the browser history.
     */
    App.prototype.backHistory = function() {
        // window.history.back() behaves oddly on BlackBerry, so use
        // native implementation.
        Cordova.exec(null, null, "App", "backHistory", []);
    };

    /**
     * Clear the resource cache.
     */
    App.prototype.clearCache = function() {
        if (typeof blackberry.widgetcache === "undefined"
            || blackberry.widgetcache === null) {
            console.log("blackberry.widgetcache permission not found. Cache clear denied.");
            return;
        }
        blackberry.widgetcache.clearAll();
    };

    /**
     * Clear the browser history.
     */
    App.prototype.clearHistory = function() {
        Cordova.exec(null, null, "App", "clearHistory", []);
    };

    /**
     * Exit the application.
     */
    App.prototype.exitApp = exitApp;

    /**
     * Event handler for pause and resume events. An application may register to
     * listen for "pause" and "resume" events using:
     *
     * document.addEventListener("pause", function, false);
     * document.addEventListener("resume", function, false);
     *
     * When an application registers for either the pause or resume event, a
     * system listener is created in the native plugin code to listen for
     * backlight changes. When the backlight turns off, the pause event is
     * fired. When the backlight turns on the resume event is fired.
     *
     * @param {Object}
     *            eventType
     * @param {Object}
     *            handler
     * @param {Object}
     *            add
     */
    App.prototype._eventHandler = function(eventType, handler, add) {
        var me = navigator.app;
        if (add) {
            // If there are no current registered event listeners start the
            // backlight system listener on native side.
            if (me._resumeListener.length === 0
                    && me._pauseListener.length === 0) {
                Cordova.exec(function(on) {
                    if (on === true) {
                        resumeApp();
                    } else {
                        pauseApp();
                    }
                }, function(e) {
                    console.log("Error detecting backlight on/off");
                }, "App", "detectBacklight", [])
            }

            // Register the event listener in the proper array
            if (eventType === "resume") {
                var pos = me._resumeListener.indexOf(handler);
                if (pos === -1) {
                    me._resumeListener.push(handler);
                }
            } else if (eventType === "pause") {
                var pos = me._pauseListener.indexOf(handler);
                if (pos === -1) {
                    me._pauseListener.push(handler);
                }
            }
        } else {
            // Remove the event listener from the proper array
            if (eventType === "resume") {
                var pos = me._resumeListener.indexOf(handler);
                if (pos > -1) {
                    me._resumeListener.splice(pos, 1);
                }
            } else if (eventType === "pause") {
                var pos = me._pauseListener.indexOf(handler);
                if (pos > -1) {
                    me._pauseListener.splice(pos, 1);
                }
            }

            // If there are no more registered event listeners stop the
            // backlight system listener on native side.
            if (me._resumeListener.length === 0
                    && me._pauseListener.length === 0) {
                Cordova.exec(null, null, "App", "ignoreBacklight", []);
            }
        }
    };

    Cordova.addConstructor(function() {
        navigator.app = new App();

        // Register the event handlers so application can listen for events.
        Cordova.addDocumentEventHandler("pause", navigator.app._eventHandler);
        Cordova.addDocumentEventHandler("resume",navigator.app._eventHandler);
    });

    /**
     * When BlackBerry WebWorks application is brought to foreground, fire
     * resume event.
     */
    blackberry.app.event.onForeground(resumeApp);

    /**
     * When BlackBerry WebWorks application is sent to background, fire pause
     * event.
     */
    blackberry.app.event.onBackground(pauseApp);

    /**
     * Trap BlackBerry WebWorks exit. Allow plugins to clean up before exiting.
     */
    if (blackberry.app.event.onExit) {
        blackberry.app.event.onExit(exitApp);
    }

}());

/*
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
 */

/**
 * Provides the ability to override the behavior of button events.
 */
(function() {

    // Ensure that event handlers are only registered once.
    if (typeof Cordova.documentEventHandler['backbutton'] !== "undefined") {
        return;
    }

    // Only attempt to capture button events if the application has the
    // required permission.
    if (typeof blackberry.system.event === "undefined"
            || blackberry.system.event === null) {
        return;
    }

    /**
     * Physical buttons on the BlackBerry device that can be captured. Key is
     * the javascript event to listen for on the document object. Value is the
     * associated BlackBerry key identifier.
     */
    var buttonMapping = {
        'backbutton' : blackberry.system.event.KEY_BACK,
        'conveniencebutton1' : blackberry.system.event.KEY_CONVENIENCE_1,
        'conveniencebutton2' : blackberry.system.event.KEY_CONVENIENCE_2,
        'endcallbutton' : blackberry.system.event.KEY_ENDCALL,
        'menubutton' : blackberry.system.event.KEY_MENU,
        'startcallbutton' : blackberry.system.event.KEY_STARTCALL,
        'volumedownbutton' : blackberry.system.event.KEY_VOLUMEDOWN,
        'volumeupbutton' : blackberry.system.event.KEY_VOLUMEUP
    };

    /**
     * A map of events to listener arrays.  The keys must match the keys
     * specified for buttonMapping.
     */
    var buttonListeners = {
        'backbutton' : [],
        'conveniencebutton1' : [],
        'conveniencebutton2' : [],
        'endcallbutton' : [],
        'menubutton' : [],
        'startcallbutton' : [],
        'volumedownbutton' : [],
        'volumeupbutton' : []
    };

    /**
     * Helper function to generate a function that fires the specified event.
     *
     * @param {Object}
     *            event - the event to fire.
     */
    var fireEvent = function(event) {
        return function() {
            Cordova.fireDocumentEvent(event, null);
        };
    };

    var Button = function() {
    };

    /**
     * Handle addEventListener() and removeEventListener() for button events.
     *
     * @param {Object}
     *            eventType - one of the key identifiers from buttonMapping.
     * @param {Object}
     *            handler - function to call when eventType occurs.
     * @param {Object}
     *            add - whether to add or remove the event listener.
     */
    Button.prototype.eventHandler = function(eventType, handler, add) {
        // Nothing to do if an eventType or handler is not specified.
        if (eventType === null || handler === null) {
            return;
        }

        if (typeof buttonMapping[eventType] !== 'undefined') {
            // Check if the handler already exists in the list of handlers for
            // this event.
            var pos = buttonListeners[eventType].indexOf(handler);

            if (add) {
                // Add the handler to the list of handlers for this event if
                // it doesn't exist.
                if (pos === -1) {
                    // If this is the first handler for this event, register a
                    // button listener.
                    if (buttonListeners[eventType].length === 0) {
                        blackberry.system.event.onHardwareKey(
                                buttonMapping[eventType], fireEvent(eventType));
                    }

                    buttonListeners[eventType].push(handler);
                }
            } else {
                // Remove the handler from the list of handlers for this
                // event if it was found.
                if (pos > -1) {
                    buttonListeners[eventType].splice(pos, 1);

                    // If there are no more handlers for the event, remove
                    // the button listener.
                    if (buttonListeners[eventType].length === 0) {
                        // Specifying null as the function removes the button
                        // listener. This sets behavior back to default for the
                        // button.
                        blackberry.system.event.onHardwareKey(
                                buttonMapping[eventType], null);
                    }
                }
            }
        }
    };

    Cordova.addConstructor(function() {
        var button = new Button();

        // Register button event handlers so application can listen for events.
        for (var item in buttonMapping) {
            Cordova.addDocumentEventHandler(item, button.eventHandler);
        }
    });
}());

/*
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
     * Encoding of image returned from getPicture.
     *
     * Example: navigator.camera.getPicture(success, fail,
     *              { quality: 80,
     *                destinationType: Camera.DestinationType.DATA_URL,
     *                sourceType: Camera.PictureSourceType.CAMERA,
     *                encodingType: Camera.EncodingType.PNG})
     */
    var EncodingType = {
        JPEG: 0,                    // Return JPEG encoded image
        PNG: 1                      // Return PNG encoded image
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
    Camera.prototype.EncodingType = EncodingType;

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

        if (typeof options.quality == "number") {
            quality = options.quality;
        } else if (typeof options.quality == "string") {
            var qlity = new Number(options.quality);
            if (isNaN(qlity) === false) {
                quality = qlity.valueOf();
            }
        }

        var destinationType = DestinationType.FILE_URI;
        if (options.destinationType) {
            destinationType = options.destinationType;
        }

        var sourceType = PictureSourceType.CAMERA;
        if (typeof options.sourceType == "number") {
            sourceType = options.sourceType;
        }

        var targetWidth = -1;
        if (typeof options.targetWidth == "number") {
            targetWidth = options.targetWidth;
        } else if (typeof options.targetWidth == "string") {
            var width = new Number(options.targetWidth);
            if (isNaN(width) === false) {
                targetWidth = width.valueOf();
            }
        }

        var targetHeight = -1;
        if (typeof options.targetHeight == "number") {
            targetHeight = options.targetHeight;
        } else if (typeof options.targetHeight == "string") {
            var height = new Number(options.targetHeight);
            if (isNaN(height) === false) {
                targetHeight = height.valueOf();
            }
        }

        var encodingType = EncodingType.JPEG;
        if (typeof options.encodingType == "number") {
            encodingType = options.encodingType;
        }

        Cordova.exec(successCallback, errorCallback, "Camera", "takePicture", [quality, destinationType, sourceType, targetWidth, targetHeight, encodingType]);
    };

    /**
     * Define navigator.camera object.
     */
    Cordova.addConstructor(function() {
        navigator.camera = new Camera();
    });

    /**
     * Return an object that contains the static constants.
     */
    return {
        DestinationType: DestinationType,
        PictureSourceType: PictureSourceType,
        EncodingType: EncodingType
    };
}());

/*
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
 * Copyright (c) 2011, Research In Motion Limited
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
    Cordova.extend(MediaFile, File);

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
            // let Cordova know we're ready after retrieving all of the
            // supported capture modes
            addCaptureModes = function(type, modes) {
                self[type] = modes;
                if (typeof self.supportedAudioModes !== 'undefined'
                    && typeof self.supportedImageModes !== 'undefined'
                    && typeof self.supportedVideoModes !== 'undefined') {
                    Cordova.initializationComplete(captureId);
                }
            };

        // populate supported capture modes
        Cordova.exec(function(modes) {
            addCaptureModes('supportedAudioModes', parseArray(modes));
        }, function(error) {
            console.log('Unable to retrieve supported audio modes: ' + error);
            addCaptureModes('supportedAudioModes', []);
        }, 'MediaCapture', 'getSupportedAudioModes', []);

        Cordova.exec(function(modes) {
            addCaptureModes('supportedImageModes', parseArray(modes));
        }, function(error) {
            console.log('Unable to retrieve supported image modes: ' + error);
            addCaptureModes('supportedImageModes', []);
        }, 'MediaCapture', 'getSupportedImageModes', []);

        Cordova.exec(function(modes) {
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

        Cordova.exec(
            function(mediaFiles) {
                successCallback(getMediaFiles(mediaFiles));
            },
            function(error) {
                Capture.onError(error, errorCallback);
            },
            'MediaCapture',
            'captureImage',
            [limit, mode]
        );
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

        Cordova.exec(
            function(mediaFiles) {
                successCallback(getMediaFiles(mediaFiles));
            },
            function(error) {
                Capture.onError(error, errorCallback);
            },
            'MediaCapture',
            'captureVideo',
            [limit, duration, mode]);
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

        Cordova.exec(
           function(mediaFiles) {
                successCallback(getMediaFiles(mediaFiles));
            },
            function(error) {
                Capture.onError(error, errorCallback);
            },
            'MediaCapture',
            'captureAudio',
            [limit, duration, mode]);
    };

    /**
     * Cancels all pending capture operations.
     */
    Capture.prototype.cancelCaptures = function() {
        Cordova.exec(null, null, 'MediaCapture', 'stopCaptures', []);
    };

    /**
     * Define navigator.device.capture object.
     */
    Cordova.addConstructor(function() {
        Cordova.waitForInitialization(captureId);

        //No way to guarantee order of constructors so just incase this goes first
		if (typeof navigator.device === 'undefined') {
            navigator.device = {};
        }

        navigator.device.capture = new Capture();
    });
}());

/*
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
 */

/**
 * ContactError
 */
var ContactError = function(code) {
    this.code = code;
};

ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.TIMEOUT_ERROR = 2;
ContactError.PENDING_OPERATION_ERROR = 3;
ContactError.IO_ERROR = 4;
ContactError.NOT_SUPPORTED_ERROR = 5;
ContactError.PERMISSION_DENIED_ERROR = 20;

/**
 * Contact name.
 * @param formatted full name formatted for display
 * @param familyName family or last name
 * @param givenName given or first name
 * @param middle middle name
 * @param prefix honorific prefix or title
 * @param suffix honorific suffix
 */
var ContactName = function(formatted, familyName, givenName, middle, prefix, suffix) {
    this.formatted = formatted || null;
    this.familyName = familyName || null;
    this.givenName = givenName || null;
    this.middleName = middle || null;
    this.honorificPrefix = prefix || null;
    this.honorificSuffix = suffix || null;
};

/**
 * Generic contact field.
 * @param type contains the type of information for this field, e.g. 'home', 'mobile'
 * @param value contains the value of this field
 * @param pref indicates whether this instance is preferred
 */
var ContactField = function(type, value, pref) {
    this.type = type || null;
    this.value = value || null;
    this.pref = pref || false;
};

/**
 * Contact address.
 * @param pref indicates whether this instance is preferred
 * @param type contains the type of address, e.g. 'home', 'work'
 * @param formatted full physical address, formatted for display
 * @param streetAddress street address
 * @param locality locality or city
 * @param region region or state
 * @param postalCode postal or zip code
 * @param country country name
 */
var ContactAddress = function(pref, type, formatted, streetAddress, locality, region, postalCode, country) {
    this.pref = pref || false;
    this.type = type || null;
    this.formatted = formatted || null;
    this.streetAddress = streetAddress || null;
    this.locality = locality || null;
    this.region = region || null;
    this.postalCode = postalCode || null;
    this.country = country || null;
};

/**
 * Contact organization.
 * @param pref indicates whether this instance is preferred
 * @param type contains the type of organization
 * @param name name of organization
 * @param dept department
 * @param title job title
 */
var ContactOrganization = function(pref, type, name, dept, title) {
    this.pref = pref || false;
    this.type = type || null;
    this.name = name || null;
    this.department = dept || null;
    this.title = title || null;
};

/**
 * Contact object.
 */
var Contact = Contact || (function() {
    /**
     * Contains information about a single contact.
     * @param {DOMString} id unique identifier
     * @param {DOMString} displayName
     * @param {ContactName} name
     * @param {DOMString} nickname
     * @param {ContactField[]} phoneNumbers array of phone numbers
     * @param {ContactField[]} emails array of email addresses
     * @param {ContactAddress[]} addresses array of addresses
     * @param {ContactField[]} ims instant messaging user ids
     * @param {ContactOrganization[]} organizations
     * @param {Date} birthday contact's birthday
     * @param {DOMString} note user notes about contact
     * @param {ContactField[]} photos
     * @param {DOMString[]} categories
     * @param {ContactField[]} urls contact's web sites
     */
    function Contact(id, displayName, name, nickname, phoneNumbers, emails, addresses,
        ims, organizations, birthday, note, photos, categories, urls) {
        this.id = id || null;
        this.displayName = displayName || null;
        this.name = name || null; // ContactName
        this.nickname = nickname || null;
        this.phoneNumbers = phoneNumbers || null; // ContactField[]
        this.emails = emails || null; // ContactField[]
        this.addresses = addresses || null; // ContactAddress[]
        this.ims = ims || null; // ContactField[]
        this.organizations = organizations || null; // ContactOrganization[]
        this.birthday = birthday || null;
        this.note = note || null;
        this.photos = photos || null; // ContactField[]
        this.categories = categories || null; // DOMString[]
        this.urls = urls || null; // ContactField[]
    };

    /**
     * Persists contact to device storage.
     */
    Contact.prototype.save = function(success, fail) {
        try {
            // save the contact and store it's unique id
            var fullContact = saveToDevice(this);
            this.id = fullContact.id;

            // This contact object may only have a subset of properties
            // if the save was an update of an existing contact.  This is
            // because the existing contact was likely retrieved using a subset
            // of properties, so only those properties were set in the object.
            // For this reason, invoke success with the contact object returned
            // by saveToDevice since it is fully populated.
            if (success) {
                success(fullContact);
            }
        } catch (e) {
            console.log('Error saving contact: ' + e);
            if (fail) {
                fail(new ContactError(ContactError.UNKNOWN_ERROR));
            }
        }
    };

    /**
     * Removes contact from device storage.
     *
     * @param success success callback
     * @param fail error callback
     */
    Contact.prototype.remove = function(success, fail) {
        try {
            // retrieve contact from device by id
            var bbContact = null;
            if (this.id) {
                bbContact = findByUniqueId(this.id);
            }

            // if contact was found, remove it
            if (bbContact) {
                console.log('removing contact: ' + bbContact.uid);
                bbContact.remove();
                if (success) {
                    success(this);
                }
            }
            // attempting to remove a contact that hasn't been saved
            else if (fail) {
                fail(new ContactError(ContactError.UNKNOWN_ERROR));
            }
        }
        catch (e) {
            console.log('Error removing contact ' + this.id + ": " + e);
            if (fail) {
                fail(new ContactError(ContactError.UNKNOWN_ERROR));
            }
        }
    };

    /**
     * Creates a deep copy of this Contact.
     *
     * @return copy of this Contact
     */
    Contact.prototype.clone = function() {
        var clonedContact = Cordova.clone(this);
        clonedContact.id = null;
        return clonedContact;
    };

    //------------------
    // Utility functions
    //------------------

    /**
     * Retrieves a BlackBerry contact from the device by unique id.
     *
     * @param uid Unique id of the contact on the device
     * @return {blackberry.pim.Contact} BlackBerry contact or null if contact
     * with specified id is not found
     */
    var findByUniqueId = function(uid) {
        if (!uid) {
            return null;
        }
        var bbContacts = blackberry.pim.Contact.find(
                new blackberry.find.FilterExpression("uid", "==", uid));
        return bbContacts[0] || null;
    };

    /**
     * Creates a BlackBerry contact object from the W3C Contact object
     * and persists it to device storage.
     *
     * @param {Contact} contact The contact to save
     * @return a new contact object with all properties set
     */
    var saveToDevice = function(contact) {

        if (!contact) {
            return;
        }

        var bbContact = null;
        var update = false;

        // if the underlying BlackBerry contact already exists, retrieve it for update
        if (contact.id) {
            // we must attempt to retrieve the BlackBerry contact from the device
            // because this may be an update operation
            bbContact = findByUniqueId(contact.id);
        }

        // contact not found on device, create a new one
        if (!bbContact) {
            bbContact = new blackberry.pim.Contact();
        }
        // update the existing contact
        else {
            update = true;
        }

        // NOTE: The user may be working with a partial Contact object, because only
        // user-specified Contact fields are returned from a find operation (blame
        // the W3C spec).  If this is an update to an existing Contact, we don't
        // want to clear an attribute from the contact database simply because the
        // Contact object that the user passed in contains a null value for that
        // attribute.  So we only copy the non-null Contact attributes to the
        // BlackBerry contact object before saving.
        //
        // This means that a user must explicitly set a Contact attribute to a
        // non-null value in order to update it in the contact database.
        //
        // name
        if (contact.name !== null) {
            if (contact.name.givenName) {
                bbContact.firstName = contact.name.givenName;
            }
            if (contact.name.familyName) {
                bbContact.lastName = contact.name.familyName;
            }
            if (contact.name.honorificPrefix) {
                bbContact.title = contact.name.honorificPrefix;
            }
        }

        // display name
        if (contact.displayName !== null) {
            bbContact.user1 = contact.displayName;
        }

        // note
        if (contact.note !== null) {
            bbContact.note = contact.note;
        }

        // birthday
        //
        // user may pass in Date object or a string representation of a date
        // if it is a string, we don't know the date format, so try to create a
        // new Date with what we're given
        //
        // NOTE: BlackBerry's Date.parse() does not work well, so use new Date()
        //
        if (contact.birthday !== null) {
            if (contact.birthday instanceof Date) {
                bbContact.birthday = contact.birthday;
            } else {
                var bday = contact.birthday.toString();
                bbContact.birthday = (bday.length > 0) ? new Date(bday) : "";
            }
        }

        // BlackBerry supports three email addresses
        if (contact.emails && contact.emails instanceof Array) {

            // if this is an update, re-initialize email addresses
            if (update) {
                bbContact.email1 = "";
                bbContact.email2 = "";
                bbContact.email3 = "";
            }

            // copy the first three email addresses found
            var email = null;
            for (var i=0; i<contact.emails.length; i+=1) {
                email = contact.emails[i];
                if (!email || !email.value) {
                    continue;
                }
                if (bbContact.email1 === "") {
                    bbContact.email1 = email.value;
                }
                else if (bbContact.email2 === "") {
                    bbContact.email2 = email.value;
                }
                else if (bbContact.email3 === "") {
                    bbContact.email3 = email.value;
                }
            }
        }

        // BlackBerry supports a finite number of phone numbers
        // copy into appropriate fields based on type
        if (contact.phoneNumbers && contact.phoneNumbers instanceof Array) {

            // if this is an update, re-initialize phone numbers
            if (update) {
                bbContact.homePhone = "";
                bbContact.homePhone2 = "";
                bbContact.workPhone = "";
                bbContact.workPhone2 = "";
                bbContact.mobilePhone = "";
                bbContact.faxPhone = "";
                bbContact.pagerPhone = "";
                bbContact.otherPhone = "";
            }

            var type = null;
            var number = null;
            for (var i=0; i<contact.phoneNumbers.length; i+=1) {
                if (!contact.phoneNumbers[i] || !contact.phoneNumbers[i].value) {
                    continue;
                }
                type = contact.phoneNumbers[i].type;
                number = contact.phoneNumbers[i].value;
                if (type === 'home') {
                    if (bbContact.homePhone === "") {
                        bbContact.homePhone = number;
                    }
                    else if (bbContact.homePhone2 === "") {
                        bbContact.homePhone2 = number;
                    }
                } else if (type === 'work') {
                    if (bbContact.workPhone === "") {
                        bbContact.workPhone = number;
                    }
                    else if (bbContact.workPhone2 === "") {
                        bbContact.workPhone2 = number;
                    }
                } else if (type === 'mobile' && bbContact.mobilePhone === "") {
                    bbContact.mobilePhone = number;
                } else if (type === 'fax' && bbContact.faxPhone === "") {
                    bbContact.faxPhone = number;
                } else if (type === 'pager' && bbContact.pagerPhone === "") {
                    bbContact.pagerPhone = number;
                } else if (bbContact.otherPhone === "") {
                    bbContact.otherPhone = number;
                }
            }
        }

        // BlackBerry supports two addresses: home and work
        // copy the first two addresses found from Contact
        if (contact.addresses && contact.addresses instanceof Array) {

            // if this is an update, re-initialize addresses
            if (update) {
                bbContact.homeAddress = null;
                bbContact.workAddress = null;
            }

            var address = null;
            var bbHomeAddress = null;
            var bbWorkAddress = null;
            for (var i=0; i<contact.addresses.length; i+=1) {
                address = contact.addresses[i];
                if (!address || address instanceof ContactAddress === false) {
                    continue;
                }

                if (bbHomeAddress === null &&
                        (!address.type || address.type === "home")) {
                    bbHomeAddress = createBlackBerryAddress(address);
                    bbContact.homeAddress = bbHomeAddress;
                }
                else if (bbWorkAddress === null &&
                        (!address.type || address.type === "work")) {
                    bbWorkAddress = createBlackBerryAddress(address);
                    bbContact.workAddress = bbWorkAddress;
                }
            }
        }

        // copy first url found to BlackBerry 'webpage' field
        if (contact.urls && contact.urls instanceof Array) {

            // if this is an update, re-initialize web page
            if (update) {
                bbContact.webpage = "";
            }

            var url = null;
            for (var i=0; i<contact.urls.length; i+=1) {
                url = contact.urls[i];
                if (!url || !url.value) {
                    continue;
                }
                if (bbContact.webpage === "") {
                    bbContact.webpage = url.value;
                    break;
                }
            }
        }

        // copy fields from first organization to the
        // BlackBerry 'company' and 'jobTitle' fields
        if (contact.organizations && contact.organizations instanceof Array) {

            // if this is an update, re-initialize org attributes
            if (update) {
                bbContact.company = "";
            }

            var org = null;
            for (var i=0; i<contact.organizations.length; i+=1) {
                org = contact.organizations[i];
                if (!org) {
                    continue;
                }
                if (bbContact.company === "") {
                    bbContact.company = org.name || "";
                    bbContact.jobTitle = org.title || "";
                    break;
                }
            }
        }

        // categories
        if (contact.categories && contact.categories instanceof Array) {
            bbContact.categories = [];
            var category = null;
            for (var i=0; i<contact.categories.length; i+=1) {
                category = contact.categories[i];
                if (typeof category == "string") {
                    bbContact.categories.push(category);
                }
            }
        }

        // save to device
        bbContact.save();

        // invoke native side to save photo
        // fail gracefully if photo URL is no good, but log the error
        if (contact.photos && contact.photos instanceof Array) {
            var photo = null;
            for (var i=0; i<contact.photos.length; i+=1) {
                photo = contact.photos[i];
                if (!photo || !photo.value) {
                    continue;
                }
                Cordova.exec(
                        // success
                        function() {
                        },
                        // fail
                        function(e) {
                            console.log('Contact.setPicture failed:' + e);
                        },
                        "Contact", "setPicture", [bbContact.uid, photo.type, photo.value]
                );
                break;
            }
        }

        // Use the fully populated BlackBerry contact object to create a
        // corresponding W3C contact object.
        return navigator.contacts._createContact(bbContact, ["*"]);
    };

    /**
     * Creates a BlackBerry Address object from a W3C ContactAddress.
     *
     * @return {blackberry.pim.Address} a BlackBerry address object
     */
    var createBlackBerryAddress = function(address) {
        var bbAddress = new blackberry.pim.Address();

        if (!address) {
            return bbAddress;
        }

        bbAddress.address1 = address.streetAddress || "";
        bbAddress.city = address.locality || "";
        bbAddress.stateProvince = address.region || "";
        bbAddress.zipPostal = address.postalCode || "";
        bbAddress.country = address.country || "";

        return bbAddress;
    };

    return Contact;
}());

/**
 * Contact search criteria.
 * @param filter string-based search filter with which to search and filter contacts
 * @param multiple indicates whether multiple contacts should be returned (defaults to true)
 */
var ContactFindOptions = function(filter, multiple) {
    this.filter = filter || '';
    this.multiple = multiple || false;
};

/**
 * navigator.contacts
 *
 * Provides access to the device contacts database.
 */
(function() {
    /**
     * Check that navigator.contacts has not been initialized.
     */
    if (typeof navigator.contacts !== 'undefined') {
        return;
    }

    /**
     * @constructor
     */
    var Contacts = function() {
    };

    /**
     * This function creates a new contact, but it does not persist the contact
     * to device storage.  To persist the contact to device storage, invoke
     * <code>contact.save()</code>.
     */
    Contacts.prototype.create = function(properties) {
        var contact = new Contact();
        for (var i in properties) {
            if (contact[i] !== 'undefined') {
                contact[i] = properties[i];
            }
        }
        return contact;
    };

    /**
     * Returns an array of Contacts matching the search criteria.
     * @return array of Contacts matching search criteria
     */
    Contacts.prototype.find = function(fields, success, fail, options) {

        // Success callback is required.  Throw exception if not specified.
        if (!success) {
            throw new TypeError("You must specify a success callback for the find command.");
        }

        // Search qualifier is required and cannot be empty.
        if (!fields || !(fields instanceof Array) || fields.length == 0) {
            if (typeof fail === "function") {
                fail(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
            }
            return;
        } else if (fields.length == 1 && fields[0] === "*") {
            // Cordova enhancement to allow fields value of ["*"] to indicate
            // all supported fields.
            fields = allFields;
        }

        // default is to return a single contact match
        var numContacts = 1;

        // search options
        var filter = null;
        if (options) {
            // return multiple objects?
            if (options.multiple === true) {
                // -1 on BlackBerry will return all contact matches.
                numContacts = -1;
            }
            filter = options.filter;
        }

        // build the filter expression to use in find operation
        var filterExpression = buildFilterExpression(fields, filter);

        // find matching contacts
        // Note: the filter expression can be null here, in which case, the find won't filter
        var bbContacts = blackberry.pim.Contact.find(filterExpression, null, numContacts);

        // convert to Contact from blackberry.pim.Contact
        var contacts = [];
        for (var i in bbContacts) {
            if (bbContacts[i]) {
                // W3C Contacts API specification states that only the fields
                // in the search filter should be returned, so we create
                // a new Contact object, copying only the fields specified
                contacts.push(this._createContact(bbContacts[i], fields));
            }
        }

        // return results
        if (success && success instanceof Function) {
            success(contacts);
        } else {
            console.log("Error invoking Contacts.find success callback.");
        }
    };

    //---------------
    // Find utilities
    //---------------

    /**
     * Mappings for each Contact field that may be used in a find operation.
     * Maps W3C Contact fields to one or more fields in a BlackBerry
     * contact object.
     *
     * Example: user searches with a filter on the Contact 'name' field:
     *
     * <code>Contacts.find(['name'], onSuccess, onFail, {filter:'Bob'});</code>
     *
     * The 'name' field does not exist in a BlackBerry contact.  Instead, a
     * filter expression will be built to search the BlackBerry contacts using
     * the BlackBerry 'title', 'firstName' and 'lastName' fields.
     */
    var fieldMappings = {
         "id"                        : "uid",
         "displayName"               : "user1",
         "name"                      : [ "title", "firstName", "lastName" ],
         "name.formatted"            : [ "title", "firstName", "lastName" ],
         "name.givenName"            : "firstName",
         "name.familyName"           : "lastName",
         "name.honorificPrefix"      : "title",
         "phoneNumbers"              : [ "faxPhone", "homePhone", "homePhone2",
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "phoneNumbers.value"        : [ "faxPhone", "homePhone", "homePhone2",
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "emails"                    : [ "email1", "email2", "email3" ],
         "addresses"                 : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.formatted"       : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.streetAddress"   : [ "homeAddress.address1", "homeAddress.address2",
                                         "workAddress.address1", "workAddress.address2" ],
         "addresses.locality"        : [ "homeAddress.city", "workAddress.city" ],
         "addresses.region"          : [ "homeAddress.stateProvince", "workAddress.stateProvince" ],
         "addresses.country"         : [ "homeAddress.country", "workAddress.country" ],
         "organizations"             : [ "company", "jobTitle" ],
         "organizations.name"        : "company",
         "organizations.title"       : "jobTitle",
         "birthday"                  : "birthday",
         "note"                      : "note",
         "categories"                : "categories",
         "urls"                      : "webpage",
         "urls.value"                : "webpage"
    };

    /*
     * Build an array of all of the valid W3C Contact fields.  This is used
     * to substitute all the fields when ["*"] is specified.
     */
    var allFields = [];
    for ( var key in fieldMappings) {
        if (fieldMappings.hasOwnProperty(key)) {
            allFields.push(key);
        }
    }

    /**
     * Builds a BlackBerry filter expression for contact search using the
     * contact fields and search filter provided.
     *
     * @param {String[]} fields Array of Contact fields to search
     * @param {String} filter Filter, or search string
     * @return filter expression or null if fields is empty or filter is null or empty
     */
    var buildFilterExpression = function(fields, filter) {

        // ensure filter exists
        if (!filter || filter === "") {
            return null;
        }

        // BlackBerry API uses specific operators to build filter expressions for
        // querying Contact lists.  The operators are ["!=","==","<",">","<=",">="].
        // Use of regex is also an option, and the only one we can use to simulate
        // an SQL '%LIKE%' clause.
        //
        // Note: The BlackBerry regex implementation doesn't seem to support
        // conventional regex switches that would enable a case insensitive search.
        // It does not honor the (?i) switch (which causes Contact.find() to fail).
        // We need case INsensitivity to match the W3C Contacts API spec.
        // So the guys at RIM proposed this method:
        //
        // original filter = "norm"
        // case insensitive filter = "[nN][oO][rR][mM]"
        //
        var ciFilter = "";
        for (var i = 0; i < filter.length; i++) {
            ciFilter = ciFilter + "[" + filter[i].toLowerCase() + filter[i].toUpperCase() + "]";
        }

        // match anything that contains our filter string
        filter = ".*" + ciFilter + ".*";

        // build a filter expression using all Contact fields provided
        var filterExpression = null;
        if (fields && fields instanceof Array) {
            var fe = null;
            for (var i in fields) {
                if (!fields[i]) {
                    continue;
                }

                // retrieve the BlackBerry contact fields that map to the one specified
                var bbFields = fieldMappings[fields[i]];

                // BlackBerry doesn't support the field specified
                if (!bbFields) {
                    continue;
                }

                // construct the filter expression using the BlackBerry fields
                for (var j in bbFields) {
                    fe = new blackberry.find.FilterExpression(bbFields[j], "REGEX", filter);
                    if (filterExpression === null) {
                        filterExpression = fe;
                    } else {
                        // combine the filters
                        filterExpression = new blackberry.find.FilterExpression(
                                filterExpression, "OR", fe);
                    }
                }
            }
        }

        return filterExpression;
    };

    /**
     * Creates a Contact object from a BlackBerry Contact object,
     * copying only the fields specified.
     *
     * This is intended as a privately used function but it is made globally
     * available so that a Contact.save can convert a BlackBerry contact object
     * into its W3C equivalent.
     *
     * @param {blackberry.pim.Contact} bbContact BlackBerry Contact object
     * @param {String[]} fields array of contact fields that should be copied
     * @return {Contact} a contact object containing the specified fields
     * or null if the specified contact is null
     */
    Contacts.prototype._createContact = function(bbContact, fields) {

        if (!bbContact) {
            return null;
        }

        // construct a new contact object
        // always copy the contact id and displayName fields
        var contact = new Contact(bbContact.uid, bbContact.user1);

        // nothing to do
        if (!fields || !(fields instanceof Array) || fields.length == 0) {
            return contact;
        } else if (fields.length == 1 && fields[0] === "*") {
            // Cordova enhancement to allow fields value of ["*"] to indicate
            // all supported fields.
            fields = allFields;
        }

        // add the fields specified
        for (var i in fields) {
            var field = fields[i];

            if (!field) {
                continue;
            }

            // name
            if (field.indexOf('name') === 0) {
                var formattedName = bbContact.title + ' ' +
                    bbContact.firstName + ' ' + bbContact.lastName;
                contact.name = new ContactName(formattedName, bbContact.lastName,
                        bbContact.firstName, null, bbContact.title, null);
            }
            // phone numbers
            else if (field.indexOf('phoneNumbers') === 0) {
                var phoneNumbers = [];
                if (bbContact.homePhone) {
                    phoneNumbers.push(new ContactField('home', bbContact.homePhone));
                }
                if (bbContact.homePhone2) {
                    phoneNumbers.push(new ContactField('home', bbContact.homePhone2));
                }
                if (bbContact.workPhone) {
                    phoneNumbers.push(new ContactField('work', bbContact.workPhone));
                }
                if (bbContact.workPhone2) {
                    phoneNumbers.push(new ContactField('work', bbContact.workPhone2));
                }
                if (bbContact.mobilePhone) {
                    phoneNumbers.push(new ContactField('mobile', bbContact.mobilePhone));
                }
                if (bbContact.faxPhone) {
                    phoneNumbers.push(new ContactField('fax', bbContact.faxPhone));
                }
                if (bbContact.pagerPhone) {
                    phoneNumbers.push(new ContactField('pager', bbContact.pagerPhone));
                }
                if (bbContact.otherPhone) {
                    phoneNumbers.push(new ContactField('other', bbContact.otherPhone));
                }
                contact.phoneNumbers = phoneNumbers.length > 0 ? phoneNumbers : null;
            }
            // emails
            else if (field.indexOf('emails') === 0) {
                var emails = [];
                if (bbContact.email1) {
                    emails.push(new ContactField(null, bbContact.email1, null));
                }
                if (bbContact.email2) {
                    emails.push(new ContactField(null, bbContact.email2, null));
                }
                if (bbContact.email3) {
                    emails.push(new ContactField(null, bbContact.email3, null));
                }
                contact.emails = emails.length > 0 ? emails : null;
            }
            // addresses
            else if (field.indexOf('addresses') === 0) {
                var addresses = [];
                if (bbContact.homeAddress) {
                    addresses.push(createContactAddress("home", bbContact.homeAddress));
                }
                if (bbContact.workAddress) {
                    addresses.push(createContactAddress("work", bbContact.workAddress));
                }
                contact.addresses = addresses.length > 0 ? addresses : null;
            }
            // birthday
            else if (field.indexOf('birthday') === 0) {
                if (bbContact.birthday) {
                    contact.birthday = bbContact.birthday;
                }
            }
            // note
            else if (field.indexOf('note') === 0) {
                if (bbContact.note) {
                    contact.note = bbContact.note;
                }
            }
            // organizations
            else if (field.indexOf('organizations') === 0) {
                var organizations = [];
                if (bbContact.company || bbContact.jobTitle) {
                    organizations.push(
                        new ContactOrganization(null, null, bbContact.company, null, bbContact.jobTitle));
                }
                contact.organizations = organizations.length > 0 ? organizations : null;
            }
            // categories
            else if (field.indexOf('categories') === 0) {
                if (bbContact.categories && bbContact.categories.length > 0) {
                    contact.categories = bbContact.categories;
                } else {
                    contact.categories = null;
                }
            }
            // urls
            else if (field.indexOf('urls') === 0) {
                var urls = [];
                if (bbContact.webpage) {
                    urls.push(new ContactField(null, bbContact.webpage));
                }
                contact.urls = urls.length > 0 ? urls : null;
            }
            // photos
            else if (field.indexOf('photos') === 0) {
                var photos = [];
                // The BlackBerry Contact object will have a picture attribute
                // with Base64 encoded image
                if (bbContact.picture) {
                    photos.push(new ContactField('base64', bbContact.picture));
                }
                contact.photos = photos.length > 0 ? photos : null;
            }
        }

        return contact;
    };

    /**
     * Create a W3C ContactAddress object from a BlackBerry Address object.
     *
     * @param {String} type the type of address (e.g. work, home)
     * @param {blackberry.pim.Address} bbAddress a BlakcBerry Address object
     * @return {ContactAddress} a contact address object or null if the specified
     * address is null
     */
    var createContactAddress = function(type, bbAddress) {

        if (!bbAddress) {
            return null;
        }

        var address1 = bbAddress.address1 || "";
        var address2 = bbAddress.address2 || "";
        var streetAddress = address1 + ", " + address2;
        var locality = bbAddress.city || "";
        var region = bbAddress.stateProvince || "";
        var postalCode = bbAddress.zipPostal || "";
        var country = bbAddress.country || "";
        var formatted = streetAddress + ", " + locality + ", " + region + ", " + postalCode + ", " + country;

        return new ContactAddress(null, type, formatted, streetAddress, locality, region, postalCode, country);
    };

    /**
     * Define navigator.contacts object.
     */
    Cordova.addConstructor(function() {
        navigator.contacts = new Contacts();
    });
}());

/*
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
 */

/**
 * Options to customize the HTTP request used to upload files.
 *
 * @constructor
 * @param fileKey
 *            {String} Name of file request parameter.
 * @param fileName
 *            {String} Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType
 *            {String} Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params
 *            {Object} Object with key: value params to send to the server.
 */
var FileUploadOptions = function(fileKey, fileName, mimeType, params) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
};

/**
 * FileUploadResult
 * @constructor
 */
var FileUploadResult = function() {
    this.bytesSent = 0;
    this.responseCode = null;
    this.response = null;
};

/**
 * FileTransferError
 * @constructor
 */
var FileTransferError = function() {
    this.code = null;
};

FileTransferError.FILE_NOT_FOUND_ERR = 1;
FileTransferError.INVALID_URL_ERR = 2;
FileTransferError.CONNECTION_ERR = 3;

/**
 * FileTransfer transfers files to a remote server.
 */
var FileTransfer = FileTransfer || (function() {
    /**
     * @constructor
     */
    function FileTransfer() {
    };

    /**
     * Given an absolute file path, uploads a file on the device to a remote
     * server using a multipart HTTP request.
     *
     * @param filePath
     *            {String} Full path of the file on the device
     * @param server
     *            {String} URL of the server to receive the file
     * @param successCallback
     *            (Function} Callback to be invoked when upload has completed
     * @param errorCallback
     *            {Function} Callback to be invoked upon error
     * @param options
     *            {FileUploadOptions} Optional parameters such as file name and
     *            mimetype
     */
    FileTransfer.prototype.upload = function(filePath, server, successCallback,
            errorCallback, options, debug) {

        // check for options
        var fileKey = null;
        var fileName = null;
        var mimeType = null;
        var params = null;
        var chunkedMode = true;
        if (options) {
            fileKey = options.fileKey;
            fileName = options.fileName;
            mimeType = options.mimeType;
            if (options.chunkedMode !== null
                    || typeof options.chunkedMode !== "undefined") {
                chunkedMode = options.chunkedMode;
            }
            if (options.params) {
                params = options.params;
            } else {
                params = {};
            }
        }

        Cordova.exec(successCallback, errorCallback, 'FileTransfer', 'upload',
                [ filePath, server, fileKey, fileName, mimeType, params, debug,
                        chunkedMode ]);
    };

    /**
     * Downloads a file form a given URL and saves it to the specified
     * directory.
     *
     * @param source
     *            {String} URL of the server to receive the file
     * @param target
     *            {String} Full path of the file on the device
     * @param successCallback
     *            (Function} Callback to be invoked when upload has completed
     * @param errorCallback
     *            {Function} Callback to be invoked upon error
     */
    FileTransfer.prototype.download = function(source, target, successCallback,
            errorCallback) {
        var castSuccess = function(entry) {
            if (typeof successCallback === "function") {
                var fileEntry = new FileEntry(entry);
                successCallback(entry);
            }
        };
        Cordova.exec(castSuccess, errorCallback, 'FileTransfer',
                'download', [ source, target ]);
    };

    return FileTransfer;
}());

/*
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
 */

/**
 * Position error object
 *
 * @param code
 * @param message
 */
function PositionError(code, message) {
    this.code = code;
    this.message = message;
};

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

/**
 * navigator._geo
 *
 * Provides access to device GPS.
 */
var Geolocation = Geolocation || (function() {
    /**
     * @constructor
     */
    function Geolocation() {

        // The last known GPS position.
        this.lastPosition = null;

        // Geolocation listeners
        this.listeners = {};
    };

    /**
     * Acquires the current geo position.
     *
     * @param {Function} successCallback    The function to call when the position data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the heading position. (OPTIONAL)
     * @param {PositionOptions} options     The options for getting the position data. (OPTIONAL)
     */
    Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {

        var id = "global";
        if (navigator._geo.listeners[id]) {
            console.log("Geolocation Error: Still waiting for previous getCurrentPosition() request.");
            try {
                errorCallback(new PositionError(PositionError.TIMEOUT,
                        "Geolocation Error: Still waiting for previous getCurrentPosition() request."));
            } catch (e) {
            }
            return;
        }

        // default maximumAge value should be 0, and set if positive
        var maximumAge = 0;

        // default timeout value should be infinity, but that's a really long time
        var timeout = 3600000;

        var enableHighAccuracy = false;
        if (options) {
            if (options.maximumAge && (options.maximumAge > 0)) {
                maximumAge = options.maximumAge;
            }
            if (options.enableHighAccuracy) {
                enableHighAccuracy = options.enableHighAccuracy;
            }
            if (options.timeout) {
                timeout = (options.timeout < 0) ? 0 : options.timeout;
            }
        }
        navigator._geo.listeners[id] = {"success" : successCallback, "fail" : errorCallback };
        Cordova.exec(null, errorCallback, "Geolocation", "getCurrentPosition",
                [id, maximumAge, timeout, enableHighAccuracy]);
    };

    /**
     * Monitors changes to geo position.  When a change occurs, the successCallback
     * is invoked with the new location.
     *
     * @param {Function} successCallback    The function to call each time the location data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
     * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {

        // default maximumAge value should be 0, and set if positive
        var maximumAge = 0;

        // DO NOT set timeout to a large value for watchPosition in BlackBerry.
        // The interval used for updates is half the timeout value, so a large
        // timeout value will mean a long wait for the first location.
        var timeout = 10000;

        var enableHighAccuracy = false;
        if (options) {
            if (options.maximumAge && (options.maximumAge > 0)) {
                maximumAge = options.maximumAge;
            }
            if (options.enableHighAccuracy) {
                enableHighAccuracy = options.enableHighAccuracy;
            }
            if (options.timeout) {
                timeout = (options.timeout < 0) ? 0 : options.timeout;
            }
        }
        var id = Cordova.createUUID();
        navigator._geo.listeners[id] = {"success" : successCallback, "fail" : errorCallback };
        Cordova.exec(null, errorCallback, "Geolocation", "watchPosition",
                [id, maximumAge, timeout, enableHighAccuracy]);
        return id;
    };

    /*
     * Native callback when watch position has a new position.
     */
    Geolocation.prototype.success = function(id, result) {

        var p = result.message;
        var coords = new Coordinates(p.latitude, p.longitude, p.altitude,
                p.accuracy, p.heading, p.speed, p.alt_accuracy);
        var loc = new Position(coords, p.timestamp);
        try {
            navigator._geo.lastPosition = loc;
            navigator._geo.listeners[id].success(loc);
        }
        catch (e) {
            console.log("Geolocation Error: Error calling success callback function.");
        }

        if (id == "global") {
            delete navigator._geo.listeners["global"];
        }
    };

    /**
     * Native callback when watch position has an error.
     *
     * @param {String} id       The ID of the watch
     * @param {Object} result   The result containing status and message
     */
    Geolocation.prototype.fail = function(id, result) {
        var code = result.status;
        var msg = result.message;
        try {
            navigator._geo.listeners[id].fail(new PositionError(code, msg));
        }
        catch (e) {
            console.log("Geolocation Error: Error calling error callback function.");
        }

        if (id == "global") {
            delete navigator._geo.listeners["global"];
        }
    };

    /**
     * Clears the specified position watch.
     *
     * @param {String} id       The ID of the watch returned from #watchPosition
     */
    Geolocation.prototype.clearWatch = function(id) {
        Cordova.exec(null, null, "Geolocation", "stop", [id]);
        delete navigator._geo.listeners[id];
    };

    /**
     * Is Cordova implementation being used.
     */
    var usingCordova = false;

    /**
     * Force Cordova implementation to override navigator.geolocation.
     */
    var useCordova = function() {
        if (usingCordova) {
            return;
        }
        usingCordova = true;

        // Set built-in geolocation methods to our own implementations
        // (Cannot replace entire geolocation, but can replace individual methods)
        navigator.geolocation.getCurrentPosition = navigator._geo.getCurrentPosition;
        navigator.geolocation.watchPosition = navigator._geo.watchPosition;
        navigator.geolocation.clearWatch = navigator._geo.clearWatch;
        navigator.geolocation.success = navigator._geo.success;
        navigator.geolocation.fail = navigator._geo.fail;
    };

    /**
     * Define navigator.geolocation object.
     */
    Cordova.addConstructor(function() {
        navigator._geo = new Geolocation();

        // if no native geolocation object, use Cordova geolocation
        if (typeof navigator.geolocation === 'undefined') {
            navigator.geolocation = navigator._geo;
            usingCordova = true;
        }
    });

    /**
     * Enable developers to override browser implementation.
     */
    return {
        useCordova: useCordova
    };
}());

/*
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
 */

/**
 * Network status
 */
Connection = {
		UNKNOWN: "unknown",
		ETHERNET: "ethernet",
		WIFI: "wifi",
		CELL_2G: "2g",
		CELL_3G: "3g",
		CELL_4G: "4g",
		NONE: "none"
};

/**
 * navigator.network
 */
(function() {
    /**
     * Check to see that navigator.network has not been initialized.
     */
    if (typeof navigator.network !== "undefined") {
        return;
    }

    /**
     * This class contains information about the current network Connection.
     * @constructor
     */
    var NetworkConnection = function() {
        this.type = null;
        this._firstRun = true;

        var me = this;
        this.getInfo(
            function(info) {
                me.type = info.type;
                if (typeof info.event !== "undefined") {
                    Cordova.fireDocumentEvent(info.event);
                }

                // should only fire this once
                if (me._firstRun) {
                    me._firstRun = false;
                    Cordova.onCordovaConnectionReady.fire();
                }
            },
            function(e) {
                // If we can't get the network info we should still tell Cordova
                // to fire the deviceready event.
                if (me._firstRun) {
                    me._firstRun = false;
                    Cordova.onCordovaConnectionReady.fire();
                }
                console.log("Error initializing Network Connection: " + e);
            });
    };

    /**
     * Get connection info
     *
     * @param {Function} successCallback The function to call when the Connection data is available
     * @param {Function} errorCallback The function to call when there is an error getting the Connection data. (OPTIONAL)
     */
    NetworkConnection.prototype.getInfo = function(successCallback, errorCallback) {
        // Get info
        Cordova.exec(successCallback, errorCallback, "Network Status", "getConnectionInfo", []);
    };

    /**
     * Define navigator.network and navigator.network.connection objects
     */
    Cordova.addConstructor(function() {
        navigator.network = new Object();

        navigator.network.connection = new NetworkConnection();
    });
}());

/*
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
 */

/**
 * navigator.notification
 *
 * Provides access to notifications on the device.
 */
(function() {
    /**
     * Check that navigator.notification has not been initialized.
     */
    if (typeof navigator.notification !== "undefined") {
        return;
    }

    /**
     * @constructor
     */
    function Notification() {
    };

    /**
     * Display an activity dialog
     */
    Notification.prototype.activityStart = function(title, message) {
        // If title and message not specified then mimic Android behavior of
        // using default strings.
        if (typeof title === "undefined" && typeof message == "undefined") {
            title = "Busy";
            message = 'Please wait...';
        }

        Cordova.exec(null, null, 'Notification', 'activityStart', [title, message]);
    };

    /**
     * Close an activity dialog
     */
    Notification.prototype.activityStop = function() {
        Cordova.exec(null, null, 'Notification', 'activityStop', []);
    };

    /**
     * Open a native alert dialog, with a customizable title and button text.
     * @param {String}   message          Message to print in the body of the alert
     * @param {Function} completeCallback The callback that is invoked when user clicks a button.
     * @param {String}   title            Title of the alert dialog (default: 'Alert')
     * @param {String}   buttonLabel      Label of the close button (default: 'OK')
     */
    Notification.prototype.alert = function(message, completeCallback, title, buttonLabel) {
        var _title = (title || "Alert");
        var _buttonLabel = (buttonLabel || "OK");
        Cordova.exec(completeCallback, null, 'Notification', 'alert', [message, _title, _buttonLabel]);
    };

    /**
     * Causes the device to blink a status LED.
     *
     * @param {Integer} count       The number of blinks.
     * @param {String} color       The color of the light.
     */
    Notification.prototype.blink = function(count, color) {
        // NOT IMPLEMENTED
    };

    /**
     * Open a custom confirmation dialog, with a customizable title and button text.
     * @param {String}  message         Message to print in the body of the dialog
     * @param {Function}resultCallback  The callback that is invoked when a user clicks a button.
     * @param {String}  title           Title of the alert dialog (default: 'Confirm')
     * @param {String}  buttonLabels    Comma separated list of the button labels (default: 'OK,Cancel')
     */
    Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) {
        var _title = (title || "Confirm");
        var _buttonLabels = (buttonLabels || "OK,Cancel");
        return Cordova.exec(resultCallback, null, 'Notification', 'confirm', [message, _title, _buttonLabels]);
    };

    /**
     * Display a progress dialog with progress bar that goes from 0 to 100.
     *
     * @param {String} title        Title of the progress dialog.
     * @param {String} message      Message to display in the dialog.
     */
    Notification.prototype.progressStart = function(title, message) {
        Cordova.exec(null, null, 'Notification', 'progressStart', [title, message]);
    };

    /**
     * Close the progress dialog.
     */
    Notification.prototype.progressStop = function() {
        Cordova.exec(null, null, 'Notification', 'progressStop', []);
    };

    /**
     * Set the progress dialog value.
     *
     * @param {Number} value         0-100
     */
    Notification.prototype.progressValue = function(value) {
        Cordova.exec(null, null, 'Notification', 'progressValue', [value]);
    };

    /**
     * Causes the device to vibrate.
     * @param {Integer} mills The number of milliseconds to vibrate for.
     */
    Notification.prototype.vibrate = function(mills) {
        Cordova.exec(null, null, 'Notification', 'vibrate', [mills]);
    };

    /**
     * Causes the device to beep.
     * @param {Integer} count The number of beeps.
     */
    Notification.prototype.beep = function(count) {
        Cordova.exec(null, null, 'Notification', 'beep', [count]);
    };

    /**
     * Define navigator.notification object.
     */
    Cordova.addConstructor(function() {
        navigator.notification = new Notification();
    });
}());

/*
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
 */

/**
 * This class contains position information.
 * @param {Object} lat The latitude of the position.
 * @param {Object} lng The longitude of the position.
 * @param {Object} alt The altitude of the position.
 * @param {Object} acc The accuracy of the position.
 * @param {Object} head The direction the device is moving at the position.
 * @param {Object} vel The velocity with which the device is moving at the position.
 * @param {Object} altacc The altitude accuracy of the position.
 */
function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
    this.latitude = lat;
    this.longitude = lng;
    this.accuracy = acc;
    this.altitude = alt;
    this.heading = head;
    this.speed = vel;
    this.altitudeAccuracy = (altacc != 'undefined') ? altacc : null;
};

function Position(coords, timestamp) {
    this.coords = coords;
    this.timestamp = timestamp;
};
