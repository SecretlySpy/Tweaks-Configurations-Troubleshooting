@echo off
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t REG_DWORD /d 2 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t REG_DWORD /d 2 /f

REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t REG_DWORD /d 2 /f
REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t REG_DWORD /d 2 /f
REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 1 /f
REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\CI\Policy" /v "VerifiedAndReputablePolicyState" /t REG_DWORD /d 1 /f
REG ADD "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f
REG ADD "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f
REG ADD "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t REG_DWORD /d 5 /f

pause

regedit /s %~dp0Enable Windows Security.reg /f
IF %ERRORLEVEL% EQU 0 (
  echo Enable Windows Security.reg imported successfully.
) ELSE (
  echo Enable Windows Security.reg imported failed.
)

pause

call "%~dp0\Basic Protection Against to Unauthorized Access.bat"
IF %ERRORLEVEL% EQU 0 (
  echo Basic Protection Against to Unauthorized Access.bat executed successfully.
) ELSE (
  echo Basic Protection Against to Unauthorized Access.bat executed failed.
)

pause