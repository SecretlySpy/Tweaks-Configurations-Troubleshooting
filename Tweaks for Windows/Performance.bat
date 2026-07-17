@echo off
setlocal
title Optimizing Windows

:: ===========================================================================
:: Administrator Elevation (standardized, XP -> 11)
:: `net session` returns 0 only when already elevated. On UAC systems we
:: relaunch via PowerShell's RunAs verb; a VBS ShellExecute "runas" fallback
:: covers machines without PowerShell.
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
cd /d "%~dp0"

:: ===========================================================================
:: Windows 10+ guard
:: This script relies on features that do not exist before Windows 10:
:: `pnputil /disable-device` (10 2004+), the Ultimate Performance power scheme
:: (10 1803+), Modern Standby / PlatformAoAcOverride, and StorPort HMB tuning.
:: Refuse cleanly on older Windows instead of emitting a cascade of errors.
:: ===========================================================================
set "_maj=0"
for /f "tokens=2 delims=[]" %%i in ('ver') do set "_v=%%i"
for /f "tokens=2 delims=. " %%a in ("%_v%") do set "_maj=%%a"
if %_maj% LSS 10 (
    echo.
    echo   This performance script requires Windows 10 or later.
    echo   Detected major version %_maj%. No changes have been made.
    echo.
    pause
    exit /b 1
)

:: ============================================================
:: Disable all Device Manager power management.
:: Try the modern CIM cmdlet first; fall back to WMI (Get-WmiObject)
:: if CIM is unavailable for any reason.
:: ============================================================
echo [*] Disabling Device Manager power management...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Get-CimInstance -ClassName MSPower_DeviceEnable -Namespace root/WMI -ErrorAction Stop | Set-CimInstance -Property @{Enable=$false} } catch { Get-WmiObject -Class MSPower_DeviceEnable -Namespace root/WMI | ForEach-Object { $_.Enable = $false; $_.Put() | Out-Null } }"

:: ============================================================
:: Disable the Intel Dynamic Platform and Thermal Framework (DPTF).
:: Errors are suppressed: not every device ID exists on every machine.
:: ============================================================
echo [*] Disabling Intel DPTF devices (absent IDs are skipped)...
PNPUTIL /disable-device /deviceid "*INT3400" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3402" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3403" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3404" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3407" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3409" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1040" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1041" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1043" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1044" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1045" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC1046" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC10A0" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INTC10A1" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1603&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1903&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_461D&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_8A03&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9A03&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9C24&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_A131&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_A71D&CC_1180" >nul 2>&1

:: ============================================================
:: Disable telemetry (DiagTrack) service.
:: ============================================================
echo [*] Disabling telemetry (DiagTrack) service...
sc config DiagTrack start= disabled >nul 2>&1
sc stop DiagTrack >nul 2>&1

:: ============================================================
:: Optimize the TCP/IP stack.
:: ============================================================
echo [*] Applying network optimizations...
netsh int tcp set global chimney=enabled >nul 2>&1
netsh int tcp set heuristics disabled >nul 2>&1
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set global rss=enabled >nul 2>&1
netsh int tcp set global rsc=enabled >nul 2>&1
netsh int tcp set global ecncapability=enabled >nul 2>&1
netsh int tcp set supplemental custom congestionprovider=ctcp >nul 2>&1
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /t REG_DWORD /d 0 /f >nul 2>&1

:: ============================================================
:: Import the bundled power plans.
:: ============================================================
echo [*] Importing power plans (UPC.pow, HPC.pow, Ultimate Performance)...
powercfg -Import "%~dp0UPC.pow" >nul 2>&1
powercfg -Import "%~dp0HPC.pow" >nul 2>&1
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1

:: ============================================================
:: Remove the High Precision Event Timer (HPET) / dynamic tick.
:: ============================================================
echo [*] Adjusting platform timers (HPET / dynamic tick)...
bcdedit /deletevalue useplatformclock >nul 2>&1
bcdedit /set disabledynamictick yes >nul 2>&1

:: ============================================================
:: Disable Modern Standby (AoAc).
:: ============================================================
echo [*] Disabling Modern Standby...
reg add "HKLM\System\CurrentControlSet\Control\Power" /v PlatformAoAcOverride /t REG_DWORD /d 0 /f >nul 2>&1

:: ============================================================
:: Restore the classic (Windows 10) context menu on Windows 11.
:: ============================================================
echo [*] Setting classic context menu...
reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve >nul 2>&1

:: ============================================================
:: Ensure AVX is enabled (clear xsavedisable).
:: ============================================================
echo [*] Ensuring AVX is enabled...
bcdedit /set xsavedisable 0 >nul 2>&1

echo.
echo Press any key to import the registry tweak packs...
pause

:: ============================================================
:: Import registry tweak packs (relative to this script's folder).
:: ============================================================
echo [*] Importing "Registry Tweaks to Make Windows Faster.reg"...
regedit /s "%~dp0Registry Tweaks to Make Windows Faster.reg"
echo [*] Importing "TakeControl.reg"...
regedit /s "%~dp0TakeControl.reg"

:: ============================================================
:: Apply the NVMe Host Memory Buffer tweak. We are already elevated,
:: so call the PowerShell script directly (no second RunAs prompt).
:: ============================================================
if exist "%~dp0Force HMB to use 64 MB.ps1" (
    echo [*] Applying "Force HMB to use 64 MB.ps1"...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Force HMB to use 64 MB.ps1"
) else (
    echo WARNING: "Force HMB to use 64 MB.ps1" not found. Skipping.
)

:: Re-enable TRIM notifications (undo any prior DisableDeleteNotify=1).
fsutil behavior set DisableDeleteNotify 0 >nul 2>&1

echo.
echo ============================================================
echo Performance tweaks have been applied.
echo Please restart your computer for all changes to take effect.
echo ============================================================
echo.
pause
exit /b
