/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.IsolatedStorage;
using System.Net;
using System.Runtime.Serialization;
using System.Windows;

namespace WP7GapClassLib.PhoneGap.Commands
{
    public class FileTransfer : BaseCommand
    {                
	    /// <summary>
        /// Boundary symbol
	    /// </summary>       
	    private string Boundary =  "----------------------------" + DateTime.Now.Ticks.ToString("x");

        // Error codes
	    public const int FileNotFoundError = 1;
        public const int InvalidUrlError = 2;
        public const int ConnectionError = 3;
        
        /// <summary>
        /// Options for uploading file
        /// </summary>
        [DataContract]
        public class UploadOptions
        {
            /// <summary>
            /// File path to upload
            /// </summary>
            [DataMember(Name = "filePath", IsRequired = true)]
            public string FilePath { get; set; }

            /// <summary>
            /// Server address
            /// </summary>
            [DataMember(Name="server", IsRequired = true)]
            public string Server { get; set; }

            /// <summary>
            /// File key
            /// </summary>
            [DataMember(Name = "fileKey")]
            public string FileKey { get; set; }

            /// <summary>
            /// File name on the server
            /// </summary>
            [DataMember(Name = "fileName")]
            public string FileName { get; set; }

            /// <summary>
            /// File Mime type
            /// </summary>
            [DataMember(Name = "mimeType")]
            public string MimeType { get; set; }


            /// <summary>
            /// Additional options
            /// </summary>
            [DataMember(Name="params")]
            public Dictionary<string,object> Params { get; set; }
 
            /// <summary>
            /// Flag to recognize if we should trust every host (only in debug environments)
            /// </summary>
            [DataMember (Name="debug")]
            public bool Debug { get; set; }

            /// <summary>
			/// Creates options object with default parameters
			/// </summary>
			public UploadOptions()
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
				this.FileKey = "file";
                this.FileName = "image.jpg";
                this.MimeType = "image/jpeg";
			}

        }

        /// <summary>
        /// Uploading response info
        /// </summary>
        [DataContract]
        public class FileUploadResult
        {
            /// <summary>
            /// Amount of sent bytes
            /// </summary>
            [DataMember(Name="bytesSent")]
            public long BytesSent { get; set; }

            /// <summary>
            /// Server response code
            /// </summary>
            [DataMember(Name = "responseCode")]
            public long ResponseCode { get; set; }

            /// <summary>
            /// Server response
            /// </summary>
            [DataMember(Name = "response",EmitDefaultValue = false)]
            public string Response { get; set; }

            /// <summary>
            /// Creates FileUploadResult object with response values
            /// </summary>
            /// <param name="bytesSent">Amount of sent bytes</param>
            /// <param name="responseCode">Server response code</param>
            /// <param name="response">Server response</param>
            public FileUploadResult(long bytesSent, long responseCode, string response)
            {
                this.BytesSent = bytesSent;
                this.ResponseCode = responseCode;
                this.Response = response;
            }
        }

        /// <summary>
        /// Represents transfer error codes for callback
        /// </summary>
        [DataContract]
        public class FileTransferError
        {
            /// <summary>
            /// Error code
            /// </summary>
            [DataMember(Name="code", IsRequired = true)]
            public int Code { get; set; }

            /// <summary>
            /// Creates FileTransferError object
            /// </summary>
            /// <param name="errorCode">Error code</param>
            public FileTransferError(int errorCode)
            {
                this.Code = errorCode;
            }
        }

        /// <summary>
        /// Upload options
        /// </summary>
        private UploadOptions uploadOptions;

        /// <summary>
        /// Bytes sent
        /// </summary>
        private long bytesSent;

