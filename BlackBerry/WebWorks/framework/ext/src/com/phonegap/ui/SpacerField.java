/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.ui;

import net.rim.device.api.ui.Field;
import net.rim.device.api.ui.Graphics;

/**
 * Provides an empty spacer field that can be used to provide custom spacing 
 * between UI fields within a UI screen.
 */
public class SpacerField extends Field {

    int width;      // spacer width in pixels
    int height;     // space height in pixels

    /**
     * Constructor.
     * @param width Width of the spacer in pixels.
     * @param height Height of the spacer in pixels.
     */
    public SpacerField(int width, int height) {
        super(NON_FOCUSABLE);
        this.width = width;
        this.height = height;
    }

    /**
     * Sets the extent to the custom width and height of this spacer.
     */
    protected void layout(int width, int height) {
        this.setExtent(this.width, this.height);
    }

    /**
     * Paints the field.
     */
    protected void paint(Graphics graphics) {
        // supposed to be empty. don't paint anything.
    }

    /**
     * Returns the custom width of this spacer as the preferred field width.
     */
    public int getPreferredWidth() {
        return this.width;
    }

    /**
     * Returns the custom height of this spacer as the preferred field height.
     */
    public int getPreferredHeight() {
        return this.height;
    }
}
