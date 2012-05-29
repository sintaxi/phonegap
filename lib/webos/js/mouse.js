/*
 *
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
 *
*/

function Mouse() {
	
};

/*
 * Possibly useful for automated testing, this call to PalmSystem triggers a mouse click (i.e. touch event). 
 * x coordinate & y coordinate of where the screen was touched and also a true/false flag to tell WebOS if it should simulate the mouse click
 * @param {Number} x
 * @param {Number} y
 * @param {Boolean} state
 * Example:
 *		navigator.mouse.simulateMouseClick(10, 10, true);
 */	
Mouse.prototype.simulateMouseClick = function(x, y, state) {
	PalmSystem.simulateMouseClick(x, y, state || true);
};

if (typeof navigator.mouse == "undefined") navigator.mouse = new Mouse();

