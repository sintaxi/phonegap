/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
 */

using System.Collections.Generic;
using System.IO;

namespace WP7GapClassLib.PhoneGap.Commands
{
    /// <summary>
    /// Represents file extension to mime type mapper.
    /// </summary>
    public static class MimeTypeMapper
    {
        /// <summary>
        /// For unknown type it is recommended to use 'application/octet-stream'
        /// http://stackoverflow.com/questions/1176022/unknown-file-type-mime
        /// </summary>
        private static string DefaultMimeType = "application/octet-stream";
        
        /// <summary>
        /// Stores mime type for all necessary extension
        /// </summary>
        private static readonly Dictionary<string, string> MIMETypesDictionary = new Dictionary<string, string>
                                                                             {                                                                                
                                                                                 {"avi", "video/x-msvideo"},
                                                                                 {"bmp", "image/bmp"},                                                                                                                                                                
                                                                                 {"gif", "image/gif"},                                                                                                                                                               
                                                                                 {"jpe", "image/jpeg"},
                                                                                 {"jpeg", "image/jpeg"},
                                                                                 {"jpg", "image/jpeg"},                                                                                                                                                             
                                                                                 {"mov", "video/quicktime"},
                                                                                 {"mp2", "audio/mpeg"},
                                                                                 {"mp3", "audio/mpeg"},
                                                                                 {"mp4", "video/mp4"},
                                                                                 {"mpe", "video/mpeg"},
                                                                                 {"mpeg", "video/mpeg"},
                                                                                 {"mpg", "video/mpeg"},
                                                                                 {"mpga", "audio/mpeg"},                                                                                
                                                                                 {"pbm", "image/x-portable-bitmap"},
                                                                                 {"pcm", "audio/x-pcm"},
                                                                                 {"pct", "image/pict"},
                                                                                 {"pgm", "image/x-portable-graymap"},
                                                                                 {"pic", "image/pict"},
                                                                                 {"pict", "image/pict"},
                                                                                 {"png", "image/png"},
                                                                                 {"pnm", "image/x-portable-anymap"},
                                                                                 {"pnt", "image/x-macpaint"},
                                                                                 {"pntg", "image/x-macpaint"},
                                                                                 {"ppm", "image/x-portable-pixmap"},
                                                                                 {"qt", "video/quicktime"},
                                                                                 {"ra", "audio/x-pn-realaudio"},
                                                                                 {"ram", "audio/x-pn-realaudio"},
                                                                                 {"ras", "image/x-cmu-raster"},
                                                                                 {"rgb", "image/x-rgb"},
                                                                                 {"snd", "audio/basic"},
                                                                                 {"txt", "text/plain"},
                                                                                 {"tif", "image/tiff"},
                                                                                 {"tiff", "image/tiff"},
                                                                                 {"wav", "audio/x-wav"},
                                                                                 {"wbmp", "image/vnd.wap.wbmp"},

                                                                             };
        /// <summary>
        /// Gets mime type by file extension
        /// </summary>
        /// <param name="fileName">file name to extract extension</param>
        /// <returns>mime type</returns>
        public static string GetMimeType(string fileName)
        {
            string ext = Path.GetExtension(fileName);

            // invalid extension
            if (string.IsNullOrEmpty(ext) || !ext.StartsWith("."))
            {
                return DefaultMimeType;
            }

            ext = ext.Remove(0, 1);

            if (MIMETypesDictionary.ContainsKey(ext))
            {
                return MIMETypesDictionary[ext];
            }

            return DefaultMimeType;
        }
    }
}
