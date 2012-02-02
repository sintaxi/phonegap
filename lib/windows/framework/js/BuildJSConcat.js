// JSConcat

var versionStr = "1.4.1";
var allSourceFiles = [
	"disclaimer.txt",
	"phonegap.js.base",
	"accelerometer.js",
	"camera.js",
	"capture.js",
	"compass.js",
	"contact.js",
	"debugConsole.js",
	"device.js",
	"DOMStorage.js",
	"file.js",
	"filetransfer.js",
	"media.js",
	"network.js",
	"notification.js",
	"PGXHR.js"
];

var coreSourceFiles =   [
	"disclaimer.txt",
	"phonegap.js.base",
	"debugConsole.js",
	"device.js",
	"DOMStorage.js",
	"file.js",
	"filetransfer.js",
	"network.js",
	"notification.js",
	"PGXHR.js"
];

var objArgs = WScript.Arguments;
if(objArgs && objArgs.length > 0)
{
    versionStr = objArgs(0);
}

var fso = WScript.CreateObject("Scripting.FileSystemObject");

var folder = fso.GetFolder(".");

var outFile = fso.CreateTextFile("phonegap-" + versionStr + ".js", true);

for(var n = 0; n < allSourceFiles.length; n++)
{
    var srcFile = fso.OpenTextFile(allSourceFiles[n]);
    while(!srcFile.AtEndOfStream)
    {
        outFile.WriteLine(srcFile.ReadLine());
    }
    outFile.WriteLine("");
}

var outFile = fso.CreateTextFile("phonegap-" + versionStr + "-core.js", true);
for(var n = 0; n < coreSourceFiles.length; n++)
{
    var srcFile = fso.OpenTextFile(coreSourceFiles[n]);
    while(!srcFile.AtEndOfStream)
    {
        outFile.WriteLine(srcFile.ReadLine());
    }
    outFile.WriteLine("");
}




