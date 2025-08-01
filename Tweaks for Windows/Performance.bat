@echo off
title Optimizing Windows

:: ============================================================
:: Check for administrative privileges and elevate if necessary
:: ============================================================
cd /d "%~dp0" && (
    if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs"
) && (
    fsutil dirty query %systemdrive% 1>nul 2>nul || (
        echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %*", "", "runas", 1 >> "%temp%\getadmin.vbs"
        "%temp%\getadmin.vbs" && exit /B
    )
)

:: ============================================================
:: Disable All Device Manager Power Management
:: ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance -ClassName MSPower_DeviceEnable -Namespace root/WMI | Set-CimInstance -Property @{Enable = $false}"
if %errorlevel% equ 0 (
    echo Device Manager Power Management removal succeeded.
) else (
    echo Device Manager Power Management removal failed.
)

:: ============================================================
:: Removing The Intel Dynamic Platform and Thermal Framework (DPTF)
:: ============================================================
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

if %errorlevel% equ 0 (
    echo DPTF removal succeeded.
) else (
    echo DPTF removal failed.
)

:: ============================================================
:: Optimizing Network Connection
:: ============================================================
netsh int tcp set global chimney=enabled >nul 2>&1
netsh int tcp set heuristics disabled >nul 2>&1
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set supplemental custom congestionprovider=ctcp >nul 2>&1
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /t REG_DWORD /d 0 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo Network optimization succeeded.
) else (
    echo Network optimization failed.
)

:: ============================================================
:: Importing Power Plans
:: ============================================================
powercfg -Import "%~dp0UPC.pow" >nul 2>&1
powercfg -Import "%~dp0HPC.pow" >nul 2>&1
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1
if %errorlevel% equ 0 (
    echo Power plans import succeeded.
) else (
    echo Power plans import failed.
)

:: ============================================================
:: Removing High Precision Event Timer (HPET)
:: ============================================================
bcdedit /deletevalue useplatformclock >nul 2>&1
bcdedit /set disabledynamictick yes >nul 2>&1
if %errorlevel% equ 0 (
    echo HPET removal succeeded.
) else (
    echo HPET removal failed.
)

:: ============================================================
:: Disabling Modern Standby
:: ============================================================
reg add "HKLM\System\CurrentControlSet\Control\Power" /v PlatformAoAcOverride /t REG_DWORD /d 0 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo Disabling Modern Standby succeeded.
) else (
    echo Disabling Modern Standby failed.
)

:: ============================================================
:: Disabling Modern Context Menu
:: ============================================================
reg add HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32 /f /ve >nul 2>&1
if %errorlevel% equ 0 (
    echo Disabling Modern Context Menu succeeded.
) else (
    echo Disabling Modern Context Menu failed.
)

:: ============================================================
:: Enabling AVX
:: ============================================================
bcdedit /set xsavedisable 0 >nul 2>&1
if %errorlevel% equ 0 (
    echo AVX enabling succeeded.
) else (
    echo AVX enabling failed.
)

pause

:: ============================================================
:: Import Registry Tweaks
:: ============================================================
regedit /s "%~dp0Registry Tweaks to Make Windows Faster.reg" >nul 2>&1
if %errorlevel% equ 0 (
    echo Registry Tweaks import succeeded.
) else (
    echo Registry Tweaks import failed.
)

:: ============================================================
:: Displaying message for TakeControl.reg import
:: ============================================================
regedit /s "%~dp0TakeControl.reg" >nul 2>&1
if %errorlevel% equ 0 (
    echo TakeControl.reg imported successfully.
) else (
    echo TakeControl.reg import failed.
)

:: ============================================================
:: Applying HMB Tweaks via PowerShell script
:: ============================================================
if exist "%~dp0Force HMB to use 64 MB.ps1" (
    echo Executing "Force HMB to use 64 MB.ps1"...
    powershell -Command "Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0Force HMB to use 64 MB.ps1\"' -Verb RunAs"
    if %errorlevel% equ 0 (
        echo Force HMB to use 64 MB.ps1 executed successfully.
    ) else (
        echo WARNING: Force HMB to use 64 MB.ps1 may have failed. Errorlevel: %errorlevel%
    )
) else (
    echo WARNING: "Force HMB to use 64 MB.ps1" not found. Skipping.
)

:: ============================================================
:: Final message
:: ============================================================
echo.
echo ============================================================
echo ✅ Performance tweaks have been successfully applied.
echo 🔄 Please restart your computer for all changes to take effect.
echo ============================================================
echo.
pause
