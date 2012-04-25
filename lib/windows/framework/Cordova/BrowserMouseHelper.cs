using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Phone.Controls;
using System.Windows.Input;
using System.Diagnostics;
using System.Windows.Media;
using System;

namespace WP7CordovaClassLib
{

    /// <summary>
    /// Suppresses pinch zoom and optionally scrolling of the WebBrowser control
    /// </summary>
    public class BrowserMouseHelper
    {

        /**
         * 
         * Full Script below, in use it is minified.
        */

        private static string mouseScript =
        @"(function(win,doc){
            Object.defineProperty( MouseEvent.prototype, 'pageX', {
               configurable: true,
               get: function(){ return this.clientX }
            });
            Object.defineProperty( MouseEvent.prototype, 'pageY', {
               configurable: true,
               get: function(){ return this.clientY }
            });

            win.onNativeMouseEvent = function(type,x,y){
                try {
                    var xMod = screen.logicalXDPI / screen.deviceXDPI;
                    var yMod = screen.logicalYDPI / screen.deviceYDPI;
                    var evt = doc.createEvent('MouseEvents');
                    var xPos =  doc.body.scrollLeft + Math.round(xMod * x);
                    var yPos =  doc.body.scrollTop + Math.round(yMod * y);
                    var element = doc.elementFromPoint(xPos,yPos);
                    evt.initMouseEvent(type, true, true, win, 1, xPos, yPos, xPos, yPos, false, false, false, false, 0, element);
                    var canceled = element ? !element.dispatchEvent(evt) : !doc.dispatchEvent(evt);
                    return canceled ? 'true' : 'false';
                }
                catch(e) { return e;}
            }
        })(window,document);";


        private static string MinifiedMouseScript = "(function(f,a){Object.defineProperty(MouseEvent.prototype,'pageX',{configurable:!0,get:function(){return this.clientX}});Object.defineProperty(MouseEvent.prototype,'pageY',{configurable:!0,get:function(){return this.clientY}});f.onNativeMouseEvent=function(g,h,i)" 
        + "{try{var j=screen.logicalXDPI/screen.deviceXDPI,k=screen.logicalYDPI/screen.deviceYDPI,b=a.createEvent('MouseEvents'),c=a.body.scrollLeft+Math.round(j*h),d=a.body.scrollTop+Math.round(k*i),e=a.elementFromPoint(c,d);b.initMouseEvent(g,!0,!0,"
        + "f,1,c,d,c,d,!1,!1,!1,!1,0,e);return(e?!e.dispatchEvent(b):!a.dispatchEvent(b))?'true':'false'}catch(l){return l}}})(window,document);";


        private WebBrowser _browser;

        /// <summary>
        /// Gets or sets whether to suppress the scrolling of
        /// the WebBrowser control;
        /// </summary>
        public bool ScrollDisabled { get; set; }
        public bool ZoomDisabled { get; set; }
        protected Border border;

        public BrowserMouseHelper(WebBrowser browser)
        {
            _browser = browser;
            browser.Loaded += new RoutedEventHandler(browser_Loaded);
        }

        private void browser_Loaded(object sender, RoutedEventArgs e)
        {
            var border0 = VisualTreeHelper.GetChild(_browser, 0);
            var border1 = VisualTreeHelper.GetChild(border0, 0);
            var panZoom = VisualTreeHelper.GetChild(border1, 0);
            var grid = VisualTreeHelper.GetChild(panZoom, 0);
            border = VisualTreeHelper.GetChild(grid, 0) as Border;


            if (border != null)
            {
                border.ManipulationStarted += Border_ManipulationStarted;
                border.ManipulationDelta += Border_ManipulationDelta;
                border.ManipulationCompleted += Border_ManipulationCompleted;
                border.DoubleTap += Border_DoubleTap;
                border.Hold += Border_Hold;
                border.MouseLeftButtonDown += Border_MouseLeftButtonDown;
            }

            _browser.LoadCompleted += Browser_LoadCompleted;

        }

        void Browser_LoadCompleted(object sender, System.Windows.Navigation.NavigationEventArgs e)
        {
            try
            {
                _browser.InvokeScript("execScript", MinifiedMouseScript);
            }
            catch (Exception)
            {
                Debug.WriteLine("BrowserHelper Failed to install mouse script in WebBrowser");
            }

        }

        bool InvokeSimulatedMouseEvent(string eventName, Point pos)
        {
            bool bCancelled = false;
            try
            {
                string strCancelled = _browser.InvokeScript("onNativeMouseEvent", new string[] { eventName, pos.X.ToString(), pos.Y.ToString() }) as string;                
                if (bool.TryParse(strCancelled, out bCancelled))
                {
                    return bCancelled;
                }

            }
            catch (Exception)
            {
                // script error
            }

            return bCancelled;
        }

        void Border_Hold(object sender, GestureEventArgs e)
        {
            e.Handled = true;
        }

        void Border_DoubleTap(object sender, GestureEventArgs e)
        {
            e.Handled = true;
        }

        void Border_ManipulationStarted(object sender, ManipulationStartedEventArgs e)
        {
            if (ScrollDisabled)
            {
                e.Handled = true;
                e.Complete();
            }
        }

        void Border_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            border.MouseMove += new MouseEventHandler(Border_MouseMove);
            border.MouseLeftButtonUp += new MouseButtonEventHandler(Border_MouseLeftButtonUp);

            Point pos = e.GetPosition(_browser);

            bool bCancelled = InvokeSimulatedMouseEvent("mousedown", pos);
            e.Handled = bCancelled;
            ScrollDisabled = bCancelled;
        }

        void Border_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            border.MouseMove -= new MouseEventHandler(Border_MouseMove);
            border.MouseLeftButtonUp -= new MouseButtonEventHandler(Border_MouseLeftButtonUp);
            Point pos = e.GetPosition(_browser);

            bool bCancelled = InvokeSimulatedMouseEvent("mouseup", pos);
            e.Handled = bCancelled;
            ScrollDisabled = false;
        }


        void Border_MouseMove(object sender, MouseEventArgs e)
        {
            //Debug.WriteLine("Border_MouseMove");
            Point pos = e.GetPosition(_browser);

            bool bCancelled = InvokeSimulatedMouseEvent("mousemove", pos);
            //ScrollDisabled = bCancelled;

        }

        private void Border_ManipulationCompleted(object sender, ManipulationCompletedEventArgs e)
        {
            
            // suppress zoom
            if (e.FinalVelocities != null)
            {
                if (e.FinalVelocities.ExpansionVelocity.X != 0.0 ||
                   e.FinalVelocities.ExpansionVelocity.Y != 0.0)
                {
                    e.Handled = true;
                }
            }
        }

        private void Border_ManipulationDelta(object sender, ManipulationDeltaEventArgs e)
        {

            // optionally suppress zoom
            if (ZoomDisabled && (e.DeltaManipulation.Scale.X != 0.0 || e.DeltaManipulation.Scale.Y != 0.0) )
            {
                e.Handled = true;
                e.Complete();
            }
            // optionally suppress scrolling
            if (ScrollDisabled && (e.DeltaManipulation.Translation.X != 0.0 || e.DeltaManipulation.Translation.Y != 0.0) )
            {
                e.Handled = true;
                e.Complete();
            }
        }

    }
}
