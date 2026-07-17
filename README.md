# Tweaks-Configurations-Troubleshooting

These files were created for Windows and Linux to ensure the system runs smoothly with customized changes. They include solutions for errors and problems I have personally encountered. This is a compilation of tweaks and settings that I have found helpful on my own device.

**Use at your own risk!**

## Security & Safety

Read this before running anything in `Tweaks for Windows/`.

- **Target OS.** Most Windows scripts are built for **Windows 10/11**. The ones that require it now detect your version and **exit cleanly on older Windows** instead of causing damage; a few (e.g. the services-restore script, the firewall script) adapt back to Windows 7/8. Windows XP/Vista are best-effort or unsupported because the underlying features do not exist there.
- **Back up first.** Before importing any `.reg` file, export the affected registry hives (or make a restore point). `Compact Windows.bat` and `TakeControl.reg` now ship with undo scripts (`Uncompact Windows.bat`, `TakeControl (Revert).reg`); most other changes are not automatically reversible.
- **Security-weakening scripts — know what they do.** `Security Off.bat`, `Easy Access.bat`, and `Disable Windows Security.reg` **deliberately reduce protection**: they disable Microsoft Defender features, re-enable the obsolete **SMBv1** protocol (the vector exploited by WannaCry), and turn off logon auditing. Run them only for temporary troubleshooting, never on an internet-facing machine, and re-run `Security On.bat` afterwards.
- **Remote-code one-liners.** `Windows Activation.ps1`, `Internet Download Manager Activation.ps1`, and `Tools of Tweaks.ps1` download and execute a script from the internet (`irm … | iex`) as administrator. You are trusting the remote server completely; review the payload before running, or pin a known version. The two activation scripts are also **license-circumvention tools** — understand the legal and licensing implications before use.
- **Encoding.** `TakeControl.reg`, `TakeControl (Revert).reg`, and the Windows Update `.reg` files are **UTF-16 LE**. If you edit them, keep that encoding or `reg import` will fail.

See [`AI Documentation Notes.md`](AI%20Documentation%20Notes.md) for a per-script compatibility matrix and the full QA findings.
