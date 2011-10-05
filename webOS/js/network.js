function Network() {
    /*
     * The last known Network status.
     */
	this.lastReachability = null;
};

Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.request = navigator.service.Request('palm://com.palm.connectionmanager', {
	    method: 'getstatus',
	    parameters: {},
	    onSuccess: function(result) { 
			var status = NetworkStatus.NOT_REACHABLE;
			if (result.isInternetConnectionAvailable == true)
			{
				// don't know whether its via wifi or carrier ... so return the worst case
				status = NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK;
			}
			successCallback(status); 
		},
	    onFailure: function() {}
	});

};

/*
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
};

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

if (typeof navigator.network == "undefined") navigator.network = new Network();

