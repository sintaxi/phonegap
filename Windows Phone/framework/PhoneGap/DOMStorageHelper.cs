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
using WP7GapClassLib.PhoneGap.JSON;

/*
 * Translates DOMStorage API between JS and Isolated Storage
 * Missing pieces : QUOTA_EXCEEDED_ERR  + StorageEvent  
 * */

namespace WP7GapClassLib
{
    public class DOMStorageHelper
    {
        protected WebBrowser webBrowser1;

        public DOMStorageHelper(WebBrowser gapBrowser)
        {
            this.webBrowser1 = gapBrowser;
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
            return UserSettings[type] as Dictionary<string,string>;
        }


        public void HandleStorageCommand(string commandStr)
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
                                webBrowser1.InvokeScript("execScript", "window." + type + ".onResult('" + param + "','" + value + "');");
                            }
                            else
                            {
                                webBrowser1.InvokeScript("execScript", "window." + type + ".onResult('" + param + "');");
                            }

                        }
                        break;
                    case "load":
                        {
                            string[] keys = currentStorage.Keys.ToArray();
                            string jsonString = JsonHelper.Serialize(keys);
                            string callbackJS = "window." + type + ".onKeysChanged('" + jsonString + "');";
                            webBrowser1.InvokeScript("execScript", callbackJS);
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
                            webBrowser1.InvokeScript("execScript", callbackJS);
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

        }
    }
}
