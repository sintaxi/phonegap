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
using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.Phone.Net.NetworkInformation;

namespace WP7CordovaClassLib.Cordova.Commands
{

    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation(v=VS.92).aspx
    // http://msdn.microsoft.com/en-us/library/microsoft.phone.net.networkinformation.devicenetworkinformation(v=VS.92).aspx

    public class NetworkStatus : BaseCommand
    {
        const string UNKNOWN = "unknown";
        const string ETHERNET = "ethernet";
        const string WIFI = "wifi";
        const string CELL_2G = "2g";
        const string CELL_3G = "3g";
        const string CELL_4G = "4g";
        const string NONE = "none";
        const string CELL = "cellular";


        public NetworkStatus()
            : base()
        {

            DeviceNetworkInformation.NetworkAvailabilityChanged += new EventHandler<NetworkNotificationEventArgs>(ChangeDetected);
        }

        public void getConnectionInfo(string empty)
        {
            // Use the GetIsNetworkAvailable method to quickly determine if we have a connection or not
            // Otherwise, resolving a DNS name with no connection takes a while.
            if (System.Net.NetworkInformation.NetworkInterface.GetIsNetworkAvailable())
            {
                // We have to try to resolve a host name to get the specific subtype of network available.
                // Kind of a shitty API here MSFT
                DeviceNetworkInformation.ResolveHostNameAsync(
                    new DnsEndPoint("microsoft.com", 80),
                    new NameResolutionCallback(nrr =>
                        {
                            if (nrr.NetworkErrorCode == NetworkError.Success)
                            {
                                updateConnectionType(checkConnectionType(nrr.NetworkInterface.InterfaceSubtype));
                            }
                            else
                            {
                                updateConnectionType(NONE);
                            }
                        }
                    ),
                    null
                );
            }
            else
            {
                updateConnectionType(NONE);
            }
        }

        private string checkConnectionType(NetworkInterfaceSubType type)
        {
            switch (type)
            {
                case NetworkInterfaceSubType.Cellular_1XRTT: //cell
                case NetworkInterfaceSubType.Cellular_GPRS: //cell
                    return CELL;
                case NetworkInterfaceSubType.Cellular_EDGE: //2
                    return CELL_2G;
                case NetworkInterfaceSubType.Cellular_3G:
                case NetworkInterfaceSubType.Cellular_EVDO: //3
                case NetworkInterfaceSubType.Cellular_EVDV: //3 
                case NetworkInterfaceSubType.Cellular_HSPA: //3
                    return CELL_3G;
                case NetworkInterfaceSubType.WiFi:
                    return WIFI;
                case NetworkInterfaceSubType.Unknown:
                case NetworkInterfaceSubType.Desktop_PassThru:
                default:
                    return UNKNOWN;
            }
        }

        void ChangeDetected(object sender, NetworkNotificationEventArgs e)
        {
            switch (e.NotificationType)
            {
                case NetworkNotificationType.InterfaceConnected:
                    updateConnectionType(checkConnectionType(e.NetworkInterface.InterfaceSubtype));
                    break;
                case NetworkNotificationType.InterfaceDisconnected:
                    updateConnectionType(NONE);
                    break;
                default:
                    break;
            }
        }

        private void updateConnectionType(string type)
        {
            // This should also implicitly fire offline/online events as that is handled on the JS side
            PluginResult result = new PluginResult(PluginResult.Status.OK, type);
            result.KeepCallback = true;
            DispatchCommandResult(result);
        }
    }
}
