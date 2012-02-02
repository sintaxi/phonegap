/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
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
using WP7GapClassLib.PhoneGap.JSON;

namespace WP7GapClassLib.PhoneGap
{
    /// <summary>
    /// Represents client script function to execute
    /// </summary>
    public class ScriptCallback : EventArgs
    {
        /// <summary>
        /// The scripting function to execute.
        /// </summary>
        public string ScriptName { get; private set; }

        /// <summary>
        /// A variable number of strings to pass to the function as parameters.
        /// </summary>
        public string[] Args { get; private set; }

        /// <summary>
        /// Creates new instance of a ScriptCallback class.
        /// </summary>
        /// <param name="function">The scripting function to execute</param>
        /// <param name="args">A variable number of strings to pass to the function as parameters</param>
        public ScriptCallback(string function, string[] args)
        {
            this.ScriptName = function;
            this.Args = args;
        }

        /// <summary>
        /// Creates new instance of a ScriptCallback class.
        /// </summary>
        /// <param name="function">The scripting function to execute</param>
        /// <param name="id">The id argument</param>
        /// <param name="msg">The message argument</param>
        /// <param name="value">The value argument</param>
        public ScriptCallback(string function, string id, object msg, object value)
        {
            this.ScriptName = function;

            String arg = String.Format("{{\"id\": {0}, \"msg\": {1}, \"value\": {2}}}",
                 JsonHelper.Serialize(id), JsonHelper.Serialize(msg), JsonHelper.Serialize(value));

            this.Args = new string[] { arg };
        }

        
    }
}
