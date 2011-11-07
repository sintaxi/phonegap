/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
 */

using System;
using System.IO;
using System.Windows;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Tasks;

namespace WP7GapClassLib.PhoneGap.UI
{
    /// <summary>
    /// Allows an application to launch the Video Recording application. 
    /// Use this to allow users to record video from your application.
    /// </summary>
    public class VideoCaptureTask
    {
        /// <summary>
        /// Represents recorded video returned from a call to the Show method of
        /// a WP7GapClassLib.PhoneGap.Controls.VideoCaptureTask object
        /// </summary>
        public class VideoResult : TaskEventArgs
        {
            /// <summary>
            /// Initializes a new instance of the VideoResult class.
            /// </summary>
            public VideoResult()
            { }

            /// <summary>
            /// Initializes a new instance of the VideoResult class
            /// with the specified Microsoft.Phone.Tasks.TaskResult.
            /// </summary>
            /// <param name="taskResult">Associated Microsoft.Phone.Tasks.TaskResult</param>
            public VideoResult(TaskResult taskResult)
                : base(taskResult)
            { }

            /// <summary>
            ///  Gets the file name of the recorded Video.
            /// </summary>
            public Stream VideoFile { get; internal set; }

            /// <summary>
            /// Gets the stream containing the data for the recorded Video.
            /// </summary>
            public string VideoFileName { get; internal set; }
        }

        /// <summary>
        /// Occurs when a Video recording task is completed.
        /// </summary>
        public event EventHandler<VideoResult> Completed;

        /// <summary>
        /// Shows Video Recording application
        /// </summary>
        public void Show()
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                var root = Application.Current.RootVisual as PhoneApplicationFrame;

                root.Navigated += new System.Windows.Navigation.NavigatedEventHandler(NavigationService_Navigated);

                // dummy parameter is used to always open a fresh version
                root.Navigate(new System.Uri("/WP7GapClassLib;component/PhoneGap/UI/VideoRecorder.xaml?dummy=" + Guid.NewGuid().ToString(), UriKind.Relative));
            });
        }

        /// <summary>
        /// Performs additional configuration of the recording application.
        /// </summary>
        private void NavigationService_Navigated(object sender, System.Windows.Navigation.NavigationEventArgs e)
        {
            if (!(e.Content is VideoRecorder)) return;

            (Application.Current.RootVisual as PhoneApplicationFrame).Navigated -= NavigationService_Navigated;

            VideoRecorder VideoRecorder = (VideoRecorder)e.Content;

            if (VideoRecorder != null)
            {
                VideoRecorder.Completed += this.Completed;
            }
            else if (this.Completed != null)
            {
                this.Completed(this, new VideoResult(TaskResult.Cancel));
            }
        }

    }
}
