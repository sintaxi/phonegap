/**
 * This class provides access to device Compass data.
 * @constructor
 */
function Compass() {
    /**
     * The last known Compass position.
     */
  this.uuid = null;
};

/**
 * Asynchronously aquires the current heading.
 * @param {Function} successCallback The function to call when the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {PositionOptions} options The options for getting the heading data
 * such as timeout.
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
  PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Compass", "getCurrentHeading", options);
};

/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) {
  this.uuid = PhoneGap.createUUID();
  PhoneGap.exec(successCallback, errorCallback, "com.phonegap.Compass", "watchHeading", [this.uuid, options.frequency || 3000]);
  return this.uuid;
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(watchId) {
    if(this.uuid == watchId) {
      PhoneGap.exec(null, null, "com.phonegap.Compass", "clearWatch", [this.uuid]);
      this.uuid = null;
    } else {
      debugPrint('no clear watch');
    }
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.compass == "undefined") navigator.compass = new Compass();
});
