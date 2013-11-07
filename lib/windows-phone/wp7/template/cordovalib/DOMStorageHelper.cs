/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.IO.IsolatedStorage;
using System.Collections.Generic;
using Microsoft.Phone.Controls;
using System.Linq;
using WPCordovaClassLib.Cordova.JSON;
using WPCordovaClassLib.CordovaLib;

/*
 * Translates DOMStorage API between JS and Isolated Storage
 * Missing pieces : QUOTA_EXCEEDED_ERR  + StorageEvent  
 * */

namespace WPCordovaClassLib
{
    public class DOMStorageHelper : IBrowserDecorator
    {
        public WebBrowser Browser { get; set; }
        public DOMStorageHelper()
        {
            // always clear session at creation
            UserSettings["sessionStorage"] = new Dictionary<string, string>();

            if (!UserSettings.Contains("localStorage"))
            {
                UserSettings["localStorage"] = new Dictionary<string, string>();
                UserSettings.Save();
            }
            Application.Current.Exit += new EventHandler(OnAppExit);
        }

        void OnAppExit(object sender, EventArgs e)
        {
            UserSettings.Remove("sessionStorage");
            UserSettings.Save();
        }

        protected IsolatedStorageSettings UserSettings
        {
            get
            {
                return IsolatedStorageSettings.ApplicationSettings;
            }
        }

        protected Dictionary<string, string> getStorageByType(string type)
        {
            if (!UserSettings.Contains(type))
            {
                UserSettings[type] = new Dictionary<string, string>();
                UserSettings.Save();
            }
            return UserSettings[type] as Dictionary<string, string>;
        }

        public void InjectScript()
        {
            string script = @"(function(win, doc) {
var docDomain = null;
try {
    docDomain = doc.domain;
} catch (err) {}
if (!docDomain || docDomain.length === 0) {
    var DOMStorage = function(type) {
        if (type == 'sessionStorage') {
            this._type = type;
        }
        Object.defineProperty(this, 'length', {
            configurable: true,
            get: function() {
                return this.getLength();
            }
        });
    };
    DOMStorage.prototype = {
        _type: 'localStorage',
        _result: null,
        keys: null,
        onResult: function(key, valueStr) {
            if (!this.keys) {
                this.keys = [];
            }
            this._result = valueStr;
        },
        onKeysChanged: function(jsonKeys) {
            this.keys = JSON.parse(jsonKeys);
            var key;
            for (var n = 0, len = this.keys.length; n < len; n++) {
                key = this.keys[n];
                if (!this.hasOwnProperty(key)) {
                    Object.defineProperty(this, key, {
                        configurable: true,
                        get: function() {
                            return this.getItem(key);
                        },
                        set: function(val) {
                            return this.setItem(key, val);
                        }
                    });
                }
            }
        },
        initialize: function() {
            window.external.Notify('DOMStorage/' + this._type + '/load/keys');
        },
        getLength: function() {
            if (!this.keys) {
                this.initialize();
            }
            return this.keys.length;
        },
        key: function(n) {
            if (!this.keys) {
                this.initialize();
            }
            if (n >= this.keys.length) {
                return null;
            } else {
                return this.keys[n];
            }
        },
        getItem: function(key) {
            if (!this.keys) {
                this.initialize();
            }
            var retVal = null;
            if (this.keys.indexOf(key) > -1) {
                window.external.Notify('DOMStorage/' + this._type + '/get/' + key);
                retVal = window.unescape(decodeURIComponent(this._result));
                this._result = null;
            }
            return retVal;
        },
        setItem: function(key, value) {
            if (!this.keys) {
                this.initialize();
            }
            window.external.Notify('DOMStorage/' + this._type + '/set/' + key + '/' + encodeURIComponent(window.escape(value)));
        },
        removeItem: function(key) {
            if (!this.keys) {
                this.initialize();
            }
            var index = this.keys.indexOf(key);
            if (index > -1) {
                this.keys.splice(index, 1);
                window.external.Notify('DOMStorage/' + this._type + '/remove/' + key);
                delete this[key];
            }
        },
        clear: function() {
            if (!this.keys) {
                this.initialize();
            }
            for (var n = 0, len = this.keys.length; n < len; n++) {
                delete this[this.keys[n]];
            }
            this.keys = [];
            window.external.Notify('DOMStorage/' + this._type + '/clear/');
        }
    };
    if (typeof window.localStorage === 'undefined') {
        Object.defineProperty(window, 'localStorage', {
            writable: false,
            configurable: false,
            value: new DOMStorage('localStorage')
        });
        window.localStorage.initialize();
    }
    if (typeof window.sessionStorage === 'undefined') {
        Object.defineProperty(window, 'sessionStorage', {
            writable: false,
            configurable: false,
            value: new DOMStorage('sessionStorage')
        });
        window.sessionStorage.initialize();
    }
}
})(window, document);";

            Browser.InvokeScript("execScript", new string[] { script });
        }


        public bool HandleCommand(string commandStr)
        {
            string[] split = commandStr.Split('/');
            if (split.Length > 3)
            {
                string api = split[0];
                string type = split[1]; // localStorage || sessionStorage
                string command = split[2];
                string param = split[3];

                Dictionary<string, string> currentStorage = getStorageByType(type);

                switch (command)
                {
                    case "get":
                        {

                            if (currentStorage.Keys.Contains(param))
                            {
                                string value = currentStorage[param];
                                Browser.InvokeScript("execScript", "window." + type + ".onResult('" + param + "','" + value + "');");
                            }
                            else
                            {
                                Browser.InvokeScript("execScript", "window." + type + ".onResult('" + param + "');");
                            }

                        }
                        break;
                    case "load":
                        {
                            string[] keys = currentStorage.Keys.ToArray();
                            string jsonString = JsonHelper.Serialize(keys);
                            string callbackJS = "window." + type + ".onKeysChanged('" + jsonString + "');";
                            Browser.InvokeScript("execScript", callbackJS);
                        }
                        break;
                    case "set":
                        {
                            // TODO: check that length is not out of bounds
                            currentStorage[param] = split[4];
                            UserSettings.Save();
                            string[] keys = currentStorage.Keys.ToArray();
                            string jsonString = JsonHelper.Serialize(keys);
                            string callbackJS = "window." + type + ".onKeysChanged('" + jsonString + "');";
                            Browser.InvokeScript("execScript", callbackJS);
                        }
                        break;
                    case "remove":
                        currentStorage.Remove(param);
                        UserSettings.Save();
                        break;
                    case "clear":
                        currentStorage = new Dictionary<string, string>();
                        UserSettings[type] = currentStorage;
                        UserSettings.Save();
                        break;
                }

            }
            return true;
        }
    }
}
