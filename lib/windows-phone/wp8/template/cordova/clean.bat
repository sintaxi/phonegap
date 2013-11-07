@ECHO OFF
SET script_path="%~dp0lib\clean.js"
IF EXIST %script_path% (
    cscript %script_path% %* //nologo
) ELSE (
    ECHO.
    ECHO ERROR: Could not find 'clean.js' in cordova/lib, aborting...>&2
    EXIT /B 1
)