/*
 * This class provides access to notifications on the device.
 */
function Notification() {

    };

/*
 * adds a dashboard to the WebOS app
 * @param {String} url
 * @param {String} html
 * Example:
 *		navigator.notification.newDashboard("dashboard.html");
 */
Notification.prototype.newDashboard = function(url, html) {
    var win = window.open(url, "_blank", "attributes={\"window\":\"dashboard\"}");
    html && win.document.write(html);
    win.PalmSystem.stageReady();
};

/*
 * Displays a banner notification. If specified, will send your 'response' object as data via the 'palmsystem' DOM event.
 * If no 'icon' filename is specified, will use a small version of your application icon.
 * @param {String} message
 * @param {Object} response
 * @param {String} icon 
 * @param {String} soundClass class of the sound; supported classes are: "ringtones", "alerts", "alarm", "calendar", "notification"
 * @param {String} soundFile partial or full path to the sound file
 * @param {String} soundDurationMs of sound in ms
 * Example:
 *		navigator.notification.showBanner('test message');
 */
Notification.prototype.showBanner = function(message, response, icon, soundClass, soundFile, soundDurationMs) {
    var response = response || {
        banner: true
    };
    PalmSystem.addBannerMessage(message, JSON.stringify(response), icon, soundClass, soundFile, soundDurationMs);
};

/**
 * Remove a banner from the banner area. The category parameter defaults to 'banner'. Will not remove
 * messages that are already displayed.
 * @param {String} category 
		Value defined by the application and usually same one used in {@link showBanner}. 
		It is used if you have more than one kind of banner message. 
 */
Notification.prototype.removeBannerMessage = function(category) {
    var bannerKey = category || 'banner';
    var bannerId = this.banners.get(bannerKey);
    if (bannerId) {
        try {
            PalmSystem.removeBannerMessage(bannerId);
        } catch(removeBannerException) {
            window.debug.error(removeBannerException.toString());
        }
    }
};

/*
 * Remove all pending banner messages from the banner area. Will not remove messages that are already displayed.
 */
Notification.prototype.clearBannerMessage = function() {
    PalmSystem.clearBannerMessage();
};

/*
 * This function vibrates the device
 * @param {number} duration The duration in ms to vibrate for.
 * @param {number} intensity The intensity of the vibration
 */
Notification.prototype.vibrate = function(duration, intensity) {
    //the intensity for palm is inverted; 0=high intensity, 100=low intensity
    //this is opposite from our api, so we invert
    if (isNaN(intensity) || intensity > 100 || intensity <= 0)
    intensity = 0;
    else
    intensity = 100 - intensity;

    // if the app id does not have the namespace "com.palm.", an error will be thrown here
    //this.vibhandle = new Mojo.Service.Request("palm://com.palm.vibrate", {
    this.vibhandle = navigator.service.Request("palm://com.palm.vibrate", {
        method: 'vibrate',
        parameters: {
            'period': intensity,
            'duration': duration
        }
    },
    false);
};

/* 
 * Plays the specified sound
 * @param {String} soundClass class of the sound; supported classes are: "ringtones", "alerts", "alarm", "calendar", "notification"
 * @param {String} soundFile partial or full path to the sound file
 * @param {String} soundDurationMs of sound in ms
 */
Notification.prototype.beep = function(soundClass, soundFile, soundDurationMs) {
    PalmSystem.playSoundNotification(soundClass, soundFile, soundDurationMs);
};

/*
 * displays a notification
 * @param {String} message
 * @param {Object} response
 * @param {String} icon
 */
Notification.prototype.alert = function(message, response, icon) {
    var response = response || {
        banner: true
    };
    navigator.notification.showBanner(message, response, icon);
};

if (typeof navigator.notification == 'undefined') {
    navigator.notification = new Notification();
    alert = navigator.notification.alert;
}

