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
using System.Text;
using System.Diagnostics;

namespace WP7GapClassLib.PhoneGap
{
	/// <summary>
	/// Represents command execution result
	/// </summary>
	public class PluginResult : EventArgs
	{
		/// <summary>
		/// Predefined resultant messages
		/// </summary>
		public static string[] StatusMessages = new string[] 
		{
			"No result",
			"OK",
			"Class not found",
			"Illegal access",
			"Instantiation error",
			"Malformed url",
			"IO error",
			"Invalid action",
			"JSON error",
			"Error"
		};

		/// <summary>
		/// Possible command results status codes
		/// </summary>
		public enum Status :int
		{
			NO_RESULT = 0,
			OK,
			CLASS_NOT_FOUND_EXCEPTION,
			ILLEGAL_ACCESS_EXCEPTION,
			INSTANTIATION_EXCEPTION,
			MALFORMED_URL_EXCEPTION,
			IO_EXCEPTION,
			INVALID_ACTION,
			JSON_EXCEPTION,
			ERROR
		};

		public Status Result {get; private set;}
		public string Message {get; private set;}
		public String Cast { get; private set; }

		public bool KeepCallback { get; set; }        

		/// <summary>
		/// Whether command succeded or not
		/// </summary>
		public bool IsSuccess
		{
			get
			{
				return this.Result == Status.OK || this.Result == Status.NO_RESULT;
			}
		}

		/// <summary>
		/// Creates new instance of the PluginResult class.
		/// </summary>
		/// <param name="status">Execution result</param>
		public PluginResult(Status status)
			: this(status, PluginResult.StatusMessages[(int)status])
		{
		}

		/// <summary>
		/// Creates new instance of the PluginResult class.
		/// </summary>
		/// <param name="status">Execution result</param>
		/// <param name="message">The message</param>
		public PluginResult(Status status, object message)
			: this(status, message, null)
		{
		}

		/// <summary>
		/// Creates new instance of the PluginResult class.
		/// </summary>
		/// <param name="status">Execution result</param>
		/// <param name="message">The message</param>
		/// <param name="cast">The cast parameter</param>
		public PluginResult(Status status, object message, string cast)
		{
			this.Result = status;
			this.Message = JSON.JsonHelper.Serialize(message);
			this.Cast = cast;
		}

		public string ToJSONString()
		{
            string res = String.Format("\"status\":{0},\"message\":{1},\"keepCallback\":{2}", 
                (int)this.Result, 
                this.Message, 
                this.KeepCallback.ToString().ToLower() );

            res = "{" + res + "}";
            //Debug.WriteLine("ToJSONString returning :: " + res);
            return res;

		}

		public string ToCallbackString(string callbackId, string successCallback, string errorCallback)
		{
			//return String.Format("{0}('{1}',{2});", successCallback, callbackId, this.ToJSONString());

			if (this.IsSuccess)
			{
				StringBuilder buf = new StringBuilder("");
				if (this.Cast != null)
				{
					buf.Append("var temp = " + this.Cast + "(" + this.ToJSONString() + ");\n");
					buf.Append(String.Format("{0}('{1}',temp);", successCallback, callbackId));
				}
				else
				{
					buf.Append(String.Format("{0}('{1}',{2});", successCallback, callbackId, this.ToJSONString()));
				}
				return buf.ToString();
			}
			else
			{
				return String.Format("{0}('{1}',{2});", errorCallback, callbackId, this.ToJSONString());
			}
		}

		public override String ToString()
		{
			return this.ToJSONString();
		}

	}
	
}
