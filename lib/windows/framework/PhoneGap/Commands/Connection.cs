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
using Microsoft.Phone.Net.NetworkInformation;

namespace WP7GapClassLib.PhoneGap.Commands
{

    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation(v=VS.92).aspx
    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation.devicenetworkinformation(v=VS.92).aspx

    public class Connection : BaseCommand
    {
        const string UNKNOWN = "unknown";
        const string ETHERNET = "ethernet";
        const string WIFI = "wifi";
        const string CELL_2G = "2g";
        const string CELL_3G = "3g";
        const string CELL_4G = "4g";
        const string NONE = "none";
        const string CELL = "cellular";


        public void getConnectionInfo(string empty)
        {

            //DeviceNetworkInformation.NetworkAvailabilityChanged += new EventHandler<NetworkNotificationEventArgs>(DeviceNetworkInformation_NetworkAvailabilityChanged);

            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, checkConnectionType()));
        }

        //void DeviceNetworkInformation_NetworkAvailabilityChanged(object sender, NetworkNotificationEventArgs e)
        //{
        //    throw new NotImplementedException();
        //}

        private string checkConnectionType()
        {

            if (DeviceNetworkInformation.IsNetworkAvailable)
            {
                if (DeviceNetworkInformation.IsWiFiEnabled)
                {
                    return WIFI;
                }
                else
                {
                    if (DeviceNetworkInformation.IsCellularDataEnabled)
                    {
                        // WP7 doesn't let us determine which type of cell data network
                        // DeviceNetworkInformation.CellularMobileOperator
                        return CELL;
                    }
                    else
                    {
                        return UNKNOWN;
                    }
                }
            }
            else
            {
                return NONE;
            }
        }

        
    }
}
