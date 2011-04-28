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
import com.phonegap.util.Logger;

/**
 * Displays a confirmation dialog with customizable title, message, and button
 * fields.  
 */
public class ConfirmAction {

    private static final String DEFAULT_MESSAGE = "";
    private static final String DEFAULT_TITLE   = "Confirm";
    private static final String DEFAULT_BUTTONS = "OK,Cancel";

    /**
     * Displays a custom confirmation dialog.
     *
     * @param args JSONArray formatted as [ message, title, buttonLabels ]
     *             message:     the message to display in the dialog body (default: "").
     *             title:       the title to display at the top of the dialog (default: "Confirm").
     *             buttonLabel: the button text (default: "OK,Cancel").
     * @return A PluginResult object with index of dialog button pressed (1,2,3...).
     */
    public static PluginResult execute(JSONArray args) {

        PluginResult result = null;

        try {
            String message = DEFAULT_MESSAGE;
            String title = DEFAULT_TITLE;
            String buttonLabels = DEFAULT_BUTTONS;
            if (args.length() > 0 && !args.isNull(0))
                message = args.getString(0);
            if (args.length() > 1 && !args.isNull(1))
                title = args.getString(1);
            if (args.length() > 2 && !args.isNull(2))
                buttonLabels = args.getString(2);

            // construct the dialog
            final ConfirmDialog dialog = new ConfirmDialog(message, title, buttonLabels);
            
            // ask the event dispatch thread to show it
            Runnable runnable = new Runnable() {
                public void run() {
                    UiApplication ui = UiApplication.getUiApplication();
                    ui.pushModalScreen(dialog);
                }
            };
            Logger.log(ConfirmAction.class.getName() + ": showing confirm dialog: '" + title + "'");            
            UiApplication.getUiApplication().invokeAndWait(runnable);

            // add +1 to the button index to match the JavaScript API (which starts at 1)
            int button = dialog.getSelectedValue() + 1;
            result = new PluginResult(PluginResult.Status.OK, Integer.toString(button));
        }
        catch (JSONException e) {
            result = new PluginResult(PluginResult.Status.JSONEXCEPTION, "JSONException: " + e.getMessage());
        }

        return result;
    }    
}
