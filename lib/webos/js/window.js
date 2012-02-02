function Window() {

    };

/*
 * This is a thin wrapper for 'window.open()' which optionally sets document contents to 'html', and calls 'PalmSystem.stageReady()'
 * on your new card. Note that this new card will not come with your framework (if any) or anything for that matter.
 * @param {String} url
 * @param {String} html
 * Example:
 *		navigator.window.newCard('about:blank', '<html><body>Hello again!</body></html>');
 */
Window.prototype.newCard = function(url, html) {
    var win = window.open(url || "");
    if (html)
        win.document.write(html);
    win.PalmSystem.stageReady();
};

/*
 * Enable or disable full screen display (full screen removes the app menu bar and the rounded corners of the screen).
 * @param {Boolean} state
 * Example:
 *		navigator.window.setFullScreen(true);
 */
Window.prototype.setFullScreen = function(state) {
    // valid state values are: true or false
    PalmSystem.enableFullScreenMode(state);
};

/*
 * used to set the window properties of the WebOS app
 * @param {Object} props
 * Example:
 * 		private method used by other member functions - ideally we shouldn't call this method
 */
Window.prototype.setWindowProperties = function(props) {
    if (typeof props === 'object')
        navigator.windowProperties = props;

    PalmSystem.setWindowProperties(props || this.windowProperties);
};

/*
 * Enable or disable screen timeout. When enabled, the device screen will not dim. This is useful for navigation, clocks or other "dock" apps.
 * @param {Boolean} state
 * Example:
 *		navigator.window.blockScreenTimeout(true);
 */
Window.prototype.blockScreenTimeout = function(state) {
    navigator.windowProperties.blockScreenTimeout = state;
    this.setWindowProperties();
};

/*
 * Sets the lightbar to be a little dimmer for screen locked notifications.
 * @param {Boolean} state
 * Example:
 *		navigator.window.setSubtleLightbar(true);
 */
Window.prototype.setSubtleLightbar = function(state) {
    navigator.windowProperties.setSubtleLightbar = state;
    this.setWindowProperties();
};

if (typeof navigator.window == 'undefined') navigator.window = new Window();

