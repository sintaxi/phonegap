@ECHO OFF
SET script_path="%~dp0target-list.js"
IF EXIST %script_path% (
    cscript %script_path% %* --emulators //nologo
) ELSE (
    ECHO. 
    ECHO ERROR: Could not find 'target-list.js' in cordova/lib, aborting...>&2
    EXIT /B 1
)