/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

package com.phonegap.json4j.internal;

public class NumberUtil {
    
    public static  boolean isNumber(Class clazz) {
        if ( (clazz == Integer.class) || (clazz == Long.class) || (clazz == Double.class) || (clazz == Short.class) || (clazz == Float.class)) {
            return true;
        }
        return false;
    }

    public static double getDouble(Object val) {
        if (val instanceof Double) {
            return ((Double)val).doubleValue();
        }
        else if (val instanceof Long) {
            return ((Long)val).doubleValue();
        }
        else if (val instanceof Short) {
            Integer i = new Integer( ((Short)val).shortValue() );
            return i.doubleValue();
        }
        else if (val instanceof Float) {
            return ((Float)val).doubleValue();
        } 
        else if (val instanceof Integer) {
            return ((Integer)val).doubleValue();
        }
        throw new IllegalArgumentException("Not a number");
    }

    public static short getShort(Object val) {
        if (val instanceof Double) {
            return ((Double)val).shortValue();
        }
        else if (val instanceof Long) {
            Double dg = new Double(((Long)val).longValue());
            return dg.shortValue();
        }
        else if (val instanceof Short) {
            return ((Short)val).shortValue();
        }
        else if (val instanceof Float) {
            return ((Float)val).shortValue();
        } else if (val instanceof Integer) {
            return ((Integer)val).shortValue();
        }
        throw new IllegalArgumentException("Not a number");
    }

    public static int getInt(Object val) {
        if (val instanceof Double) {
            return ((Double)val).intValue();
        }
        else if (val instanceof Long) {
            Double dg = new Double(((Long)val).longValue());
            return dg.intValue();
        }
        else if (val instanceof Short) {
            Double dg = new Double(((Short)val).shortValue());
            return dg.intValue();
        }
        else if (val instanceof Float) {
            return ((Float)val).intValue();
        }
        else if (val instanceof Integer) {
            return ((Integer)val).intValue();
        }
        throw new IllegalArgumentException("Not a number");
    }

    public static long getLong(Object val) {
        if (val instanceof Double) {
            return ((Double)val).longValue();
        }
        else if (val instanceof Long) {
            return ((Long)val).longValue();
        }
        else if (val instanceof Short) {
            Long lg = new Long(((Short)val).shortValue());
            return lg.longValue();
        }
        else if (val instanceof Float) {
            return ((Float)val).longValue();
        }
        else if (val instanceof Integer) {
            return ((Integer)val).longValue();
        }
        throw new IllegalArgumentException("Not a number");
    }
}
