function Service() {
	
};

Service.prototype.Request = function (uri, params) {
	var req = new PalmServiceBridge();
	var url = uri + "/" + (params.method || "");
	req.url = url;

	this.req = req;
	this.url = url;
	this.params = params || {};
	
	this.call(params);
	
	return this;
};

Service.prototype.call = function(params) {
	var onsuccess = null;
	var onfailure = null;
	var oncomplete = null;

	if (typeof params.onSuccess === 'function')
		onsuccess = params.onSuccess;

	if (typeof params.onFailure === 'function')
		onerror = params.onFailure;

	if (typeof params.onComplete === 'function')
		oncomplete = params.onComplete;

	this.req.onservicecallback = callback;

	function callback(msg) {
		var response = JSON.parse(msg);

		if ((response.errorCode) && onfailure)
			onfailure(response);
		else if (onsuccess)
			onsuccess(response);
		
		if (oncomplete)
			oncomplete(response);
	}

	this.data = (typeof params.parameters === 'object') ? JSON.stringify(params.parameters) : '{}';

	this.req.call(this.url, this.data);
}

if (typeof navigator.service == "undefined") navigator.service = new Service();

