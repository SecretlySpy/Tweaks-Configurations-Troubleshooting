@echo off
setlocal
title Compressed Windows for smaller size

:: ===========================================================================
:: Administrator Elevation (standardized, XP -> 11)
:: CompactOS needs an elevated context. `net session` returns 0 only when
:: already elevated; otherwise relaunch via PowerShell RunAs (VBS fallback for
:: machines without PowerShell).
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
:: Windows 10+ guard
:: `Compact /CompactOS:always` and the LZX algorithm (`/exe:lzx`) were both
:: introduced in Windows 10. Windows 8.1 and earlier have neither switch, so
:: refuse cleanly rather than emit "invalid parameter" errors.
:: ===========================================================================
set "_maj=0"
for /f "tokens=2 delims=[]" %%i in ('ver') do set "_v=%%i"
for /f "tokens=2 delims=. " %%a in ("%_v%") do set "_maj=%%a"
if %_maj% LSS 10 (
    echo.
    echo   This script requires Windows 10 or later ^(CompactOS / LZX compression^).
    echo   Detected major version %_maj%. No changes have been made.
    echo.
    pause
    exit /b 1
)

cls
echo ============================================================================
echo # Compressed Windows for smaller size
echo ============================================================================

:: Enable system-wide CompactOS.
Compact /CompactOS:always

:: Directories to compress. NOTE: use `set paths=...` WITHOUT wrapping quotes.
:: `set "paths=..."` would strip the first path's opening quote, leaving
:: C:\Program Files (x86)" unquoted so its "(x86)" parenthesis breaks the `for`
:: (the original script's per-directory compression silently failed for this
:: reason). Written this way, each path keeps its own quotes.
set paths="%programFiles(x86)%" "%programFiles%" "C:\ProgramData" "C:\Users" "%windir%\Assembly" "%windir%\InfusedApps" "%windir%\Panther" "%windir%\SoftwareDistribution" "%windir%\System32\Catroot2" "%windir%\System32\LogFiles"

:: Compress recursively with LZX. /i ignores per-file sharing violations so
:: in-use system files (SoftwareDistribution, Catroot2) do not abort the pass.
for %%p in (%paths%) do (
    compact /c /s /a /i /exe:lzx "%%~p\*"
)

echo.
echo Compression pass complete. A restart is recommended.
pause
exit /b
