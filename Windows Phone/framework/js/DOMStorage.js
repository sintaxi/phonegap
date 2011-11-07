
// this is a WP7 Only implementation of the Storage API for use in webpages loaded from the local file system
// inside phonegap application.
// there is a native implementation which is backing this and providing the persistance of values.
// webpages loaded from a domain will not need to use this as IE9 has support for WebStorage
// Javascript Interface is as defined here : http://dev.w3.org/html5/webstorage/#storage-0
// 

if(!window.localStorage)
{(function()
{
    "use strict";

    var DOMStorage = function(type)
    {
        // default type is local
        if(type == "sessionStorage")
        {
            this._type = type;
        }
        Object.defineProperty( this, "length", 
        {
            configurable: true,
            get: function(){ return this.getLength() }
        });

    };

    DOMStorage.prototype = 
    {
        _type:"localStorage",
        _result:null,
        keys:null,
    
        onResult:function(key,valueStr)
        {
            if(!this.keys)
            {
                this.keys = [];
            }
            this._result = valueStr;
        },

        onKeysChanged:function(jsonKeys)
        {
            this.keys = JSON.parse(jsonKeys);

            var key;
            for(var n = 0,len =this.keys.length; n < len; n++)
            {
                key = this.keys[n];
                if(!this.hasOwnProperty(key))
                {
                    console.log("didn't have a prop, now we do ...");
                    Object.defineProperty( this, key, 
                    {

                        configurable: true,
                        get: function(){ return this.getItem(key); },
                        set: function(val){ return this.setItem(key,val); }
                    });
                }
            }

        },

        initialize:function()
        {
            window.external.Notify("DOMStorage/" + this._type + "/load/keys");
        },

    /*
        The length attribute must return the number of key/value pairs currently present in the list associated with the object.
    */
        getLength:function()
        {
            if(!this.keys)
            {
                this.initialize();
            }
            return this.keys.length;
        },

    /*
        The key(n) method must return the name of the nth key in the list. 
        The order of keys is user-agent defined, but must be consistent within an object so long as the number of keys doesn't change. 
        (Thus, adding or removing a key may change the order of the keys, but merely changing the value of an existing key must not.) 
        If n is greater than or equal to the number of key/value pairs in the object, then this method must return null. 
    */
        key:function(n)
        {
            if(!this.keys)
            {
                this.initialize();
            }

            if(n >= this.keys.length)
            {
                return null;
            }
            else
            {
                return this.keys[n];
            }
        },

    /*
        The getItem(key) method must return the current value associated with the given key. 
        If the given key does not exist in the list associated with the object then this method must return null.
    */
        getItem:function(key)
        {
            if(!this.keys)
            {
                this.initialize();
            }

            var retVal = null;
            if(this.keys.indexOf(key) > -1)
            {
                window.external.Notify("DOMStorage/" + this._type + "/get/" + key);
                retVal = this._result;
                this._result = null;
            }
            return retVal;
        },
    /*
        The setItem(key, value) method must first check if a key/value pair with the given key already exists 
        in the list associated with the object.
        If it does not, then a new key/value pair must be added to the list, with the given key and with its value set to value.
        If the given key does exist in the list, then it must have its value updated to value.
        If it couldn't set the new value, the method must raise an QUOTA_EXCEEDED_ERR exception. 
        (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
    */
        setItem:function(key,value)
        {
            if(!this.keys)
            {
                this.initialize();
            }
            window.external.Notify("DOMStorage/" + this._type + "/set/" + key + "/" + value);
        },

    /*
        The removeItem(key) method must cause the key/value pair with the given key to be removed from the list 
        associated with the object, if it exists. 
        If no item with that key exists, the method must do nothing.
    */
        removeItem:function(key)
        {
            if(!this.keys)
            {
                this.initialize();
            }
            var index = this.keys.indexOf(key);
            if(index > -1)
            {
                this.keys.splice(index,1);
                // TODO: need sanity check for keys ? like 'clear','setItem', ...
                window.external.Notify("DOMStorage/" + this._type + "/remove/" + key);
                delete this[key];
            }
            
        },

    /*
        The clear() method must atomically cause the list associated with the object to be emptied of all 
        key/value pairs, if there are any. 
        If there are none, then the method must do nothing.
    */
        clear:function()
        {
            if(!this.keys)
            {
                this.initialize();
            }

            for(var n=0,len=this.keys.length; n < len;n++)
            {
                // TODO: do we need a sanity check for keys ? like 'clear','setItem', ...
                delete this[this.keys[n]];
            }
            this.keys = [];
            window.external.Notify("DOMStorage/" + this._type + "/clear/");
        }
    };

    // initialize DOMStorage
    
    Object.defineProperty( window, "localStorage", 
    {
        writable: false,
        configurable: false,
        value:new DOMStorage("localStorage")
    });
    window.localStorage.initialize();

    Object.defineProperty( window, "sessionStorage", 
    {
        writable: false,
        configurable: false,
        value:new DOMStorage("sessionStorage")
    });
    window.sessionStorage.initialize();


})();};

