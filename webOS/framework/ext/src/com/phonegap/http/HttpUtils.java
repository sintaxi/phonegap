/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi
 * Copyright (c) 2010, IBM Corporation
 */ 
package com.phonegap.http;

import javax.microedition.io.HttpConnection;

import net.rim.device.api.io.transport.ConnectionDescriptor;
import net.rim.device.api.io.transport.ConnectionFactory;

import com.phonegap.PhoneGapExtension;

/**
 * BlackBerry devices can connect to the network using a variety of transport 
 * types, such as: WI-FI, BES/MDS, BIS, WAP (cellular).  A connection URL must 
 * have the appropriate suffix to match the transport type.  This class contains 
 * utility methods to retrieve the correct URL for the appropriate transport.
 */
public class HttpUtils 
{
    /**
     * This method will open an HTTP connection over the best available transport type. 
     * @param url   Connection URL
     */
    public static HttpConnection getHttpConnection(String url) 
    {
        HttpConnection httpConn = null;
        
        // Create ConnectionFactory
        ConnectionFactory factory = new ConnectionFactory();

        // use the factory to get a connection
        ConnectionDescriptor conDescriptor = factory.getConnection(url);

        if (conDescriptor != null) {
           // using the connection
           httpConn = (HttpConnection) conDescriptor.getConnection();
        }
        
        return httpConn;
    }
    
    /**
     * Retrieves the cookie from the application browser instance for the specified URL.
     * @param url   Connection URL
     */
    public static String getCookie(String url)
    {
        return PhoneGapExtension.getBrowserField().getCookieManager().getCookie(url);
    }
}
