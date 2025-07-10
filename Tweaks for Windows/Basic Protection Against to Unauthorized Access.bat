@echo off
setlocal
title SecretlySpy - Security Enhancement Script
color 0b

::--------------------------------------------------------------------------------
:: Section 1: Administrator Elevation
:: This section ensures the script is run with the necessary administrator rights.
:: It's a safe and standard way to trigger the UAC prompt.
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
:: Section 2: Enable and Configure Windows Defender Firewall
:: The firewall is your first line of defense against network threats.
::--------------------------------------------------------------------------------
echo [+] Enabling and configuring Windows Defender Firewall...
:: Turn on the firewall for all profiles (Domain, Private, Public)
netsh advfirewall set allprofiles state on
:: Block all inbound connections by default, allow outbound
netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
:: Enable logging for dropped packets (useful for troubleshooting)
netsh advfirewall set allprofiles logging droppedconnections enable
echo Firewall configured successfully.
echo.

::--------------------------------------------------------------------------------
:: Section 3: Basic System Auditing
:: This logs important security events, like failed login attempts.
:: This doesn't prevent attacks, but provides a crucial log for investigation.
::--------------------------------------------------------------------------------
echo [+] Configuring basic security audit policies...
:: Audit failed account logon attempts
auditpol /set /category:"Account Logon" /subcategory:"Credential Validation" /failure:enable
:: Audit successful and failed logon events (who is accessing the machine)
auditpol /set /category:"Logon/Logoff" /subcategory:"Logon" /success:enable /failure:enable
echo Audit policies configured successfully.
echo.

::--------------------------------------------------------------------------------
:: Section 4: Disable Known Insecure Protocols (Optional but Recommended)
:: SMBv1 is an outdated and insecure protocol exploited by ransomware like WannaCry.
::--------------------------------------------------------------------------------
echo [+] Disabling insecure SMBv1 protocol...
dism /online /Disable-Feature /FeatureName:SMB1Protocol /NoRestart
echo SMBv1 disabled successfully. You may need to restart for this to fully apply.
echo.


echo ---
echo Security enhancements applied successfully.
echo It is recommended to restart your computer.
pause
exit