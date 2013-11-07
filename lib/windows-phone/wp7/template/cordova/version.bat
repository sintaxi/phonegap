@ECHO OFF
SET script_path="%~dp0..\VERSION"
IF EXIST %script_path% (
    type %script_path%
) ELSE (
    ECHO.
    ECHO ERROR: Could not find file VERSION in project folder, path tried was %script_path% >&2
    EXIT /B 1
)