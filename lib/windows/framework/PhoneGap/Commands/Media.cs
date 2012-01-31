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

using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Windows;

namespace WP7GapClassLib.PhoneGap.Commands
{
    /// <summary>
    /// Provides the ability to record and play back audio files on a device. 
    /// </summary>
    public class Media : BaseCommand
    {
        /// <summary>
        /// Audio player objects
        /// </summary>
        private static Dictionary<string, AudioPlayer> players = new Dictionary<string,AudioPlayer>();

        /// <summary>
        /// Represents Media action options.
        /// </summary>
        [DataContract]
        public class MediaOptions
        {
            /// <summary>
            /// Audio id
            /// </summary>
            [DataMember(Name = "id", IsRequired = true)]
            public string Id { get; set; }

            /// <summary>
            /// Path to audio file
            /// </summary>
            [DataMember(Name = "src")]
            public string Src { get; set; }

            /// <summary>
            /// New track position
            /// </summary>
            [DataMember(Name = "milliseconds")]
            public int Milliseconds { get; set; }                        
        }

        /// <summary>
        /// Releases the audio player instance to save memory.
        /// </summary>  
        private void release(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                if (!Media.players.ContainsKey(mediaOptions.Id))
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, false));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        AudioPlayer audio = Media.players[mediaOptions.Id];
                        Media.players.Remove(mediaOptions.Id);
                        audio.Dispose();
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK, true));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }  
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }           
        }

        /// <summary>
        /// Starts recording and save the specified file 
        /// </summary>
        public void startRecordingAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (!Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = new AudioPlayer(this, mediaOptions.Id);
                            Media.players.Add(mediaOptions.Id, audio);
                            audio.startRecording(mediaOptions.Src);
                        }
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }

                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        /// <summary>
        /// Stops recording and save to the file specified when recording started 
        /// </summary>
        public void stopRecordingAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = Media.players[mediaOptions.Id];
                            audio.stopRecording();
                            Media.players.Remove(mediaOptions.Id);
                        }
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }
                });
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        /// <summary>
        /// Starts or resume playing audio file 
        /// </summary>
        public void startPlayingAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                AudioPlayer audio;

                if (!Media.players.ContainsKey(mediaOptions.Id))
                {
                    audio = new AudioPlayer(this, mediaOptions.Id);
                    Media.players.Add(mediaOptions.Id, audio);
                }
                else
                {
                    audio = Media.players[mediaOptions.Id];
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        audio.startPlaying(mediaOptions.Src);

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }
                });
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }


        /// <summary>
        /// Seeks to a location
        /// </summary>
        public void seekToAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = Media.players[mediaOptions.Id];
                            audio.seekToPlaying(mediaOptions.Milliseconds);
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        /// <summary>
        /// Pauses playing 
        /// </summary>
        public void pausePlayingAudio(string options)
        {

                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = Media.players[mediaOptions.Id];
                            audio.pausePlaying();
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }
                });
        }


        /// <summary>
        /// Stops playing the audio file
        /// </summary>
        public void stopPlayingAudio(String options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = Media.players[mediaOptions.Id];
                            audio.stopPlaying();
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK));
                    }
                    catch(Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
                    }
                });
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }

        }
        
        /// <summary>
        /// Gets current position of playback
        /// </summary>
        public void getCurrentPositionAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                if (Media.players.ContainsKey(mediaOptions.Id))
                {
                    AudioPlayer audio = Media.players[mediaOptions.Id];

                    Deployment.Current.Dispatcher.BeginInvoke(() =>
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK, audio.getCurrentPosition()));
                    });
                    return;
                }
                else
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, -1));
                }
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }

        
        /// <summary>
        /// Gets the duration of the audio file
        /// </summary>
        public void getDurationAudio(string options)
        {
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    mediaOptions = JSON.JsonHelper.Deserialize<MediaOptions>(options);
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                    return;
                }

                AudioPlayer audio;
                if (Media.players.ContainsKey(mediaOptions.Id))
                {
                    audio = Media.players[mediaOptions.Id];                    
                }
                else
                {
                    audio = new AudioPlayer(this, mediaOptions.Id);
                    Media.players.Add(mediaOptions.Id, audio);
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, audio.getDuration(mediaOptions.Src)));
                });
            }
            catch(Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message));
            }
        }  

    }
}
