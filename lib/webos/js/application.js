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

function Application() {
	
};

/*
 * Tell webOS to activate the current page of your app, bringing it into focus.
 * Example:
 * 		navigator.application.activate();
 */	
Application.prototype.activate = function() {
	PalmSystem.activate();
};

/*
 * Tell webOS to deactivate your app.
 * Example:
 *		navigator.application.deactivate();
 */	
Application.prototype.deactivate = function() {
	PalmSystem.deactivate();
};

/*
 * Returns the identifier of the current running application (e.g. com.yourdomain.yourapp).
 * Example:
 *		navigator.application.getIdentifier();
 */
Application.prototype.getIdentifier = function() {
	return PalmSystem.identifier;
};

if (typeof navigator.application == "undefined") navigator.application = new Application();

