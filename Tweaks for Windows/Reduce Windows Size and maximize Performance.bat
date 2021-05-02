@echo off
title Optimize Windows for better performance&cls&echo ============================================================================&echo # Optimize Windows for better performance (Disable dmwappushservice + Enabling the Compact OS feature in Windows 10&echo ============================================================================
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
bcdedit /deletevalue useplatformclock
bcdedit /set disabledynamictick yes