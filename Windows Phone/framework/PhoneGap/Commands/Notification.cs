/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Jesse MacFadyen.
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

using Microsoft.Devices;
using Microsoft.Phone.Scheduler;
using System.Runtime.Serialization;
using System.Threading;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;
using System.Windows.Resources;
using Microsoft.Phone.Shell;
using Microsoft.Phone.Controls;

namespace WP7GapClassLib.PhoneGap.Commands
{
    public class Notification : BaseCommand
    {
        static ProgressBar progressBar = null;
        const int DEFAULT_DURATION = 5;

        // alert, confirm, blink, vibrate, beep
        // blink api - doesn't look like there is an equivalent api we can use...
        // vibrate api - http://msdn.microsoft.com/en-us/library/microsoft.devices.vibratecontroller(v=VS.92).aspx
        // beep api - can probably use: http://msdn.microsoft.com/en-us/library/microsoft.phone.scheduler.alarm(v=VS.92).aspx
        //          - examples of alarm class http://mkdot.net/blogs/filip/archive/2011/06/06/windows-phone-multitasking-part-2-2.aspx

        //MessageBoxResult res = MessageBox.Show("Could not call script: " + ex.Message, "caption", MessageBoxButton.OKCancel);

        [DataContract]
        public class AlertOptions
        {
            [OnDeserializing]
            public void OnDeserializing(StreamingContext context)
            {
                // set defaults
                this.message = "message";
                this.title = "Alert";
                this.buttonLabel = "ok";
            }

            /// <summary>
            /// message to display in the alert box
            /// </summary>
            [DataMember]
            public string message;

            /// <summary>
            /// title displayed on the alert window
            /// </summary>
            [DataMember]
            public string title;

            /// <summary>
            /// text to display on the button
            /// </summary>
            [DataMember]
            public string buttonLabel;
        }

        public void alert(string options)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                AlertOptions alertOpts = JSON.JsonHelper.Deserialize<AlertOptions>(options);
                MessageBoxResult res = MessageBox.Show(alertOpts.message, alertOpts.title,MessageBoxButton.OK);

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK,(int)res));
            });
        }

        public void confirm(string options)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                AlertOptions alertOpts = JSON.JsonHelper.Deserialize<AlertOptions>(options);

                MessageBoxResult res = MessageBox.Show(alertOpts.message, alertOpts.title, MessageBoxButton.OKCancel);
                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, (int)res));
            });
        }

        public void beep(string count)
        {
            int times = int.Parse(count);

            StreamResourceInfo sri = Application.GetResourceStream(new Uri("/WP7GapClassLib;component/resources/notification-beep.wav", UriKind.Relative));
            if (sri != null)
            {
                SoundEffect effect = SoundEffect.FromStream(sri.Stream);
                SoundEffectInstance inst = effect.CreateInstance();
                ThreadPool.QueueUserWorkItem((o) =>
                {
                    // cannot interact with UI !!
                    do
                    {
                        inst.Play();
                        Thread.Sleep(effect.Duration + TimeSpan.FromMilliseconds(100));
                    }
                    while (--times > 0);

               });

            }
         
            // TODO: may need a listener to trigger DispatchCommandResult after the alarm has finished executing...
            DispatchCommandResult();
        }

        // Display an inderminate progress indicator
        public void activityStart(string unused)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                var t1 = Application.Current.RootVisual;
                PhoneApplicationFrame frame =  t1 as PhoneApplicationFrame;

                var temp1 = frame.FindName("LayoutRoot");

                if (frame != null)
                {
                    PhoneApplicationPage page = frame.Content as PhoneApplicationPage;

                    if (page != null)
                    {
                        var temp = page.FindName("LayoutRoot");
                        Grid grid = temp as Grid;
                        if (grid != null)
                        {
                            if (progressBar != null)
                            {
                                grid.Children.Remove(progressBar);
                            }
                            progressBar = new ProgressBar();
                            progressBar.IsIndeterminate = true;
                            progressBar.IsEnabled = true;

                            grid.Children.Add(progressBar);
                        }
                    }
                }
            });
        }


        // Remove our inderminate progress indicator
        public void activityStop(string unused)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                if (progressBar != null)
                {
                    progressBar.IsEnabled = false;
                    PhoneApplicationFrame frame = Application.Current.RootVisual as PhoneApplicationFrame;
                    if (frame != null)
                    {
                        PhoneApplicationPage page = frame.Content as PhoneApplicationPage;
                        if (page != null)
                        {
                            Grid grid = page.FindName("LayoutRoot") as Grid;
                            if (grid != null)
                            {
                                grid.Children.Remove(progressBar);
                            }
                        }
                    }
                    progressBar = null;
                }
            });
        }

        public void vibrate(string vibrateDuration)
        {
            int msecs = 200; // set default

            try
            {
                msecs = int.Parse(vibrateDuration);
                if (msecs < 1)
                {
                    msecs = 1;
                }
            }
            catch (FormatException)
            {

            }

            VibrateController.Default.Start(TimeSpan.FromMilliseconds(msecs));

            // TODO: may need to add listener to trigger DispatchCommandResult when the vibration ends...
            DispatchCommandResult();
        }
    }
}
