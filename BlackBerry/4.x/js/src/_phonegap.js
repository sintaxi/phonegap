/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
var PhoneGap = {
    queue: {
        ready: true,
        commands: [],
        timer: null
    }
};

/**
 * Adds a plugin object to window.plugins
 */
PhoneGap.addPlugin = function(name, obj) {
	if ( !window.plugins ) {
		window.plugins = {};
	}

	if ( !window.plugins[name] ) {
		window.plugins[name] = obj;
	}
}

PhoneGap.callbackId = 0;
/**
 * Every call to execAsync pushes a handler into the callbacks, keyed
 * on the class name + callbackId
 */
PhoneGap.callbacks = {};

/**
 * Execute a PhoneGap command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when PhoneGap is ready to
 * recieve them.
 * @param {String} command Command to be run in PhoneGap, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 */
PhoneGap.exec = function() {
    var args = '', i, command;
	if (arguments.length === 1) {
		args = arguments[0];
	} else {
		for (i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i]) === "string") {
				args += arguments[i] + '/';
			} else {
				if (typeof(arguments[i])==="object" && arguments[i].length > 1) {
					args += arguments[i].join('/') + '/';
				} else {
					args += arguments[i] + '/';
				}
			}
		}
		args = args.substr(0,args.length-1);
	}
	command = "PhoneGap=" + args;
	//alert(command);
	document.cookie = command;
};

/**
 * Executes native code asynchonously
 * @param {Function} success The function to be called when the async task 
 * completes successfully.
 * @param {Function} fail The function to be called when an error occurs in 
 * the async task.
 * @param {String} clazz The fully qualified class name of the class to call.
 * @param {String} action The the method to call on the class.
 * @param {Object} args The arguments to pass to the method.
 */
PhoneGap.execAsync = function(success, fail, clazz, action, args) {
    var callbackId = clazz + PhoneGap.callbackId++;
    PhoneGap.callbacks[callbackId] = {success:success, fail:fail};
    document.cookie = JSON.stringify( { 
        clazz:clazz, action:action, callbackId:callbackId, args:args, async:true 
    } );
};

PhoneGap.callbackSuccess = function(callbackId, args) {
    PhoneGap.callbacks[callbackId].success(args);
    delete PhoneGap.callbacks[callbackId];
};

PhoneGap.callbackError = function(callbackId, args) {
    PhoneGap.callbacks[callbackId].fail(args);
    delete PhoneGap.callbacks[callbackId];
};

/**
 * Custom pub-sub channel that can have functions subscribed to it
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
    if (f == null) { return; }

    var func = f;
    if (typeof c == "object" && f instanceof Function) { func = PhoneGap.close(c, f); }

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
    var g = null, that = this;
    var m = function() {
        f.apply(c || null, arguments);
        that.unsubscribe(g);
    }
    if (this.fired) {
	    if (typeof c == "object" && f instanceof Function) { f = PhoneGap.close(c, f); }
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
    if (g instanceof Function) { g = g.observer_guid; }
    this.handlers[g] = null;
    delete this.handlers[g];
};

/** 
 * Calls all functions subscribed to this channel.
 */
PhoneGap.Channel.prototype.fire = function(e) {
    var fail = false, item, handler, rv;
    if (this.enabled) {
        for (item in this.handlers) {
            handler = this.handlers[item];
            if (handler instanceof Function) {
                rv = (handler.apply(this, arguments)==false);
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
PhoneGap.Channel.join = function(h, c) {
    var i = c.length, j = 0, f = function() {
        if (!(--i)) h();
    }
    for ( ; j<i; j++) {
        (!c[j].fired?c[j].subscribeOnce(f):i--);
    }
    if (!i) h();
}


/**
 * onDOMContentLoaded channel is fired when the DOM content 
 * of the page has been parsed.
 */
PhoneGap.onDOMContentLoaded = new PhoneGap.Channel();

/**
 * onNativeReady channel is fired when the PhoneGap native code
 * has been initialized.
 */
PhoneGap.onNativeReady = new PhoneGap.Channel();

/**
 * onDeviceReady is fired only after both onDOMContentLoaded and 
 * onNativeReady have fired.
 */
PhoneGap.onDeviceReady = new PhoneGap.Channel();


// Compatibility stuff so that we can use addEventListener('deviceready')
// and addEventListener('touchstart')
PhoneGap.m_document_addEventListener = document.addEventListener;

document.addEventListener = function(evt, handler, capture) {
    if (evt === 'deviceready') {
        PhoneGap.onDeviceReady.subscribeOnce(handler);
    } else {
        PhoneGap.m_document_addEventListener.call(document, evt, handler, capture);
    }
};

PhoneGap.m_element_addEventListener = Element.prototype.addEventListener;

/**
 * For BlackBerry, the touchstart event does not work so we need to do click
 * events when touchstart events are attached.
 */
Element.prototype.addEventListener = function(evt, handler, capture) {
    if (evt === 'touchstart') {
        evt = 'click';
    }
    PhoneGap.m_element_addEventListener.call(this, evt, handler, capture);
};

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since 
// it may be called before any PhoneGap JS is ready.
if (typeof _nativeReady !== 'undefined') { PhoneGap.onNativeReady.fire(); }

PhoneGap.Channel.join(function() {
    PhoneGap.onDeviceReady.fire();
}, [ PhoneGap.onDOMContentLoaded, PhoneGap.onNativeReady ]);


// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener('DOMContentLoaded', function() {
    PhoneGap.onDOMContentLoaded.fire();
}, false);