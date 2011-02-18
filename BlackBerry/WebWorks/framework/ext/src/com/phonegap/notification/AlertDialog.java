/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.notification;

import com.phonegap.ui.SpacerField;

import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.FieldChangeListener;
import net.rim.device.api.ui.component.ButtonField;
import net.rim.device.api.ui.component.LabelField;
import net.rim.device.api.ui.component.SeparatorField;
import net.rim.device.api.ui.container.PopupScreen;
import net.rim.device.api.ui.container.VerticalFieldManager;

public final class AlertDialog extends PopupScreen implements FieldChangeListener {

    private ButtonField button;

    /**
     * Open a custom alert dialog, with a customizable title and button text.
     * 
     * @param {String} message Message to print in the body of the alert
     * @param {String} title Title of the alert dialog (default: 'Alert')
     * @param {String} buttonLabel Label of the close button (default: 'OK')
     */
    public AlertDialog(String message, String title, String buttonLabel) {

        super(new VerticalFieldManager());

        // title
        add(new LabelField(title));

        // separator
        add(new SeparatorField(SeparatorField.LINE_HORIZONTAL));

        // message
        add(new SpacerField(0, 20));
        add(new LabelField(message, FIELD_HCENTER | FIELD_VCENTER));
        add(new SpacerField(0, 20));

        // button
        button = new ButtonField(buttonLabel, ButtonField.CONSUME_CLICK | FIELD_HCENTER);
        button.setChangeListener(this);
        add(button);
    }

    public void fieldChanged(Field field, int context) {
        if (button == field) {
            close();
        }
    }
}