        /// <summary>
        /// sends a file to a server
        /// </summary>
        /// <param name="options">Upload options</param>
        public void upload(string options)
        {
            try
            {
                try
                {
                    uploadOptions = JSON.JsonHelper.Deserialize<UploadOptions>(options);
                }
                catch (Exception e)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Uri serverUri;
                try
                {
                    serverUri = new Uri(uploadOptions.Server);
                }
                catch (Exception e)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR,new FileTransferError(InvalidUrlError)));
                    return;
                }
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(serverUri);
                webRequest.ContentType = "multipart/form-data;boundary=" + Boundary;
                webRequest.Method = "POST";
                webRequest.BeginGetRequestStream(WriteCallback, webRequest);      
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, new FileTransferError(ConnectionError)));
            }
        }

        /// <summary>
        /// Read file from Isolated Storage and sends it to server
        /// </summary>
        /// <param name="asynchronousResult"></param>
        private void WriteCallback(IAsyncResult asynchronousResult)
        {
            try
            {
                HttpWebRequest webRequest = (HttpWebRequest)asynchronousResult.AsyncState;
                using (Stream requestStream = (webRequest.EndGetRequestStream(asynchronousResult)))
                {
                    string lineStart = "--";
	                string lineEnd = Environment.NewLine;
                    byte[] boundaryBytes = System.Text.Encoding.UTF8.GetBytes(lineStart + Boundary + lineEnd);
                    string formdataTemplate = "Content-Disposition: form-data; name=\"{0}\"" + lineEnd + lineEnd + "{1}" + lineEnd;

                    if (uploadOptions.Params != null)
                    {
                        Dictionary<string, object> customParams = uploadOptions.Params;
                        foreach (string key in customParams.Keys)
                        {
                            requestStream.Write(boundaryBytes, 0, boundaryBytes.Length);
                            string formItem = string.Format(formdataTemplate, key, customParams[key]);
                            byte[] formItemBytes = System.Text.Encoding.UTF8.GetBytes(formItem);
                            requestStream.Write(formItemBytes, 0, formItemBytes.Length);
                        }
                        requestStream.Write(boundaryBytes, 0, boundaryBytes.Length);
                    }
                    using (IsolatedStorageFile isoFile = IsolatedStorageFile.GetUserStoreForApplication())
                    {
                        if (!isoFile.FileExists(uploadOptions.FilePath))
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, new FileTransferError(FileNotFoundError)));
                            return;
                        }

                        using (FileStream fileStream = new IsolatedStorageFileStream(uploadOptions.FilePath, FileMode.Open, isoFile))
                        {
                            string headerTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"" + lineEnd + "Content-Type: {2}" + lineEnd + lineEnd;
                            string header = string.Format(headerTemplate, uploadOptions.FileKey, uploadOptions.FileName, uploadOptions.MimeType);
                            byte[] headerBytes = System.Text.Encoding.UTF8.GetBytes(header);
                            requestStream.Write(headerBytes, 0, headerBytes.Length);
                            byte[] buffer = new byte[4096];
                            int bytesRead = 0;
                            
                            while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0)
                            {
                                requestStream.Write(buffer, 0, bytesRead);
                                bytesSent += bytesRead;
                            }
                        }
                        byte[] endRequest = System.Text.Encoding.UTF8.GetBytes(lineEnd + lineStart + Boundary + lineStart + lineEnd);
                        requestStream.Write(endRequest, 0, endRequest.Length);
                    }
                }
                webRequest.BeginGetResponse(ReadCallback, webRequest);
            }
            catch(Exception e)
            {
                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, new FileTransferError(ConnectionError)));
                });
            }
        }

        /// <summary>
        /// Reads response into FileUploadResult
        /// </summary>
        /// <param name="asynchronousResult"></param>
        private void ReadCallback(IAsyncResult asynchronousResult)
        {
            try
            {
                HttpWebRequest webRequest = (HttpWebRequest)asynchronousResult.AsyncState;
                using (HttpWebResponse response = (HttpWebResponse)webRequest.EndGetResponse(asynchronousResult))
                {                       
                    using (Stream streamResponse = response.GetResponseStream())
                    {
                        using (StreamReader streamReader = new StreamReader(streamResponse))
                        {
                            string responseString = streamReader.ReadToEnd();
                            Deployment.Current.Dispatcher.BeginInvoke(() => 
                            { 
                                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, new FileUploadResult(bytesSent, (long)response.StatusCode, responseString))); 
                            });                            
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Deployment.Current.Dispatcher.BeginInvoke(() => 
                { 
                    DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, new FileTransferError(ConnectionError)));
                });
            }
        }
    }
}
