using Microsoft.Phone.Controls;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.IsolatedStorage;
using System.Linq;
using System.Text;
using System.Windows;

namespace WPCordovaClassLib.CordovaLib
{
    public class XHRHelper : IBrowserDecorator
    {

        public WebBrowser Browser { get; set; }
        public PhoneApplicationPage Page { get; set; }

        public void InjectScript()
        {


            string script = @"(function(win, doc) {

    var docDomain = null;
    try {
        docDomain = doc.domain;
    } catch (err) {}

    if (!docDomain || docDomain.length === 0) {

        var aliasXHR = win.XMLHttpRequest;

        var XHRShim = function() {};
        win.XMLHttpRequest = XHRShim;
        XHRShim.noConflict = aliasXHR;
        XHRShim.UNSENT = 0;
        XHRShim.OPENED = 1;
        XHRShim.HEADERS_RECEIVED = 2;
        XHRShim.LOADING = 3;
        XHRShim.DONE = 4;
        XHRShim.prototype = {
            isAsync: false,
            onreadystatechange: null,
            readyState: 0,
            _url: '',
            timeout: 0,
            withCredentials: false,
            _requestHeaders: null,
            open: function (reqType, uri, isAsync, user, password) {

                if (uri && uri.indexOf('http') === 0) {
                    if (!this.wrappedXHR) {
                        this.wrappedXHR = new aliasXHR();
                        var self = this;
                        if (this.timeout > 0) {
                            this.wrappedXHR.timeout = this.timeout;
                        }
                        Object.defineProperty(this, 'timeout', {
                            set: function(val) {
                                this.wrappedXHR.timeout = val;
                            },
                            get: function() {
                                return this.wrappedXHR.timeout;
                            }
                        });
                        if (this.withCredentials) {
                            this.wrappedXHR.withCredentials = this.withCredentials;
                        }
                        Object.defineProperty(this, 'withCredentials', {
                            set: function(val) {
                                this.wrappedXHR.withCredentials = val;
                            },
                            get: function() {
                                return this.wrappedXHR.withCredentials;
                            }
                        });
                        Object.defineProperty(this, 'status', {
                            get: function() {
                                return this.wrappedXHR.status;
                            }
                        });
                        Object.defineProperty(this, 'responseText', {
                            get: function() {
                                return this.wrappedXHR.responseText;
                            }
                        });
                        Object.defineProperty(this, 'statusText', {
                            get: function() {
                                return this.wrappedXHR.statusText;
                            }
                        });
                        Object.defineProperty(this, 'responseXML', {
                            get: function() {
                                return this.wrappedXHR.responseXML;
                            }
                        });
                        this.getResponseHeader = function(header) {
                            return this.wrappedXHR.getResponseHeader(header);
                        };
                        this.getAllResponseHeaders = function() {
                            return this.wrappedXHR.getAllResponseHeaders();
                        };
                        this.wrappedXHR.onreadystatechange = function() {
                            self.changeReadyState(self.wrappedXHR.readyState);
                        };
                    }
                    return this.wrappedXHR.open(reqType, uri, isAsync, user, password);
                }
                else
                {
                    this.isAsync = isAsync;
                    this.reqType = reqType;
                    this._url = uri;
                }
            },
            statusText: '',
            changeReadyState: function(newState) {
                this.readyState = newState;
                if (this.onreadystatechange) {
                    this.onreadystatechange();
                }
                if (this.readyState == XHRShim.DONE){
                    this.onload && this.onload();
                }
            },
            setRequestHeader: function(header, value) {
                if (this.wrappedXHR) {
                    this.wrappedXHR.setRequestHeader(header, value);
                }
            },
            getResponseHeader: function(header) {
                return this.wrappedXHR ? this.wrappedXHR.getResponseHeader(header) : '';
            },
            getAllResponseHeaders: function() {
                return this.wrappedXHR ? this.wrappedXHR.getAllResponseHeaders() : '';
            },
            overrideMimeType: function(mimetype) {
                return this.wrappedXHR ? this.wrappedXHR.overrideMimeType(mimetype) : '';
            },
            responseText: '',
            responseXML: '',
            onResult: function(res) {
                this.status = 200;
                if (typeof res == 'object') {
                    res = JSON.stringify(res);
                }
                this.responseText = res;
                this.responseXML = res;
                this.changeReadyState(XHRShim.DONE);
            },
            onError: function(err) {
                this.status = 404;
                this.changeReadyState(XHRShim.DONE);
            },
            abort: function() {
                if (this.wrappedXHR) {
                    return this.wrappedXHR.abort();
                }
            },
            send: function(data) {
                if (this.wrappedXHR) {
                    return this.wrappedXHR.send(data);
                }
                else {
                    this.changeReadyState(XHRShim.OPENED);
                    var alias = this;

                    var root = window.location.href.split('#')[0];   // remove hash
                    var basePath = root.substr(0,root.lastIndexOf('/')) + '/';

                    var resolvedUrl = this._url.split('//').join('/').split('#')[0]; // remove hash

                    var wwwFolderPath = navigator.userAgent.indexOf('MSIE 9.0') > -1 ? 'app/www/' : 'www/';

                    if(resolvedUrl.indexOf('/') == 0) {
                        //console.log('removing leading /');
                        resolvedUrl = resolvedUrl.substr(1);
                    }

                    // handle special case where url is of form app/www but we are loaded just from /www
                    if( resolvedUrl.indexOf('app/www') == 0 ) {
                        resolvedUrl = window.location.protocol  + wwwFolderPath + resolvedUrl.substr(7);
                    }
                    else if( resolvedUrl.indexOf('www') == 0) {
                        resolvedUrl = window.location.protocol  + wwwFolderPath + resolvedUrl.substr(4);
                    }

                    if(resolvedUrl.indexOf(':') < 0) {
                        resolvedUrl = basePath + resolvedUrl; // consider it relative
                    }

                    var funk = function () {
                        window.__onXHRLocalCallback = function (responseCode, responseText) {
                            alias.status = responseCode;
                            if (responseCode == '200') {
                                alias.responseText = responseText;
                            }
                            else {
                                alias.onerror && alias.onerror(responseCode);
                            }

                            alias.changeReadyState(XHRShim.DONE);
                        }
                        alias.changeReadyState(XHRShim.LOADING);
                        window.external.Notify('XHRLOCAL/' + resolvedUrl);
                    }
                    if (this.isAsync) {
                        setTimeout(funk, 0);
                    }
                    else {
                        funk();
                    }
                }
            },
            status: 404
        };
    }
})(window, document); ";


