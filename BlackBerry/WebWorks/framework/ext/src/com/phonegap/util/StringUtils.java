/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 * 
 * Taken from Research in Motion knowledge base article: 
 * 
 * DB-00728: "How To - Implement a string splitter based on a given string delimiter", 24 March 2009.
 * http://www.blackberry.com/knowledgecenterpublic/livelink.exe/fetch/2000/348583/800332/832062/How_To_-_Implement_a_string_splitter_based_on_a_given_string_delimiter.html?nodeid=1498848&vernum=0
 */
package com.phonegap.util;

/**
 * Provides various string utility methods. 
 */
public class StringUtils {

    //Identifies the substrings in a given string that are delimited
    //by one or more characters specified in an array, and then
    //places the substrings into a String array.
    public static String[] split(String strString, String strDelimiter) {
        String[] strArray;
        int iOccurrences = 0;
        int iIndexOfInnerString = 0;
        int iIndexOfDelimiter = 0;
        int iCounter = 0;

        //Check for null input strings.
        if (strString == null) {
            throw new IllegalArgumentException("Input string cannot be null.");
        }
        //Check for null or empty delimiter strings.
        if (strDelimiter.length() <= 0 || strDelimiter == null) {
            throw new IllegalArgumentException("Delimeter cannot be null or empty.");
        }

        //strString must be in this format: (without {} )
        //"{str[0]}{delimiter}str[1]}{delimiter} ...
        // {str[n-1]}{delimiter}{str[n]}{delimiter}"

        //If strString begins with delimiter then remove it in order
        //to comply with the desired format.

        if (strString.startsWith(strDelimiter)) {
            strString = strString.substring(strDelimiter.length());
        }

        //If strString does not end with the delimiter then add it
        //to the string in order to comply with the desired format.
        if (!strString.endsWith(strDelimiter)) {
            strString += strDelimiter;
        }

        //Count occurrences of the delimiter in the string.
        //Occurrences should be the same amount of inner strings.
        while((iIndexOfDelimiter = strString.indexOf(strDelimiter,
                iIndexOfInnerString)) != -1) {
            iOccurrences += 1;
            iIndexOfInnerString = iIndexOfDelimiter +
            strDelimiter.length();
        }

        //Declare the array with the correct size.
        strArray = new String[iOccurrences];

        //Reset the indices.
        iIndexOfInnerString = 0;
        iIndexOfDelimiter = 0;

        //Walk across the string again and this time add the
        //strings to the array.
        while((iIndexOfDelimiter = strString.indexOf(strDelimiter,
                iIndexOfInnerString)) != -1) {

            //Add string to array.
            strArray[iCounter] = strString.substring(iIndexOfInnerString,iIndexOfDelimiter);

            //Increment the index to the next character after
            //the next delimiter.
            iIndexOfInnerString = iIndexOfDelimiter +
            strDelimiter.length();

            //Inc the counter.
            iCounter += 1;
        }

        return strArray;
    }
}
