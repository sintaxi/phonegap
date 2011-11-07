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
using System.Linq;

namespace WP7GapClassLib.PhoneGap
{
    /// <summary>
    /// Represents PhoneGap native command call: action callback, etc
    /// </summary>
    public class PhoneGapCommandCall
    {
        public String Service {get; private set;}
        public String Action {get; private set;}
        public String CallbackId {get; private set;}
        public String Args {get; private set;}
        
        /// <summary>
        /// Retrieves command call parameters and creates wrapper for them
        /// </summary>
        /// <param name="commandStr">Command string in the form 'service/action/callback/args'</param>
        /// <returns>New class instance or null of string does not represent PhoneGap command</returns>
        public static PhoneGapCommandCall Parse(string commandStr)
        {
            if (string.IsNullOrEmpty(commandStr))
            {
                return null;
                //throw new ArgumentNullException("commandStr");
            }

            string[] split = commandStr.Split('/');
            if (split.Length < 3)
            {
                return null;
            }

            PhoneGapCommandCall commandCallParameters = new PhoneGapCommandCall();

            commandCallParameters.Service = split[0];
            commandCallParameters.Action = split[1];
            commandCallParameters.CallbackId = split[2];
            commandCallParameters.Args = split.Length <= 3 ? String.Empty : String.Join("/", split.Skip(3));

            // sanity check for illegal names
            // was failing with ::
            // PhoneGapCommandResult :: 1, Device1, {"status":1,"message":"{\"name\":\"XD.....
            if (commandCallParameters.Service.IndexOfAny(new char[] { '@', ':', ',', '!', ' ' }) > -1)
            {
                return null;
            }


            return commandCallParameters;
        }


        /// <summary>
        /// Private ctr to disable class creation.
        /// New class instance must be initialized via PhoneGapCommandCall.Parse static method.
        /// </summary>
        private PhoneGapCommandCall() { }
            

    }
}
