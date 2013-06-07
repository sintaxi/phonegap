/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
*/
describe('data uris', function () {
    it("datauri.spec.1 should work with iframes", function() {
        var gotFoo = false,
            frame = document.createElement('iframe');
        function onMessage(msg) {
            gotFoo = gotFoo || msg.data == 'foo';
        };

        this.after(function() {
            document.body.removeChild(frame);
            window.removeEventListener('message', onMessage, false);
        });

        window.addEventListener('message', onMessage, false);
        frame.src = 'data:text/html;charset=utf-8,%3Chtml%3E%3Cscript%3Eparent.postMessage%28%27foo%27%2C%27%2A%27%29%3C%2Fscript%3E%3C%2Fhtml%3E'
        document.body.appendChild(frame);
        waitsFor(function() {
            return gotFoo;
        }, 'iframe did not load.', 1000);
        runs(function() {
            expect(gotFoo).toBe(true);
        });
    });
    it("datauri.spec.2 should work with images", function() {
        var img = new Image();
        img.onload = jasmine.createSpy('onLoad');
        img.onerror = jasmine.createSpy('onError');
        img.src = 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7'
        waitsFor(function() {
            return img.onload.wasCalled || img.onerror.wasCalled;
        }, 'image did not load or error', 1000);
        runs(function() {
            expect(img.onload).toHaveBeenCalled();
        });
    });
});
