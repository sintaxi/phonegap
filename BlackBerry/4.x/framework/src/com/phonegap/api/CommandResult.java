package com.phonegap.api;

import org.json.me.JSONObject;

public class CommandResult {
	private final int status;
	private final String message;
	
	public CommandResult(Status status) {
		this.status = status.ordinal();
		this.message = CommandResult.StatusMessages[this.status];
	}
	
	public CommandResult(Status status, String message) {
		this.status = status.ordinal();
		this.message = "'" + message + "'";
	}

	public CommandResult(Status status, JSONObject message) {
		this.status = status.ordinal();
		this.message = message.toString();
	}
	
	public int getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}
	
	public String getJSONString() {
		return "{ status: " + this.getStatus() + ", message: " + this.getMessage() + " }";
	}
	
	public String toSuccessCallbackString(String callbackId) {
		return "javascript:PhoneGap.callbackSuccess('"+callbackId+"', " + this.getJSONString() + " );";
	}
	
	public String toErrorCallbackString(String callbackId) {
		return "javascript:PhoneGap.callbackError('"+callbackId+"', " + this.getJSONString()+ ");";
	}

	public String toErrorString() {
		return "alert('general error');";
	}
	
	public static class Status {
		private int val;
		private Status(int val) {
			this.val = val;
		}

		public int ordinal() {
			return this.val;
		}

		public static final Status OK = new Status(0);
		public static final Status CLASS_NOT_FOUND_EXCEPTION = new Status(1);
		public static final Status ILLEGAL_ACCESS_EXCEPTION = new Status(2);
		public static final Status INSTANTIATION_EXCEPTION = new Status(3);
		public static final Status MALFORMED_URL_EXCEPTION = new Status(4);
		public static final Status IO_EXCEPTION = new Status(5);
		public static final Status INVALID_ACTION = new Status(6);
		public static final Status JSON_EXCEPTION = new Status(7);
	}
	
	public static String[] StatusMessages = new String[] {
		"OK",
		"Class not found",
		"Illegal access",
		"Instantiation error",
		"Malformed url",
		"IO error",
		"Invalid action",
		"JSON error"
	};
}
