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

namespace WP7GapClassLib.PhoneGap.Commands
{
    public class Compass : BaseCommand
    {
        DeviceCompass compass;

        double magneticHeading;
        double trueHeading;
        //double headingAccuracy;

        //bool isDataValid;

        //bool calibrating = false;

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
