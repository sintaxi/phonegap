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
                          
/**
 * @author purplecabbage
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
		
			win.XMLHttpRequest.UNSENT = 0;
			win.XMLHttpRequest.OPENED = 1;
			win.XMLHttpRequest.HEADERS_RECEIVED = 2;
			win.XMLHttpRequest.LOADING = 3;
			win.XMLHttpRequest.DONE = 4;
	          
			win.XMLHttpRequest.prototype =
			{
                UNSENT:0,
                OPENED:1,
                HEADERS_RECEIVED:2,
                LOADING:3,
                DONE:4,

				isAsync:false,
				onreadystatechange:null,
				readyState:0,
                _url:"",
				open:function(reqType,uri,isAsync,user,password)
				{
					console.log("XMLHttpRequest.open " + uri);
					if(uri && uri.indexOf("http") == 0)
					{
						if(!this.wrappedXHR)
						{
							this.wrappedXHR = new aliasXHR();
                            var self = this;

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
                        
							this.getResponseHeader = function(header) {
								return this.wrappedXHR.getResponseHeader(header);
							};
							this.getAllResponseHeaders = function() {
								return this.wrappedXHR.getAllResponseHeaders();
							};
							
							this.wrappedXHR.onreadystatechange = function()
                            {
                                self.changeReadyState(self.wrappedXHR.readyState);
                            };
						}
						return this.wrappedXHR.open(reqType,uri,isAsync,user,password);
					}
					else
					{
                        // x-wmapp1://app/www/page2.html
                        // need to work some magic on the actual url/filepath
		                var newUrl =  uri;
                        if(newUrl.indexOf(":/") > -1)
                        {
                            newUrl = newUrl.split(":/")[1];
                        }

		                if(newUrl.lastIndexOf("/") === newUrl.length - 1)
		                {
		                    newUrl += "index.html"; // default page is index.html, when call is to a dir/ ( why not ...? )
		                }
                        this._url = newUrl;
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
				getResponseHeader:function(header)
				{
                    return this.wrappedXHR ?  this.wrappedXHR.getResponseHeader(header) : "";
				},
				getAllResponseHeaders:function()
				{
					return this.wrappedXHR ?  this.wrappedXHR.getAllResponseHeaders() : "";
				},
				responseText:"",
				responseXML:"",
				onResult:function(res)
				{
					this.status = 200;
					this.responseText = res;

                    Object.defineProperty( this, "responseXML", { get: function() {
                        var parser = new DOMParser();
						return parser.parseFromString(this.responseText,"text/xml");										
					}}); 
					this.changeReadyState(this.DONE);
				},
				onError:function(err)
				{
					console.log("Wrapped XHR received Error from FileAPI :: " + err);
					this.status = 404;
					this.changeReadyState(this.DONE);
				},

                abort:function()
                {
					if(this.wrappedXHR)
					{
						return this.wrappedXHR.abort();
					}
                },
				
				send:function(data)
				{
					if(this.wrappedXHR)
					{
						return this.wrappedXHR.send(data);
					}
                    else
                    {
                        this.changeReadyState(this.OPENED);
                        navigator.fileMgr.readAsText(this._url,"UTF-8",this.onResult.bind(this),this.onError.bind(this));
                    }
				},
				status:404
			};		  
	    } // if doc domain 

    },false);// addEventListener

		  
})(window,document);