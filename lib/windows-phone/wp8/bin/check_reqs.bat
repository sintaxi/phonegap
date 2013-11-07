@ECHO OFF
SET script_path="%~dp0check_reqs.js"
IF EXIST %script_path% (
    cscript %script_path% %* //nologo
) ELSE (
    ECHO.
    ECHO ERROR: Could not find 'check_reqs.js' in 'bin' folder, aborting...>&2
    EXIT /B 1
)