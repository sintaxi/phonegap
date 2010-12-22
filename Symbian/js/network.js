function Network() {
    /**
     * The last known Network status.
     */
	this.lastReachability = null;
};

Network.prototype.isReachable = function(hostName, successCallback, options) {
	var req = new XMLHttpRequest();  
   	req.open('GET', hostName, true);  
   	req.onreadystatechange = function (aEvt) {  
     	if (req.readyState == 4) {  
        	if(req.status == 200)  
        		successCallback(NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK);
         	else  
          		successCallback(NetworkStatus.NOT_REACHABLE);
 		}  
  	};  
  	req.send(null);

};

/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
}

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

if (typeof navigator.network == "undefined") navigator.network = new Network();