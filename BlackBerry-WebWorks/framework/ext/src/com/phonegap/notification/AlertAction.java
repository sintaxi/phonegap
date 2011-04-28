/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.notification;

import net.rim.device.api.ui.UiApplication;

import com.phonegap.api.PluginResult;
import com.phonegap.json4j.JSONArray;
import com.phonegap.json4j.JSONException;

/**
 * Alert Action
 *
 * Displays and interacts with a dialog box.
 *
 */
public class AlertAction {

    private static final String DEFAULT_MESSAGE = "";
    private static final String DEFAULT_TITLE   = "Alert";
    private static final String DEFAULT_BUTTON  = "OK";

    /**
     * Displays a custom alert.
     *
     * @param args JSONArray formatted as [ message, title, buttonLabel ]
     *             message:     the message to display in the dialog body (default: "").
     *             title:       the title to display at the top of the dialog (default: "Alert").
     *             buttonLabel: the button text (default: "OK").
     * @return A PluginResult object with the success or failure state for displaying the dialog box.
     */
    public static PluginResult execute(JSONArray args) {

        PluginResult result = null;

        try {
            String message = DEFAULT_MESSAGE;
            String title = DEFAULT_TITLE;
            String buttonLabel = DEFAULT_BUTTON;
            if (args.length() > 0 && !args.isNull(0))
                message = args.getString(0);
            if (args.length() > 1 && !args.isNull(1))
                title = args.getString(1);
            if (args.length() > 2 && !args.isNull(2))
                buttonLabel = args.getString(2);

            // construct the dialog
            final AlertDialog dialog = new AlertDialog(message, title, buttonLabel);

            // ask the event dispatch thread to show dialog
            Runnable runnable = new Runnable() {
                public void run() {
                    UiApplication ui = UiApplication.getUiApplication();
                    ui.pushModalScreen(dialog);
                }
            };
            UiApplication.getUiApplication().invokeAndWait(runnable);

            result = new PluginResult(PluginResult.Status.OK);
        }
        catch (JSONException e) {
            result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
        }

        return result;
    }
}