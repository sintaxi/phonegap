/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
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
