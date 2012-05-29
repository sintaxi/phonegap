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

/*
 * This class provides access to the device audio
 * @constructor
 */

Cordova.overrideAudio = function() {
	
	Cordova.MojoAudio = Audio;
	
	Audio = function(src) {
		this.src = src;							
	};

	Audio.prototype.play = function() {
		// this.src = src;
		// The 'end' event listener doesn't seem to work, so we have to call stop before playing
		// otherwise, we'll never be able to play again
		if (this.paused && !this.stopped) {
			this.paused = false;
			this.playing = true;	
			this.audioPlayer.play();
		} else {
			if (this.audioPlayer)
				this.stop();
			if (!this.playing) {
				this.paused = false;
				this.playing = true;	
				this.stopped = false;
				this.audioPlayer = new Cordova.MojoAudio();
				var file = Mojo.appPath + this.src;
				if (this.audioPlayer.palm) {
					this.audioPlayer.mojo.audioClass = "media";
				}
				this.audioPlayer.src = file;
		
				//event doesn't work, see above
				this.audioPlayer.addEventListener('end', this.endHandler, false);
				this.audioPlayer.play();
			}
		}
	};

	Audio.prototype.pause = function() {
		if (this.stopped)
			return;
		this.paused = true;	
		if (this.playing) {
			this.playing = false;
			this.stopped = false;
			this.audioPlayer.pause();
		} else {
			this.playing = false;	
			this.paused = false;
			this.stopped = true;
		}
	};

	Audio.prototype.stop = function() {
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.playing = false;	
		this.paused = false;
		this.stopped = true;
	};

	// End event handler not working (see comment in Audio.prototype.play)
	Audio.prototype.endHandler = function () {
		this.audioPlayer.removeEventListener('end', endHandler, false);
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.paused = false;
		this.stopped = true;
	};

	/*
	 * This class contains information about any Media errors.
	 * @constructor
	 */
	MediaError = function() {
		this.code = null,
		this.message = "";
	};

	MediaError.MEDIA_ERR_ABORTED 		= 1;
	MediaError.MEDIA_ERR_NETWORK 		= 2;
	MediaError.MEDIA_ERR_DECODE 		= 3;
	MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

}

document.addEventListener("deviceready", Cordova.overrideAudio, false);

