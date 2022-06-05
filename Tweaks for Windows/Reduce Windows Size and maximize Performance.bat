@echo off
title Optimize Windows for better performance&cls&echo ============================================================================&echo # Optimize Windows for better performance&echo ============================================================================
cd\
netsh int tcp show global
netsh int tcp set global chimney=enabled
netsh int tcp set heuristics disabled
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global congestionprovider=ctcp
bcdedit /deletevalue useplatformclock
bcdedit /set disabledynamictick yes
bcdedit /set xsavedisable 0
Compact /CompactOS:always
compact /c /s /a /i /exe:lzx %programFiles(x86)%\*
compact /c /s /a /i /exe:lzx %programFiles%
compact /c /s /a /i /exe:lzx "C:\ProgramData\*"
compact /c /s /a /i /exe:lzx "C:\Users\*"
compact /c /s /a /i /exe:lzx %windir%\Assembly\*
compact /c /s /a /i /exe:lzx %windir%\InfusedApps\*
compact /c /s /a /i /exe:lzx %windir%\Panther\*
compact /c /s /a /i /exe:lzx %windir%\SoftwareDistribution\*
compact /c /s /a /i /exe:lzx %windir%\System32\Catroot2\*
compact /c /s /a /i /exe:lzx %windir%\System32\LogFiles\*
