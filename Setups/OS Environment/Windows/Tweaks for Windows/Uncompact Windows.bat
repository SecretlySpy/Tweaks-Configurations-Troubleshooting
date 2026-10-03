@echo off
setlocal
title Uncompress Windows (revert Compact Windows.bat)

:: ===========================================================================
:: Administrator Elevation (standardized, XP -> 11)
:: Undo for "Compact Windows.bat": disables CompactOS and decompresses the
:: same directory set. Needs an elevated context.
:: ===========================================================================
net session >nul 2>&1
if %errorlevel% equ 0 goto :gotAdmin
echo Requesting administrator privileges...
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
) else (
    > "%temp%\ssp_elevate.vbs" echo Set U = CreateObject^("Shell.Application"^)
    >>"%temp%\ssp_elevate.vbs" echo U.ShellExecute "%~f0", "", "", "runas", 1
    cscript //nologo "%temp%\ssp_elevate.vbs" >nul 2>&1
    del "%temp%\ssp_elevate.vbs" >nul 2>&1
)
exit /b

:gotAdmin

:: ===========================================================================
:: Windows 10+ guard (CompactOS / LZX exist only on Windows 10+).
:: ===========================================================================
set "_maj=0"
for /f "tokens=2 delims=[]" %%i in ('ver') do set "_v=%%i"
for /f "tokens=2 delims=. " %%a in ("%_v%") do set "_maj=%%a"
if %_maj% LSS 10 (
    echo.
    echo   This script requires Windows 10 or later ^(CompactOS / LZX^).
    echo   Detected major version %_maj%. No changes have been made.
    echo.
    pause
    exit /b 1
)

cls
echo ============================================================================
echo # Uncompress Windows (revert compression applied by Compact Windows.bat)
echo ============================================================================

:: Turn off system-wide CompactOS.
Compact /CompactOS:never

:: Same directory set as Compact Windows.bat. `set paths=...` WITHOUT wrapping
:: quotes so each path keeps its own quotes (see note in Compact Windows.bat).
set paths="%programFiles(x86)%" "%programFiles%" "C:\ProgramData" "C:\Users" "%windir%\Assembly" "%windir%\InfusedApps" "%windir%\Panther" "%windir%\SoftwareDistribution" "%windir%\System32\Catroot2" "%windir%\System32\LogFiles"

:: Decompress recursively. /i ignores per-file sharing violations so in-use
:: system files do not abort the pass.
for %%p in (%paths%) do (
    compact /u /s /a /i "%%~p\*"
)

echo.
echo Decompression pass complete. A restart is recommended.
pause
exit /b
