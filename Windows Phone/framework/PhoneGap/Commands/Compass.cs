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
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using DeviceCompass = Microsoft.Devices.Sensors.Compass;
using System.Windows.Threading;
using Microsoft.Xna.Framework;

namespace WP7GapClassLib.PhoneGap.Commands
{
    public class Compass : BaseCommand
    {
        DeviceCompass compass;

        double magneticHeading;
        double trueHeading;
        double headingAccuracy;

        bool isDataValid;

        bool calibrating = false;

        Accelerometer accelerometer;

        public Compass()
        {

        }

        public void getHeading(string options)
        {
            if (!DeviceCompass.IsSupported)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR,"4"));
            }
            else
            {
                if (compass == null)
                {
                    // Instantiate the compass.
                    compass = new DeviceCompass();
                    compass.TimeBetweenUpdates = TimeSpan.FromMilliseconds(40);
                    compass.CurrentValueChanged += new EventHandler<Microsoft.Devices.Sensors.SensorReadingEventArgs<Microsoft.Devices.Sensors.CompassReading>>(compass_CurrentValueChanged);
                }
                //compass.Calibrate += new EventHandler<Microsoft.Devices.Sensors.CalibrationEventArgs>(compass_Calibrate);
                
                compass.Start();
            }
        }

        //void compass_Calibrate(object sender, Microsoft.Devices.Sensors.CalibrationEventArgs e)
        //{
        //    throw new NotImplementedException();
        //}

        void compass_CurrentValueChanged(object sender, Microsoft.Devices.Sensors.SensorReadingEventArgs<Microsoft.Devices.Sensors.CompassReading> e)
        {
            if (compass.IsDataValid)
            {
                trueHeading = e.SensorReading.TrueHeading;
                magneticHeading = e.SensorReading.MagneticHeading;
                //headingAccuracy = Math.Abs(e.SensorReading.HeadingAccuracy);
                //rawMagnetometerReading = e.SensorReading.MagnetometerReading;

                string messageResult = trueHeading.ToString();

                compass.Stop();

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, messageResult));
            }
        }

    }
}
