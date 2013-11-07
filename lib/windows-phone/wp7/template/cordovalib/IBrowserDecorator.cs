using Microsoft.Phone.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WPCordovaClassLib.CordovaLib
{
    interface IBrowserDecorator
    {
        WebBrowser Browser { get; set; }
        void InjectScript();
        bool HandleCommand(string cmd);
    }
}
