/*
* Copyright 2013 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

describe("Battery", function () {

    var _apiDir = __dirname + "./../../../../plugins/Battery/src/blackberry10/",
        index,
        callback,
        mockPluginResult = {
            ok: jasmine.createSpy(),
            error: jasmine.createSpy(),
            noResult: jasmine.createSpy(),
            callbackOk: jasmine.createSpy()
        },
        noop = function () {},
        args,
        env = {
            webview: {
                id: 42
            }
        };


    beforeEach(function () {
        GLOBAL.window = {
            qnx: {
                webplatform: {
                    device: {
                        addEventListener: jasmine.createSpy("webplatform.device.addEventListener").andCallFake(function (evt, cb) {
                            callback = cb;
                        }),
                        removeEventListener: jasmine.createSpy("webplatform.device.removeEventListener")
                    }
                }
            }
        };
        GLOBAL.PluginResult = function () {
            return mockPluginResult;
        };
        index = require(_apiDir + "index");
    });

    afterEach(function () {
        delete GLOBAL.window;
        delete GLOBAL.PluginResult;
        delete require.cache[require.resolve(_apiDir + "index")];
    });

    describe("start", function () {

        it("calls noResult and keeps callbacks", function () {
            index.start(noop, noop, args, env);
            expect(window.qnx.webplatform.device.removeEventListener).not.toHaveBeenCalled();
            expect(window.qnx.webplatform.device.addEventListener).toHaveBeenCalled();
            expect(mockPluginResult.noResult).toHaveBeenCalledWith(true);
            expect(mockPluginResult.error).not.toHaveBeenCalled();
        });

        it("callback calls ok and keeps callbacks", function () {
            callback("OK");
            expect(mockPluginResult.callbackOk).toHaveBeenCalledWith("OK", true);
            expect(mockPluginResult.error).not.toHaveBeenCalled();
        });

        it("does not call error if already started", function () {
            index.start(noop, noop, args, env);
            window.qnx.webplatform.device.addEventListener.reset();
            mockPluginResult.noResult.reset();
            index.start(noop, noop, args, env);
            expect(window.qnx.webplatform.device.removeEventListener).toHaveBeenCalled();
            expect(window.qnx.webplatform.device.addEventListener).toHaveBeenCalled();
            expect(mockPluginResult.error).not.toHaveBeenCalled();
            expect(mockPluginResult.noResult).toHaveBeenCalledWith(true);
        });


    });

    describe("stop", function () {

        it("calls noResult and does not keep callbacks", function () {
            index.start(noop, noop, args, env);
            window.qnx.webplatform.device.removeEventListener.reset();
            index.stop(noop, noop, args, env);
            expect(window.qnx.webplatform.device.removeEventListener).toHaveBeenCalled();
            expect(mockPluginResult.noResult).toHaveBeenCalledWith(false);
        });

    });
});
