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
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Collections.Generic;
using Microsoft.Phone.Tasks;
using System.Runtime.Serialization;
using System.IO;
using System.IO.IsolatedStorage;
using System.Windows.Media.Imaging;
using Microsoft.Phone;

namespace WP7GapClassLib.PhoneGap.Commands
{
    public class Camera : BaseCommand
    {

        /// <summary>
        /// Return base64 encoded string
        /// </summary>
        private const int DATA_URL = 0;

        /// <summary>
        /// Return file uri
        /// </summary>
        private const int FILE_URI = 1;

        /// <summary>
        /// Choose image from picture library
        /// </summary>
        private const int PHOTOLIBRARY = 0;

        /// <summary>
        /// Take picture from camera
        /// </summary>

        private const int CAMERA = 1;

        /// <summary>
        /// Choose image from picture library
        /// </summary>
        private const int SAVEDPHOTOALBUM = 2;

        /// <summary>
        /// Take a picture of type JPEG
        /// </summary>
        private const int JPEG = 0;

        /// <summary>
        /// Take a picture of type PNG
        /// </summary>
        private const int PNG = 1;

        /// <summary>
        /// Desired width of the image
        /// </summary>
        private int targetWidth;

        /// <summary>
        /// desired height of the image
        /// </summary>    
        private int targetHeight;


        /// <summary>
        /// Folder to store captured images
        /// </summary>
        private const string isoFolder = "CapturedImagesCache";

        /// <summary>
        /// Represents captureImage action options.
        /// </summary>
        [DataContract]
        public class CameraOptions
        {
            /// <summary>
            /// Source to getPicture from.
            /// </summary>
            [DataMember(IsRequired = false, Name = "sourceType")]
            public int PictureSourceType { get; set; }

            /// <summary>
            /// Format of image that returned from getPicture.
            /// </summary>
            [DataMember(IsRequired = false, Name = "destinationType")]
            public int DestinationType { get; set; }

            /// <summary>
            /// Quality of saved image
            /// </summary>
            [DataMember(IsRequired = false, Name = "quality")]
            public int Quality { get; set; }


            /// <summary>
            /// Height in pixels to scale image
            /// </summary>
            [DataMember(IsRequired = false, Name = "targetHeight")]
            public int TargetHeight { get; set; }

            /// <summary>
            /// Width in pixels to scale image
            /// </summary>
            [DataMember(IsRequired = false, Name = "targetWidth")]
            public int TargetWidth { get; set; }

            /// <summary>
            /// Creates options object with default parameters
            /// </summary>
            public CameraOptions()
            {
                this.SetDefaultValues(new StreamingContext());
            }

            /// <summary>
            /// Initializes default values for class fields.
            /// Implemented in separate method because default constructor is not invoked during deserialization.
            /// </summary>
            /// <param name="context"></param>
            [OnDeserializing()]
            public void SetDefaultValues(StreamingContext context)
            {
                PictureSourceType = CAMERA;
                DestinationType = DATA_URL;
                Quality = 80;
                TargetHeight = -1;
                TargetWidth = -1;
            }

        }

        /// <summary>
        /// Used to open photo library
        /// </summary>
        PhotoChooserTask photoChooserTask;

        /// <summary>
        /// Used to open camera application
        /// </summary>
        CameraCaptureTask cameraTask;

        /// <summary>
        /// Camera options
        /// </summary>
        CameraOptions cameraOptions;

        public void getPicture(string options)
        {
            try
            {
                this.cameraOptions = String.IsNullOrEmpty(options) ?
                        new CameraOptions() : JSON.JsonHelper.Deserialize<CameraOptions>(options);
            }
            catch (Exception ex)
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION, ex.Message));
                return;
            }

            //TODO Check if all the options are acceptable


            if (cameraOptions.PictureSourceType == CAMERA)
            {
                cameraTask = new CameraCaptureTask();
                cameraTask.Completed += onTaskCompleted;
                cameraTask.Show();
            }
            else
            {
                if ((cameraOptions.PictureSourceType == PHOTOLIBRARY) || (cameraOptions.PictureSourceType == SAVEDPHOTOALBUM))
                {
                    photoChooserTask = new PhotoChooserTask();
                    photoChooserTask.Completed += onTaskCompleted;
                    photoChooserTask.Show();
                }
                else
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.NO_RESULT));
                }
            }

        }

        public void onTaskCompleted(object sender, PhotoResult e)
        {
            if (e.Error != null)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR));
                return;
            }

            switch (e.TaskResult)
            {
                case TaskResult.OK:
                    try
                    {
                        string imagePathOrContent = string.Empty;

                        if (cameraOptions.DestinationType == FILE_URI)
                        {
                            WriteableBitmap image = PictureDecoder.DecodeJpeg(e.ChosenPhoto);
                            imagePathOrContent = this.SaveImageToLocalStorage(image, Path.GetFileName(e.OriginalFileName));
                        }
                        else if (cameraOptions.DestinationType == DATA_URL)
                        {
                            imagePathOrContent = this.GetImageContent(e.ChosenPhoto);

                        }
                        else
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Incorrec option: destinationType"));
                            return;
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK, imagePathOrContent));

                    }
                    catch (Exception ex)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Error retrieving image."));
                    }
                    break;

                case TaskResult.Cancel:
                    DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Selection cancelled."));
                    break;

                default:
                    DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Selection did not complete!"));
                    break;
            }
        }


        /// <summary>
        /// Returns image content in a form of base64 string
        /// </summary>
        /// <param name="stream">Image stream</param>
        /// <returns>Base64 representation of the image</returns>
        private string GetImageContent(Stream stream)
        {
            int streamLength = (int)stream.Length;
            byte[] fileData = new byte[streamLength + 1];
            stream.Read(fileData, 0, streamLength);
            stream.Close();

            return Convert.ToBase64String(fileData);
        }


        /// <summary>
        /// Saves captured image in isolated storage
        /// </summary>
        /// <param name="imageFileName">image file name</param>
        /// <returns>Image path</returns>
        private string SaveImageToLocalStorage(WriteableBitmap image, string imageFileName)
        {

            if (image == null)
            {
                throw new ArgumentNullException("imageBytes");
            }
            try
            {


                var isoFile = IsolatedStorageFile.GetUserStoreForApplication();

                if (!isoFile.DirectoryExists(isoFolder))
                {
                    isoFile.CreateDirectory(isoFolder);
                }

                string filePath = System.IO.Path.Combine("/" + isoFolder + "/", imageFileName);

                using (var stream = isoFile.CreateFile(filePath))
                {
                    // resize image if Height and Width defined via options 
                    if (cameraOptions.TargetHeight > 0 && cameraOptions.TargetWidth > 0)
                    {
                        image.SaveJpeg(stream, cameraOptions.TargetWidth, cameraOptions.TargetHeight, 0, cameraOptions.Quality);
                    }
                    else
                    {
                        image.SaveJpeg(stream, image.PixelWidth, image.PixelHeight, 0, cameraOptions.Quality);
                    }
                }

                return new Uri(filePath, UriKind.Relative).ToString();
            }
            catch (Exception e)
            {
                //TODO: log or do something else
                throw;
            }
        }

    }
}
