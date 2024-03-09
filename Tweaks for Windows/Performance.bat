@echo off
REM Removing The Intel Dynamic Platform and Thermal Framework (DPTF) - Start
@Rem "1"="*INT3400"
@Rem "2"="*INT3402"
@Rem "3"="*INT3403"
@Rem "4"="*INT3404"
@Rem "5"="*INT3407"
@Rem "6"="*INT3409"
@Rem "7"="PCI\\VEN_8086&DEV_1603&CC_1180"
@Rem "8"="PCI\\VEN_8086&DEV_1903&CC_1180"
@Rem "9"="PCI\\VEN_8086&DEV_8A03&CC_1180"
@Rem "10"="PCI\\VEN_8086&DEV_9C24&CC_1180"
@Rem "11"="PCI\\VEN_8086&DEV_A131&CC_1180"
@Rem "12"="PCI\\VEN_8086&DEV_9A03&CC_1180"
@Rem "13"="*INTC1040"
@Rem "14"="*INTC1043"
@Rem "15"="*INTC1044"
@Rem "16"="*INTC1045"
@Rem Optimizing Network Connection - Start
netsh int tcp show global
netsh int tcp set global chimney=enabled
netsh int tcp set heuristics disabled
netsh int tcp set global autotuninglevel=normal
netsh int tcp set supplemental custom congestionprovider=ctcp
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /t REG_DWORD /d 0 /f
@Rem Optimizing Network Connection - End

REM Importing Power Plans - Start
powercfg -Import "%~dp0UPC.pow"
pause
powercfg -Import "%~dp0HPC.pow"
pause
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
pause
REM Importing Power Plans - End

REM Removing High Precision Event Timer (HPET) - Start
bcdedit /deletevalue useplatformclock
bcdedit /set disabledynamictick yes
REM Removing High Precision Event Timer (HPET) - End

REM Enabling AVX - Start
bcdedit /set xsavedisable 0
REM Enabling AVX - End

pause

REM Import Registry Files - Start
regedit /s %~dp0Registry Tweaks to Make Windows Faster.reg /f

IF %ERRORLEVEL% EQU 0 (
  echo Registry Tweaks to Make Windows Faster.reg imported successfully.
) ELSE (
  echo Registry Tweaks to Make Windows Faster.reg imported failed.
)

pause

regedit /s %~dp0TakeControl.reg /f

IF %ERRORLEVEL% EQU 0 (
  echo TakeControl.reg imported successfully.
) ELSE (
  echo TakeControl.reg imported failed.
)
REM Import Registry Files - Start

PNPUTIL /disable-device /deviceid "*INTC1040"
PNPUTIL /disable-device /deviceid "*INTC1041"
PNPUTIL /disable-device /deviceid "*INTC1043"
PNPUTIL /disable-device /deviceid "*INTC1044"
PNPUTIL /disable-device /deviceid "*INTC1045"
PNPUTIL /disable-device /deviceid "*INTC1046"
PNPUTIL /disable-device /deviceid "*INTC10A0"
PNPUTIL /disable-device /deviceid "*INTC10A1"
PNPUTIL /disable-device /deviceid "*INT3400"
PNPUTIL /disable-device /deviceid "*INT3402"
PNPUTIL /disable-device /deviceid "*INT3403"
PNPUTIL /disable-device /deviceid "*INT3404"
PNPUTIL /disable-device /deviceid "*INT3407"
PNPUTIL /disable-device /deviceid "*INT3409"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1603&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1903&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_461D&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_8A03&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9A03&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9C24&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_A131&CC_1180"
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_A71D&CC_1180"

pause
