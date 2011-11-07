/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
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
using System.Runtime.Serialization.Json;
using System.IO;
using System.Collections.Generic;
using System.Text;

namespace WP7GapClassLib.PhoneGap.JSON
{
    /// <summary>
    /// Provides JSON serialization/deserialization functionality.
    /// </summary>
    public static class JsonHelper
    {
        /// <summary>
        /// Serializes object to JSON string representation
        /// </summary>
        /// <param name="obj">object to serialize</param>
        /// <returns>JSON representation of the object. Returns 'null' string for null passed as argument</returns>
        public static string Serialize(object obj)
        {
            if (obj == null)
            {
                return "null";
            }

            DataContractJsonSerializer ser = new DataContractJsonSerializer(obj.GetType());

            MemoryStream ms = new MemoryStream();
            ser.WriteObject(ms, obj);

            ms.Position = 0;
            
            string json = String.Empty;

            using(StreamReader sr = new StreamReader(ms))
            {
                json = sr.ReadToEnd();
            }

            ms.Close();

            return json;

        }

        /// <summary>
        /// Parses json string to object instance
        /// </summary>
        /// <typeparam name="T">type of the object</typeparam>
        /// <param name="json">json string representation of the object</param>
        /// <returns>Deserialized object instance</returns>
        public static T Deserialize<T>(string json)
        {
           DataContractJsonSerializer deserializer = new DataContractJsonSerializer(typeof(T));

           using (MemoryStream mem = new MemoryStream(Encoding.UTF8.GetBytes(json)))
           {
               return (T)deserializer.ReadObject(mem);
           }

        }
    }
}
