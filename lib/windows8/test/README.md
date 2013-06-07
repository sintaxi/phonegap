<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
## Mobile Spec Suite ##

These specs are designed to run inside the mobile device that implements it - _it will fail in the DESKTOP browser_.

These set of tests is designed to be used with Cordova. You should initialize a fresh Cordova repository for a target platform and then toss these files into the www folder, replacing the
contents. 

Make sure you include cordova.js in the www folder (see the code in cordova-incl.js for clarification).

This is done so that you don't have to modify every HTML file when you want to test a new version of Cordova.

The goal is to test mobile device functionality inside a mobile browser.
Where possible, the Cordova API lines up with HTML 5 spec. Maybe down
the road we could use this spec for parts of HTML 5, too :)

### Requirements ###

Various parts of this test suite communicate with external servers.
Therefore, when you wrap up the test suite inside a Cordova application,
make sure you add the following entries to the whitelist!

- audio.ibeat.org
- cordova-filetransfer.jitsu.com
- whatheaders.com
- apache.org (with all subdomains)
- www.google.com
- httpssss://example.com (bad protocol necessary)

