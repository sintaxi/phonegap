/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 */

using System.Runtime.Serialization;
using WP7GapClassLib.PhoneGap;
using WP7GapClassLib.PhoneGap.Commands;
using WP7GapClassLib.PhoneGap.JSON;

namespace PhoneGap.Extension.Commands
{
    public class Calculator : BaseCommand
    {

        [DataContract]
        public class CalculateParameters
        {
            [DataMember]
            public double x { get; set; }
            [DataMember]
            public double y { get; set; }
        }

        public void sum(string args)
        {
            CalculateParameters calcParam = JsonHelper.Deserialize<CalculateParameters> (args);

            this.DispatchCommandResult(new PluginResult(PluginResult.Status.OK, calcParam.x + calcParam.y));
        }
    }
}