/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
  this.platform = null;
  this.version  = null;
  this.name     = null;
  this.uuid     = null;
};

PhoneGap.addConstructor(function() {
  navigator.device = window.device = window.device || new Device();
  PhoneGap.onPhoneGapInfoReady.fire();
});
