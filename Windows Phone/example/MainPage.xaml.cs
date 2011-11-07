using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.Phone.Controls;
using System.IO;
using System.Windows.Media.Imaging;
using System.Windows.Resources;


namespace GapExample
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Constructor
        public MainPage()
        {
            InitializeComponent();
        }

        private void GapBrowser_Loaded(object sender, RoutedEventArgs e)
        {
            //var rs = Application.GetResourceStream(new Uri("www", UriKind.Relative));

            ////StreamReader sr = new StreamReader(rs.Stream);
            ////GapBrowser.NavigateToString(sr.ReadToEnd());

            //Uri indexUri = new Uri("www/index.html", UriKind.Relative);

            //StreamResourceInfo streamInfo = Application.GetResourceStream(indexUri);
            //if (streamInfo != null)
            //{
            //    StreamReader sr = new StreamReader(streamInfo.Stream);
            //    GapBrowser.NavigateToString(sr.ReadToEnd());
            //}

            //GapBrowser.Source = baseUri;

            //Uri uri = new Uri("/www/images/ArrowImg.png", UriKind.Relative);  
            //BitmapImage imgSource = new BitmapImage(uri);
            //this.myImage.Source = imgSource;
            
        }
    }
}