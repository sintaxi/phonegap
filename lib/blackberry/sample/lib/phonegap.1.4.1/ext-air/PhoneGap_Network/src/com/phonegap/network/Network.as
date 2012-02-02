/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, Research In Motion Limited.
 */


package com.phonegap.network {
    import flash.net.NetworkInfo;
    import flash.net.NetworkInterface;
	import flash.events.Event;
    
    import webworks.extension.DefaultExtension;
    
    public class Network extends DefaultExtension{
        
        private var _jsFunctionCallbackIDs:Array = [];
		private const FEATURE_ID:Array = [ "com.phonegap" ];
		
		public function Network() {
			//Attach event listener once only
			NetworkInfo.networkInfo.addEventListener(flash.events.Event.NETWORK_CHANGE, networkChange);    
		}
		
		override public function getFeatureList():Array {
			return FEATURE_ID;
		}
        
        public function getConnectionInfo(param:String):void{ 
			if(_jsFunctionCallbackIDs.indexOf(param) < 0){
				_jsFunctionCallbackIDs.push(param);
			}
        }
        
        private function networkChange( event: Event ) : void {
            
            /**
             * Right now, we only care if there is a connection or not, since PlayBook only has WiFi
             * At the JS layer, we will map this from offline/online.
             * At some point in the future where there are more connection types on PlayBook,
             * we will want to attempt to map this to the real PhoneGap connection types...
             */
            
            var haveCoverage : Boolean = false;
            var networkStatus : String = "offline";
			var connectionType = "none";

			NetworkInfo.networkInfo.findInterfaces().some(
				function callback(item:NetworkInterface, index:int, vector:Vector.<NetworkInterface>):Boolean {
					this.webView.executeJavaScript("alert('Network Interface ' + item.name)");
					haveCoverage = item.active || haveCoverage;
					return haveCoverage;
				}, this);

			if (haveCoverage) {
				networkStatus = "online";
				connectionType = "wifi";
			}
            
            for (var i:Number=0; i<_jsFunctionCallbackIDs.length ; i++){
                evalJavaScriptEvent(_jsFunctionCallbackIDs[i], [{"type" : connectionType, "event" : networkStatus }] );
            }
        }
    }
}

