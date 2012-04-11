
var objArgs = WScript.Arguments;
for (i = 0; i < objArgs.length; i++) {
    WScript.Echo("Arg :: " + objArgs(i));
}

var projectFilePath = null;
if (objArgs && objArgs.length > 0) {
    projectFilePath = objArgs(0);
}


var fso = WScript.CreateObject("Scripting.FileSystemObject");
var outFile = fso.CreateTextFile("..\\..\\CordovaSourceDictionary.xml", true);

outFile.WriteLine('<?xml version="1.0" encoding="utf-8"?>');
outFile.WriteLine('<!-- This file is auto-generated, do not edit! -jm -->');
outFile.WriteLine('<CordovaSourceDictionary>');

// We need to get any Linked files from the project

WScript.Echo("Adding Source Files ...");
if (projectFilePath != null) {
    var projXml = WScript.CreateObject("Microsoft.XMLDOM");

    projXml.async = false;
    if (projXml.load(projectFilePath)) {

        // add linked content ( windows shortcuts )
        var nodes = projXml.selectNodes("/Project/ItemGroup/Content/Link");
        WScript.Echo("/Project/ItemGroup/Content/Link nodes.length" + nodes.length);
        for (var n = 0; n < nodes.length; n++) {
            outFile.WriteLine('    <FilePath Value="' + nodes[n].text + '"/>');
        }

        // add files of type Resource
        nodes = projXml.selectNodes("/Project/ItemGroup/Resource/Link");
        WScript.Echo("/Project/ItemGroup/Resource/Link nodes.length" + nodes.length);
        for (n = 0; n < nodes.length; n++) {
            outFile.WriteLine('    <FilePath Value="' + nodes[n].text + '"/>');
        }

        // add Content files from www folder
        nodes = projXml.selectNodes("/Project/ItemGroup/Content[@Include]");
        WScript.Echo("/Project/ItemGroup/Content nodes.length" + nodes.length);
        for (n = 0; n < nodes.length; n++) {
            for (var i = 0; i < nodes[n].attributes.length; i++) {

                if (nodes[n].attributes[i].name == "Include") {
                    var val = nodes[n].attributes[i].value;
                    if (val.indexOf("www") == 0) {
                        WScript.Echo("adding value :: " + val);
                        outFile.WriteLine('    <FilePath Value="' + val + '"/>');
                    }
                }
            }
            
        }
    }
}

outFile.WriteLine('</CordovaSourceDictionary>');

