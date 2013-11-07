@ECHO OFF
SET script_path="%~dp0lib\build.js"
IF EXIST %script_path% (
    cscript %script_path% %* //nologo
) ELSE (
    ECHO.
    ECHO ERROR: Could not find 'build.js' in cordova/lib, aborting...>&2
    EXIT /B 1
)