/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
                          
(function(win,doc){

    doc.addEventListener("DOMContentLoaded",function()
    {
    	var docDomain = null;
	    try
	    {
	       docDomain = doc.domain;
	    }
	    catch(err)
	    {
	         //console.log("caught exception trying to access document.domain");
	    }

	    if(!docDomain || docDomain.length == 0)
	    {
	        //console.log("adding our own Local XHR shim ");
			var aliasXHR = win.XMLHttpRequest;
		
			win.XMLHttpRequest = function(){};
		
			var UNSENT = 0;
			var OPENED = 1;
			var HEADERS_RECEIVED = 2;
			var LOADING = 3;
			var DONE = 4;
	          
			win.XMLHttpRequest.prototype =
			{
				isAsync:false,
				onreadystatechange:null,
				readyState:UNSENT,
				open:function(reqType,uri,isAsync,user,password)
				{
					//console.log("XMLHttpRequest.open " + uri);
					if(uri && uri.indexOf("http") == 0)
					{
						if(!this.wrappedXHR)
						{
							//console.log("using wrapped XHR");
							this.wrappedXHR = new aliasXHR();
							Object.defineProperty( this, "status", { get: function() {
								return this.wrappedXHR.status;										
							}});
							Object.defineProperty( this, "responseText", { get: function() {
								return this.wrappedXHR.responseText;										
							}});
							Object.defineProperty( this, "statusText", { get: function() {
								return this.wrappedXHR.statusText;										
							}});
							Object.defineProperty( this, "responseXML", { get: function() {
								return this.wrappedXHR.responseXML;										
							}});
							
							this.getResponseHeader = function() {
								return this.wrappedXHR.getResponseHeader.apply(this.wrappedXHR,arguments);
							};
							this.getAllResponseHeaders = function() {
								return this.wrappedXHR.getAllResponseHeaders.apply(this.wrappedXHR,arguments);
							};
							
							this.wrappedXHR.onreadystatechange = this.onreadystatechange;
						}
						return this.wrappedXHR.open(reqType,uri,isAsync,user,password);
					}
					else
					{
                        // need to work some magic on the actual url/filepath
		                var lastFileSlash = uri.lastIndexOf("\\");
		                var newUrl =  "app/" + uri.substr(lastFileSlash + 1);
		                if(newUrl.lastIndexOf("/") === newUrl.length - 1)
		                {
		                    newUrl += "index.html"; // default page is index.html, when call is to a dir/
		                }
						navigator.fileMgr.readAsText(newUrl,"UTF-8",this.onResult.bind(this),this.onError.bind(this));
		                this.changeReadyState(OPENED);
					}
				},
				statusText:"",
				changeReadyState:function(newState)
				{
					this.readyState = newState;
					if(this.onreadystatechange)
					{
						this.onreadystatechange();	
					}
				},
				getResponseHeader:function()
				{
					return "";
				},
				getAllResponseHeaders:function()
				{
					return "";
				},
				responseText:"",
				responseXML:function()
				{
					return new Document(this.responseText);
				},
				onResult:function(res)
				{
					this.status = 200;
					this.responseText = res;
					this.changeReadyState(DONE);
				},
				onError:function(err)
				{
					//console.log("Received Error from FileAPI :: " + err);
					this.status = 404;
					this.changeReadyState(DONE);
				},
				
				send:function(data)
				{
					if(this.wrappedXHR)
					{
						return this.wrappedXHR.send.apply(this.wrappedXHR,arguments);
					}
				},
				status:404,
				responseText:"empty"
			};		  
	    } // if doc domain 

    },false);// addEventListener

		  
})(window,document);

          
