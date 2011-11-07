/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
 * Copyright (c) 2011, Jesse MacFadyen.
 */

using System;
using System.Reflection;
using Microsoft.Phone.Shell;

namespace WP7GapClassLib.PhoneGap.Commands
{
    public abstract class BaseCommand : IDisposable
    {
        /*
         *  All commands + plugins must extend BaseCommand, because they are dealt with as BaseCommands in PGView.xaml.cs
         *  
         **/

        public event EventHandler<PluginResult> OnCommandResult;

        public event EventHandler<ScriptCallback> OnCustomScript;

        public BaseCommand()
        {
                PhoneApplicationService service = PhoneApplicationService.Current;
                service.Activated += this.OnResume;                
                service.Deactivated += this.OnPause;                
        }

        /*
         *  InvokeMethodNamed will call the named method of a BaseCommand subclass if it exists and pass the variable arguments list along.
         **/

        public object InvokeMethodNamed(string methodName, params object[] args)
        {
            MethodInfo mInfo = this.GetType().GetMethod(methodName);

            if (mInfo != null)
            {
                // every function handles DispatchCommandResult by itself
                return mInfo.Invoke(this, args);
            }

            // actually methodName could refer to a property
            if (args == null || args.Length == 0 ||
               (args.Length == 1 && "undefined".Equals(args[0])))
            {
                PropertyInfo pInfo = this.GetType().GetProperty(methodName);
                if (pInfo != null)
                {
                    
                    object res = pInfo.GetValue(this , null);

                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, res));
                    
                    return res;
                }
            }

            throw new MissingMethodException(methodName);            

        }


        public void InvokeCustomScript(ScriptCallback script)
        {
            if (this.OnCustomScript != null)
            {
                this.OnCustomScript(this, script);               
            }
        }

        public void DispatchCommandResult()
        {
            this.DispatchCommandResult(new PluginResult(PluginResult.Status.NO_RESULT));
        }

        public void DispatchCommandResult(PluginResult result)
        {
            if (this.OnCommandResult != null)
            {
                this.OnCommandResult(this, result);

                if (!result.KeepCallback)
                {
                    this.Dispose();
                }

            }
        }

        /// <summary>
        /// Occurs when the application is being deactivated.
        /// </summary>        
        public virtual void OnPause(object sender, DeactivatedEventArgs e)
        {
        }

        /// <summary>
        /// Occurs when the application is being made active after previously being put
        /// into a dormant state or tombstoned.
        /// </summary>        
        public virtual void OnResume(object sender, Microsoft.Phone.Shell.ActivatedEventArgs e)
        {
        }
        
        public void Dispose()
        {
            PhoneApplicationService service = PhoneApplicationService.Current;
            service.Activated -= this.OnResume;
            service.Deactivated -= this.OnPause;
            this.OnCommandResult = null;
        }
    }



}
