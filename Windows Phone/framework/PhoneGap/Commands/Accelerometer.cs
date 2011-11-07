/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Sergey Grebnov.
 * Copyright (c) 2011, Jesse MacFadyen.
 */

using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Threading;
using Microsoft.Devices.Sensors;

namespace WP7GapClassLib.PhoneGap.Commands
{
    /// <summary>
    /// Captures device motion in the x, y, and z direction.
    /// </summary>
    public class Accelerometer : BaseCommand
    {
        #region AccelerometerOptions class
        /// <summary>
        /// Represents Accelerometer options.
        /// </summary>
        [DataContract]
        public class AccelerometerOptions
        {
            /// <summary>
            /// How often to retrieve the Acceleration in milliseconds
            /// </summary>
            [DataMember(IsRequired = false, Name = "frequency")]
            public int Frequency { get; set; }

            /// <summary>
            /// Watcher id
            /// </summary>
            [DataMember(IsRequired = false, Name = "id")]
            public string Id { get; set; }

            /// <summary>
            /// Creates options object with default parameters
            /// </summary>
            public AccelerometerOptions()
            {
                this.SetDefaultValues(new StreamingContext());
            }

            /// <summary>
            /// Initializes default values for class fields.
            /// Implemented in separate method because default constructor is not invoked during deserialization.
            /// </summary>
            /// <param name="context"></param>
            [OnDeserializing()]
            public void SetDefaultValues(StreamingContext context)
            {
                this.Frequency = 10000;
            }
        }

        #endregion

        #region Status codes

        public const int Stopped = 0;
        public const int Starting = 1;
        public const int Running = 2;
        public const int ErrorFailedToStart = 3;

        #endregion

        #region Static members

        /// <summary>
        /// Status of listener
        /// </summary>
        private static int currentStatus;

        /// <summary>
        /// Id for get getAcceleration method
        /// </summary>
        private static string getAccelId = "getAccelId";

        /// <summary>
        /// Accelerometer
        /// </summary>
        private static Microsoft.Devices.Sensors.Accelerometer accelerometer = new Microsoft.Devices.Sensors.Accelerometer();

        /// <summary>
        /// Listeners for callbacks
        /// </summary>
        private static Dictionary<string, Accelerometer> watchers = new Dictionary<string, Accelerometer>();

        #endregion

        /// <summary>
        /// Time the value was last changed
        /// </summary>
        private DateTime lastValueChangedTime;

        /// <summary>
        /// Accelerometer options
        /// </summary>
        private AccelerometerOptions accelOptions;

        /// <summary>
        /// Start listening for acceleration sensor
        /// </summary>
        public void startWatch(string options)
        {
            try
            {
                accelOptions = JSON.JsonHelper.Deserialize<AccelerometerOptions>(options);
            }
            catch (Exception ex)
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION, ex.Message));
                return;
            }

            if (string.IsNullOrEmpty(accelOptions.Id))
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }

            try
            {
                lock (accelerometer)
                {
                    watchers.Add(accelOptions.Id, this);
                    accelerometer.CurrentValueChanged += watchers[accelOptions.Id].accelerometer_CurrentValueChanged;
                    accelerometer.Start();
                    this.SetStatus(Starting);
                }
            }
            catch (Exception e)
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, ErrorFailedToStart));
                return;
            }
        }

        /// <summary>
        /// Stops listening to acceleration sensor
        /// </summary>
        public void stopWatch(string options)
        {
            try
            {
                accelOptions = JSON.JsonHelper.Deserialize<AccelerometerOptions>(options);
            }
            catch (Exception ex)
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION, ex.Message));
                return;
            }

            if (string.IsNullOrEmpty(accelOptions.Id))
            {
                this.DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
                return;
            }

            if (currentStatus != Stopped)
            {
                lock (accelerometer)
                {
                    Accelerometer watcher = watchers[accelOptions.Id];
                    
                    watcher.Dispose();
                    accelerometer.CurrentValueChanged -= watcher.accelerometer_CurrentValueChanged;
                    watchers.Remove(accelOptions.Id);
                }
            }
            this.SetStatus(Stopped);

            this.DispatchCommandResult();
        }

        /// <summary>
        /// Gets current accelerometer coordinates
        /// </summary>
        public void getAcceleration(string options)
        {
            try
            {
                if (currentStatus != Running)
                {
                    int status = this.start();
                    if (status == ErrorFailedToStart)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.IO_EXCEPTION, ErrorFailedToStart));
                        return;
                    }

                    long timeout = 2000;
                    while ((currentStatus == Starting) && (timeout > 0))
                    {
                        timeout = timeout - 100;
                        Thread.Sleep(100);
                    }

                    if (currentStatus != Running)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.IO_EXCEPTION, ErrorFailedToStart));
                        return;
                    }
                }
                lock (accelerometer)
                {
                    if (watchers.ContainsKey(getAccelId))
                    {
                        accelerometer.CurrentValueChanged -= watchers[getAccelId].accelerometer_CurrentValueChanged;
                        watchers.Remove(getAccelId);
                    }
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, GetCurrentAccelerationFormatted()));
                }
            }
            catch (UnauthorizedAccessException e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ILLEGAL_ACCESS_EXCEPTION, ErrorFailedToStart));
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, ErrorFailedToStart));
            }
        }

        /// <summary>
        /// Sensor listener event
        /// </summary>        
        private void accelerometer_CurrentValueChanged(object sender, SensorReadingEventArgs<AccelerometerReading> e)
        {
            this.SetStatus(Running);

            if (accelOptions != null)
            {
                if (((DateTime.Now - lastValueChangedTime).TotalMilliseconds) > accelOptions.Frequency)
                {
                    lastValueChangedTime = DateTime.Now;
                    PluginResult result = new PluginResult(PluginResult.Status.OK, GetCurrentAccelerationFormatted());
                    result.KeepCallback = true;
                    DispatchCommandResult(result);
                }
            }

            if (watchers.Count == 0)
            {
                accelerometer.Stop();
                this.SetStatus(Stopped);
            }
        }

        /// <summary>
        /// Starts listening for acceleration sensor
        /// </summary>
        /// <returns>status of listener</returns>
        private int start()
        {
            if ((currentStatus == Running) || (currentStatus == Starting))
            {
                return currentStatus;
            }
            try
            {
                lock (accelerometer)
                {
                    watchers.Add(getAccelId, this);
                    accelerometer.CurrentValueChanged += watchers[getAccelId].accelerometer_CurrentValueChanged;
                    accelerometer.Start();
                    this.SetStatus(Starting);
                }
            }
            catch (Exception e)
            {
                this.SetStatus(ErrorFailedToStart);
            }
            return currentStatus;
        }

        /// <summary>
        /// Formats current coordinates into JSON format
        /// </summary>
        /// <returns>Coordinates in JSON format</returns>
        private string GetCurrentAccelerationFormatted()
        {
            string resultCoordinates = String.Format("\"x\":{0},\"y\":{1},\"z\":{2}",
                            accelerometer.CurrentValue.Acceleration.X.ToString("0.00000"),
                            accelerometer.CurrentValue.Acceleration.Y.ToString("0.00000"),
                            accelerometer.CurrentValue.Acceleration.Z.ToString("0.00000"));
            resultCoordinates = "{" + resultCoordinates + "}";
            return resultCoordinates;
        }

        /// <summary>
        /// Sets current status
        /// </summary>
        /// <param name="status">current status</param>
        private void SetStatus(int status)
        {
            currentStatus = status;
        }
    }
}
