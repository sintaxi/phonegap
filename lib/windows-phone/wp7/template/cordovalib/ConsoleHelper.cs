using Microsoft.Phone.Controls;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace WPCordovaClassLib.CordovaLib
{
    class ConsoleHelper : IBrowserDecorator
    {

        public WebBrowser Browser { get; set; }

        public void InjectScript() 
        {
            string script = @"(function(win) {
        function exec(msg) { window.external.Notify('ConsoleLog/' + msg); }
        var cons = win.console = win.console || {};
        cons.log = exec;
        cons.debug = cons.debug || cons.log;
        cons.info = cons.info   || function(msg) { exec('INFO:' + msg ); };     
        cons.warn = cons.warn   || function(msg) { exec('WARN:' + msg ); };
        cons.error = cons.error || function(msg) { exec('ERROR:' + msg ); };
    })(window);";

           Browser.InvokeScript("execScript", new string[] { script });
        }

        public bool HandleCommand(string commandStr)
        {
            Debug.WriteLine(commandStr.Substring("ConsoleLog/".Length));
            return true;
        }

    }
}
