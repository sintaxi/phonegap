/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2010-2011, Matt Lacey
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 */

using System;
using System.Diagnostics;
using System.Threading;
using Microsoft.Devices;
using Microsoft.Phone.Controls;
using WP7GapClassLib.PhoneGap.Commands;

namespace WP7GapClassLib.PhoneGap
{
    /// <summary>
    /// Implements logic to execute native command and return result back.
    /// All commands are executed asynchronous.
    /// </summary>
    public class NativeExecution
    {
        /// <summary>
        /// Reference to web part where application is hosted
        /// </summary>
        private readonly WebBrowser webBrowser;

        /// <summary>
        /// Creates new instance of a NativeExecution class. 
        /// </summary>
        /// <param name="browser">Reference to web part where application is hosted</param>
        public NativeExecution(ref WebBrowser browser)
        {
            if (browser == null)
            {
                throw new ArgumentNullException("browser");
            }

            this.webBrowser = browser;
        }

        /// <summary>
        /// Returns where application is running on emulator
        /// </summary>
        /// <returns>True if running on emulator, otherwise False</returns>
        public static bool IsRunningOnEmulator()
        {
            return Microsoft.Devices.Environment.DeviceType == DeviceType.Emulator;
        }

        /// <summary>
        /// Executes command and returns result back.
        /// </summary>
        /// <param name="commandCallParams">Command to execute</param>
        public void ProcessCommand(PhoneGapCommandCall commandCallParams)
        {

            if (commandCallParams == null)
            {
                throw new ArgumentNullException("commandCallParams");
            }

            try
            {

                BaseCommand bc = CommandFactory.CreateByServiceName(commandCallParams.Service);

                if (bc == null)
                {
                    this.OnCommandResult(commandCallParams.CallbackId, new PluginResult(PluginResult.Status.CLASS_NOT_FOUND_EXCEPTION));
                    return;
                }

                EventHandler<PluginResult> OnCommandResultHandler = delegate(object o, PluginResult res)
                {
                    this.OnCommandResult(commandCallParams.CallbackId, res);
                };

                bc.OnCommandResult += OnCommandResultHandler;

                EventHandler<ScriptCallback> OnCustomScriptHandler = delegate(object o, ScriptCallback script)
                {
                    this.InvokeScriptCallback(script);
                };


                bc.OnCustomScript += OnCustomScriptHandler;

                // TODO: alternative way is using thread pool (ThreadPool.QueueUserWorkItem) instead of 
                // new thread for every command call; but num threads are not sufficient - 2 threads per CPU core


                Thread thread = new Thread(func =>
                {

                    try
                    {
                        bc.InvokeMethodNamed(commandCallParams.Action, commandCallParams.Args);
                    }
                    catch (Exception)
                    {
                        bc.OnCommandResult -= OnCommandResultHandler;
                        bc.OnCustomScript -= OnCustomScriptHandler;

                        Debug.WriteLine("failed to InvokeMethodNamed :: " + commandCallParams.Action + " on Object :: " + commandCallParams.Service);

                        this.OnCommandResult(commandCallParams.CallbackId, new PluginResult(PluginResult.Status.INVALID_ACTION));

                        return;
                    }
                });

                thread.Start();
            }
            catch (Exception ex)
            {
                // ERROR
                Debug.WriteLine(String.Format("Unable to execute command :: {0}:{1}:{3} ", 
                    commandCallParams.Service, commandCallParams.Action, ex.Message));

                this.OnCommandResult(commandCallParams.CallbackId, new PluginResult(PluginResult.Status.ERROR));
                return;
            }
        }

        /// <summary>
        /// Handles command execution result.
        /// </summary>
        /// <param name="callbackId">Command callback identifier on client side</param>
        /// <param name="result">Execution result</param>
        private void OnCommandResult(string callbackId, PluginResult result)
        {
            #region  args checking
            
            if (result == null)
            {
                Debug.WriteLine("OnCommandResult missing result argument");
                return;
            }

            if (String.IsNullOrEmpty(callbackId))
            {
                Debug.WriteLine("OnCommandResult missing callbackId argument");
                return;
            }

            #endregion

            string status = ((int)result.Result).ToString();
            string jsonResult = result.ToJSONString();

            ScriptCallback scriptCallback = null;

            if (String.IsNullOrEmpty(result.Cast))
            {
                scriptCallback = new ScriptCallback("PhoneGapCommandResult", new string[] { status, callbackId, jsonResult });
            }
            else
            {
                scriptCallback = new ScriptCallback("PhoneGapCommandResult", new string[] { status, callbackId, jsonResult, result.Cast });
            }

            this.InvokeScriptCallback(scriptCallback);

        }

        /// <summary>
        /// Executes client java script
        /// </summary>
        /// <param name="script">Script to execute on client side</param>
        private void InvokeScriptCallback(ScriptCallback script)
        {
            if (script == null)
            {
                throw new ArgumentNullException("script");
            }

            if (String.IsNullOrEmpty(script.ScriptName))
            {
                throw new ArgumentNullException("ScriptName");
            }

            this.webBrowser.Dispatcher.BeginInvoke((ThreadStart)delegate()
            {
                try
                {
                    this.webBrowser.InvokeScript(script.ScriptName, script.Args);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Exception in InvokeScriptCallback :: " + ex.Message);
                }
            });
        }

    }
}