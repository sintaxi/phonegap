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
using Microsoft.Phone.Controls;
using WPCordovaClassLib.CordovaLib;

namespace WPCordovaClassLib.Cordova
{
    public class OrientationHelper : IBrowserDecorator
    {
        public WebBrowser Browser { get; set; }

        public PhoneApplicationPage Page
        {
            get
            {
                PhoneApplicationFrame frame = Application.Current.RootVisual as PhoneApplicationFrame;
                if (frame != null)
                {
                    return frame.Content as PhoneApplicationPage;
                }
                return null;
            }
        }

        // private PageOrientation CurrentOrientation = PageOrientation.PortraitUp;
        //private PageOrientation[] SupportedOrientations; // TODO:

        public void InjectScript()
        {
            int i = 0;

            switch (Page.Orientation)
            {
                case PageOrientation.Portrait: // intentional fall through
                case PageOrientation.PortraitUp:
                    i = 0;
                    break;
                case PageOrientation.PortraitDown:
                    i = 180;
                    break;
                case PageOrientation.Landscape: // intentional fall through
                case PageOrientation.LandscapeLeft:
                    i = -90;
                    break;
                case PageOrientation.LandscapeRight:
                    i = 90;
                    break;
            }
            string jsCallback = String.Format("window.orientation = {0};", i);

            try
            {
                Browser.InvokeScript("execScript", new string[] { jsCallback });
            }
            catch (Exception)
            {
            }
        }

        void page_OrientationChanged(object sender, OrientationChangedEventArgs e)
        {
            int i = 0;

            switch (e.Orientation)
            {
                case PageOrientation.Portrait: // intentional fall through
                case PageOrientation.PortraitUp:
                    i = 0;
                    break;
                case PageOrientation.PortraitDown:
                    i = 180;
                    break;
                case PageOrientation.Landscape: // intentional fall through
                case PageOrientation.LandscapeLeft:
                    i = -90;
                    break;
                case PageOrientation.LandscapeRight:
                    i = 90;
                    break;
            }
            // Cordova.fireEvent('orientationchange', window);
            string jsCallback = String.Format("window.orientation = {0};", i);

            try
            {

                Browser.InvokeScript("execScript", new string[] { jsCallback });

                jsCallback = "var evt = document.createEvent('HTMLEvents');";
                jsCallback += "evt.initEvent( 'orientationchange', true, false );";
                jsCallback += "window.dispatchEvent(evt);";
                jsCallback += "if(window.onorientationchange){window.onorientationchange(evt);}";

                Browser.InvokeScript("execScript", new string[] {jsCallback});
            }
            catch (Exception)
            {
            }
        }

        public bool HandleCommand(string commandStr)
        {
            // No commands are currently accepted.
            return true;
        }
    }


}