            Browser.InvokeScript("execScript", new string[] { script });
        }

        public bool HandleCommand(string commandStr)
        {
            if (commandStr.IndexOf("XHRLOCAL") == 0)
            {
                string url = commandStr.Replace("XHRLOCAL/", "");

                Uri uri = new Uri(url, UriKind.RelativeOrAbsolute);

                using (IsolatedStorageFile isoFile = IsolatedStorageFile.GetUserStoreForApplication())
                {
                    if (isoFile.FileExists(uri.AbsolutePath))
                    {
                        using (TextReader reader = new StreamReader(isoFile.OpenFile(uri.AbsolutePath, FileMode.Open, FileAccess.Read)))
                        {
                            string text = reader.ReadToEnd();
                            Browser.InvokeScript("__onXHRLocalCallback", new string[] { "200", text });
                            return true;
                        }
                    }
                }

                Uri relUri = new Uri(uri.AbsolutePath, UriKind.Relative);

                var resource = Application.GetResourceStream(relUri);

                if (resource == null)
                {
                    // 404 ?
                    Browser.InvokeScript("__onXHRLocalCallback", new string[] { "404" });
                    return true;
                }
                else
                {
                    using (StreamReader streamReader = new StreamReader(resource.Stream))
                    {
                        string text = streamReader.ReadToEnd();
                        Browser.InvokeScript("__onXHRLocalCallback", new string[] { "200", text });
                        return true;
                    }
                }
            }

            return false;
        }
    }
}
