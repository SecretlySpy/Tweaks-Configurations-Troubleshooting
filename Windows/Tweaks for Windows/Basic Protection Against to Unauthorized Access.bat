@echo off
setlocal
title SecretlySpy - Security Enhancement Script
color 0b

:: ===========================================================================
:: Section 1: Administrator Elevation (standardized, XP -> 11)
:: `net session` returns 0 only in an elevated context. On UAC systems
:: (Vista+) we relaunch through PowerShell's RunAs verb; if PowerShell is not
:: present (e.g. stock Windows XP) we fall back to a VBS Shell.Application
:: ShellExecute "runas" so the script still self-elevates instead of failing.
:: ===========================================================================
echo Checking for administrator privileges...
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
echo Success: Running with administrator privileges.
echo.

:: ===========================================================================
:: Section 2: Detect the Windows version (drives the legacy fallbacks below)
:: Parsed from `ver` so it is locale-independent: XP=5.1, Vista=6.0, 7=6.1,
:: 8=6.2, 8.1=6.3, 10/11=10.0. Some hardening commands below only exist on
:: newer releases, so each section adapts to what this OS actually supports.
:: ===========================================================================
set "_maj=0" & set "_min=0" & set "_bld=0"
for /f "tokens=2 delims=[]" %%i in ('ver') do set "_v=%%i"
for /f "tokens=2-4 delims=. " %%a in ("%_v%") do (set "_maj=%%a" & set "_min=%%b" & set "_bld=%%c")
echo Detected Windows version %_maj%.%_min% (build %_bld%).
echo.

:: ===========================================================================
:: Section 3: Enable and Configure the Firewall
:: `netsh advfirewall` exists on Vista+ (major >= 6). Windows XP predates it
:: and uses the older `netsh firewall` context (no per-profile inbound policy).
:: ===========================================================================
echo [+] Enabling and configuring the Windows Firewall...
if %_maj% GEQ 6 (
    netsh advfirewall set allprofiles state on
    netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
    netsh advfirewall set allprofiles logging droppedconnections enable
    echo Firewall configured via advfirewall.
) else (
    netsh firewall set opmode mode=ENABLE
    echo Firewall enabled via legacy netsh firewall ^(XP: limited options^).
)
echo.

:: ===========================================================================
:: Section 4: Basic Security Auditing
:: Granular `auditpol` subcategories exist on Vista+ only. Windows XP has no
:: built-in equivalent, so auditing is skipped there with a notice.
:: ===========================================================================
echo [+] Configuring basic security audit policies...
if %_maj% GEQ 6 (
    auditpol /set /category:"Account Logon" /subcategory:"Credential Validation" /failure:enable
    auditpol /set /category:"Logon/Logoff" /subcategory:"Logon" /success:enable /failure:enable
    echo Audit policies configured.
) else (
    echo Skipped: granular auditpol is unavailable on Windows XP.
)
echo.

:: ===========================================================================
:: Section 5: Disable the Insecure SMBv1 Protocol
:: SMBv1 (exploited by WannaCry) is removed as an optional feature via DISM on
:: Windows 8+ (major 10, or major 6 with minor >= 2). On Vista/7 the feature
:: cannot be removed, but SMBv1 server support is turned off via the
:: LanmanServer\Parameters\SMB1 value (reboot required). XP cannot disable it.
:: ===========================================================================
echo [+] Disabling insecure SMBv1 protocol...
set "_smbDism="
if %_maj% GEQ 10 set "_smbDism=1"
if "%_maj%"=="6" if %_min% GEQ 2 set "_smbDism=1"
if defined _smbDism (
    dism /online /Disable-Feature /FeatureName:SMB1Protocol /NoRestart
    echo SMBv1 feature disabled via DISM. A restart may be required.
) else (
    if %_maj% GEQ 6 (
        reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" /v SMB1 /t REG_DWORD /d 0 /f >nul
        echo SMBv1 server disabled via registry ^(Vista/7^). A restart is required.
    ) else (
        echo Skipped: SMBv1 cannot be disabled on Windows XP.
    )
)
echo.

echo ---
echo Security enhancements applied (as supported by this Windows version).
echo It is recommended to restart your computer.
pause
exit /b
