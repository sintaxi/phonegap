

using System.Runtime.Serialization;
using WP7CordovaClassLib.Cordova;
using WP7CordovaClassLib.Cordova.Commands;
using WP7CordovaClassLib.Cordova.JSON;

namespace Cordova.Extension.Commands
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