/**
 * @author ryan
 */

function Storage() {
	this.available = true;
	this.serialized = null;
	this.items = null;
	
	if (!window.widget) {
		this.available = false;
		return;
	}
	var pref = window.widget.preferenceForKey(Storage.PREFERENCE_KEY);
	
	//storage not yet created
	if (pref == "undefined" || pref == undefined) {
		this.length = 0;
		this.serialized = "({})";
		this.items = {};
		window.widget.setPreferenceForKey(this.serialized, Storage.PREFERENCE_KEY);
	} else {
		this.serialized = pref;'({"store_test": { "key": "store_test", "data": "asdfasdfs" },})';
		this.items = eval(this.serialized);
	}
}

Storage.PREFERENCE_KEY = "phonegap_storage_pref_key";

Storage.prototype.index = function (key) {
	
};

Storage.prototype.getItem = function (key) {
	try {
		return this.items[key].data;
	} catch (ex) {
		return null;
	}
};

Storage.prototype.setItem = function (key, data) {

	this.items[key] = {
		"key": key,
		"data": data
	};
	
	this.serialize();
};

Storage.prototype.removeItem = function (key) {

	if (this.items[key]) {
		this.items[key] = undefined;
	}
	this.serialize();
};

Storage.prototype.clear = function () {
	this.serialized = "({})";
	this.items = {};
	this.serialize();
};

Storage.prototype.serialize = function() {
	var json = "";
	
	for (key in this.items) {
		var item = this.items[key];
		if (typeof item != "undefined") {
			json += "\"" + item.key + "\": { \"key\": \"" + item.key + "\", \"data\": \"" + item.data + "\" }, ";
		}
	}
	this.serialized = "({" + json + "})";

	window.widget.setPreferenceForKey( this.serialized, Storage.PREFERENCE_KEY);
};

if (typeof navigator.storage == "undefined" ) navigator.storage = new Storage();
