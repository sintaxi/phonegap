package com.phonegap.plugins;

import com.phonegap.api.PluginResult;

import org.json.me.JSONArray;
import org.json.me.JSONException;

public class ExampleAction {

    /**
     * Execute an example action.
     *
     * The action will return the first argument back to JavaScript.
     *
     * @param args A JSONArray of arguments provided to the action.
     * @return     A CommandResult object with the success or failure
     *             state for finding the state of the network.
     */
    public static PluginResult execute(JSONArray args) {
        String value = "";

        try {
            value = args.getString(0);
        }
        catch(JSONException e) {
            value = "No value given.";
        }

        return new PluginResult(PluginResult.Status.OK, value);
    }
}
