/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.api;

import java.io.IOException;
import java.util.Hashtable;

import net.rim.device.api.script.Scriptable;
import net.rim.device.api.script.ScriptableFunction;

import com.phonegap.PhoneGapExtension;
import com.phonegap.file.FileUtils;
import com.phonegap.util.Logger;

/**
 * PluginManager represents an object in the script engine. It can be accessed
 * from the script environment using <code>phonegap.PluginManager</code>.
 * 
 * PluginManager provides a function, <code>exec</code>, that can be invoked 
 * from the script environment: <code>phonegap.PluginManager.exec(...)</code>.  
 * Invoking this function causes the script engine to load the appropriate 
 * PhoneGap Plugin and perform the specified action.
 */
public final class PluginManager extends Scriptable {
	
    /**
     * Field used to invoke Plugin actions.
     */
    public static String FIELD_EXEC = "exec";	
    
    /**
     * Field used to cleanup Plugins.
     */
    public static String FIELD_DESTROY = "destroy";
    
    /**
     * Field used to indicate application has been brought to foreground.
     */
    public static String FIELD_RESUME = "resume";
    
    /**
     * Field used to indicate application has been sent to background
     */
    public static String FIELD_PAUSE = "pause";
    
    /**
     * Field used to register a Plugin.
     */
    public static String FIELD_ADD_PLUGIN = "addPlugin";
    
    /**
     * Loads the appropriate PhoneGap Plugins and invokes their actions.
     */
    private final PluginManagerFunction pluginManagerFunction;
    
    /**
     * Maps available services to Java class names.
     */
    private Hashtable services = new Hashtable();

    /**
     * Constructor.  Adds available PhoneGap services.
     * @param ext   The PhoneGap JavaScript Extension
     */
    public PluginManager(PhoneGapExtension ext) {
        this.pluginManagerFunction = new PluginManagerFunction(ext, this);
        this.addService("Camera", "com.phonegap.camera.Camera");
        this.addService("Network Status", "com.phonegap.network.Network");
        this.addService("Notification", "com.phonegap.notification.Notification");
        this.addService("Accelerometer", "com.phonegap.accelerometer.Accelerometer");
        this.addService("Geolocation", "com.phonegap.geolocation.Geolocation");
        this.addService("File", "com.phonegap.file.FileManager");
        this.addService("FileTransfer", "com.phonegap.http.FileTransfer");
        this.addService("Contact", "com.phonegap.pim.Contact");
        this.addService("MediaCapture", "com.phonegap.media.MediaCapture");
    }
	
    /**
     * The following fields are supported from the script environment:
     * 
     *  <code>phonegap.pluginManager.exec</code> - Loads the appropriate 
     *  Plugin and invokes the specified action.
     *  
     *  <code>phonegap.pluginManager.destroy</code> - Invokes the <code>onDestroy</code>
     *  method on all Plugins to give them a chance to cleanup before exit.
     */
    public Object getField(String name) throws Exception {
        if (name.equals(FIELD_EXEC)) {
            return this.pluginManagerFunction;
        }
        else if (name.equals(FIELD_DESTROY)) {
            final PluginManagerFunction plugin_mgr = this.pluginManagerFunction;
            return new ScriptableFunction() {
                public Object invoke(Object obj, Object[] oargs) throws Exception {
                    // allow plugins to clean up
                    plugin_mgr.onDestroy();
                    
                    // delete temporary application directory
                    // NOTE: doing this on a background thread doesn't work
                    // because the app is closing and the thread is killed before it completes
                    try { 
                        FileUtils.deleteApplicationTempDirectory(); 
                    } 
                    catch (IOException e) {
                        Logger.log(this.getClass().getName() + ": error deleting application temp directory: " +e);
                    }
                    
                    return null;
                }
            };
        }
        else if (name.equals(FIELD_RESUME)) {
            final PluginManagerFunction plugin_mgr = this.pluginManagerFunction;
            return new ScriptableFunction() {
                public Object invoke(Object obj, Object[] oargs) throws Exception {
                    plugin_mgr.onResume();
                    return null;
                }
            };
        }
        else if (name.equals(FIELD_PAUSE)) {
            final PluginManagerFunction plugin_mgr = this.pluginManagerFunction;
            return new ScriptableFunction() {
                public Object invoke(Object obj, Object[] oargs) throws Exception {
                    plugin_mgr.onPause();
                    return null;
                }
            };
        }
        else if (name.equals(FIELD_ADD_PLUGIN)) {
            final PluginManager plugin_mgr = this;
            return new ScriptableFunction() {
                public Object invoke(Object obj, Object[] oargs) throws Exception {
                    if (oargs.length > 1) {
                        final String service = (String)oargs[0];
                        final String className = (String)oargs[1];
                        Logger.log("Registering plugin ["+service+":"+className+"]");
                        plugin_mgr.addService(service, className);
                    }
                    return null;
                }
            };
        }
        return super.getField(name);
    }
    
    /**
     * Add a class that implements a service.
     * 
     * @param serviceName   The service name.
     * @param className     The Java class name that implements the service.
     */
    public void addService(String serviceName, String className) {
        this.services.put(serviceName, className);
    }
    
    /**
     * Get the class that implements a service.
     * 
     * @param serviceName   The service name.
     * @return The Java class name that implements the service.
     */
    public String getClassForService(String serviceName) {
        return (String)this.services.get(serviceName);
    }    
}