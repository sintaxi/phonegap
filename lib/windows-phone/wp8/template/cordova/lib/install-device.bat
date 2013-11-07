@ECHO OFF
SET script_path="%~dp0deploy.js"
IF EXIST %script_path% (
    cscript %script_path% %* --device --nobuild //nologo
) ELSE (
    ECHO.
    ECHO ERROR: Could not find 'deploy.js' in cordova/lib, aborting...>&2
    EXIT /B 1
)