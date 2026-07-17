# AI Documentation Notes

> Machine-readable static analysis of the **Tweaks-Configurations-Troubleshooting** repository.
> Generated per the workflow defined in `AGENTS.md`. Each entry uses uniform fields:
> **Purpose · Inputs · Outputs · Dependencies · Behavior**.
> Field values are literal and descriptive, not narrative.

---

## 0. Repository Overview

- **Type:** Non-application repository. A curated personal knowledge base of system tweaks, application configuration exports, and troubleshooting guides. There is no build system, package manifest, test suite, or runtime entry point.
- **Primary domains:** Windows tweaking/debloating, Linux (Debian-based) performance tuning, Android (Xiaomi) debloat, browser/extension configuration, router setup, Termux tooling.
- **Languages / formats present:** Windows Batch (`.bat`/`.cmd`), PowerShell (`.ps1`), Windows Registry scripts (`.reg`; some UTF-16 LE, some ASCII), JSON/INI/CFG/CSV config exports, plain-text guides (`.txt`), and binary documents (`.docx`, `.pdf`, `.png`).
- **Execution model:** Files are applied **manually** by the operator on a target machine. There is no orchestration linking them. Most Windows scripts require an elevated (Administrator) context.
- **Static QA summary (this pass):** Functional changes **were** made this pass — OS-compatibility guards, legacy fallbacks, standardized elevation, and three defect fixes across the Windows scripts, plus two new undo scripts. Every change was validated by dry-run execution (neutered mirrors across simulated Windows versions) and throwaway-hive registry imports. See [§6 QA & Risk Findings](#6-qa--risk-findings). Gate: **PASS**.

### 0.1 Directory Map

| Directory | Contents | Format class |
|---|---|---|
| `Tweaks for Windows/` | Executable system-modification scripts (debloat, services, updates, compression, activation, Insider enrollment, ownership) | `.bat`, `.cmd`, `.ps1`, `.reg` |
| `Softwares_Apps_Extensions Configurations/` | Application + browser-extension settings exports and enforcement notes | `.json`, `.cfg`, `.ini`, `.csv`, `.txt` |
| `Troubleshooting and Tweak Guides for Windows/` | Reference documents (power, drivers, commands) | `.pdf`, `.docx` |
| `Troubleshooting and Tweak Guides for Linux (Debian Based)/` | Command/recipe text guides | `.txt` |
| `Tweaks for Android/` | Xiaomi debloat package list | `.txt` |
| `Packages and Tools in Termux/` | Termux tool install recipes | `.txt` |
| `Xiaomi AX6000 Router Settings/` | Router setup walkthrough + screenshots | `.docx`, `.pdf`, `.png` |
| `Programming Related/` | Combined troubleshooting/config reference document | `.docx`, `.pdf` |

---

## 1. Module: Windows Executable Scripts (`Tweaks for Windows/`)

These are the only files in the repository with control flow and side effects. Treat each as a **destructive, elevation-requiring** operation against a live OS.

### 1.0 Compatibility Matrix (min OS to *function*)

> **Key finding:** the set is **not** "fully compatible XP → 11" as originally assumed. Most scripts depend on Windows-10/11-only features. This pass added **safe guards** (10/11-only scripts exit cleanly with a message on older Windows) and **legacy fallbacks** (Win 7/8 where the OS supports it). XP/Vista remain best-effort or unsupported for feature reasons, not for lack of guarding.

| Script | Min OS to function | Behavior on older OS | Reversible? |
|---|---|---|---|
| `Restore Windows Services To Default Settings.bat` | XP → 11 | Per-OS `sc config` blocks; `ver`-based routing | Yes — it *is* a restore-to-default |
| `Basic Protection…bat` | Vista+ full; XP partial (firewall only) | Self-adapts: `netsh firewall`/registry-SMB1/skip-audit fallbacks | Partial (Security Off / Easy Access reverse parts) |
| `Compact Windows.bat` | Windows 10 | Guard: clean exit below 10 | **Yes — `Uncompact Windows.bat` (new)** |
| `Performance.bat` | Windows 10 (2004+ ideal) | Guard: clean exit below 10 | Partial (Restore services + TakeControl revert) |
| `Security On.bat` + `Enable Windows Security.reg` | Windows 10 (1709+); DoH is 11 | Guard: clean exit below 10 | Yes — Security Off / Disable Windows Security.reg |
| `Force HMB to use 64 MB.ps1`, `HMB Configuration Verification.ps1` | Windows 10 | No-op on older (NVMe HMB absent); guarded when run via `Performance.bat` | No dedicated undo |
| `OfflineInsiderEnroll.cmd` | Win 10 1809+ | Self-gates (`build >= 17763`) | Yes — menu option 4 |
| `TakeControl.reg` | Power GUIDs 10/11; telemetry/ownership/WU 7+ | Extra keys are inert on older | **Yes — `TakeControl (Revert).reg` (new)** |
| `Registry Tweaks to Make Windows Faster.reg` | Mixed | Unused keys are inert | Manual only |
| `Enable/Disable Windows Update.reg` | Win 7+ | policy inert on older | Yes — the pair reverse each other |
| `Security Off.bat`, `Easy Access.bat`, `Disable Windows Security.reg` | Vista/8+ | **document-&-warn only, unmodified** | Security On reverses |
| `Windows Activation.ps1`, `Internet Download Manager Activation.ps1`, `Tools of Tweaks.ps1` | 7+ | **document-&-warn only, unmodified** | n/a |

**Shared primitive (batch):** OS is detected from `ver` — `for /f "tokens=2 delims=[]" ... ` isolates the bracketed `Version N.N.NNNN`, then `for /f "tokens=2-4 delims=. "` yields major/minor/build. Map: XP=5.1, Vista=6.0, 7=6.1, 8=6.2, 8.1=6.3, 10/11=10.0 (build ≥ 22000 ⇒ 11). This is locale-independent and replaces the old ProductName/`systeminfo` string matching.

**Standardized elevation (batch, first-party scripts):** `net session` (0 ⇒ already elevated) → relaunch via `powershell … Start-Process -Verb RunAs`; VBS `Shell.Application` ShellExecute "runas" fallback when PowerShell is absent (XP). Third-party scripts (`OfflineInsiderEnroll.cmd`, the FreeBooter services script) keep their own elevation to stay upstream-mergeable.

### 1.1 `Compact Windows.bat` — *modified this pass*

- **Purpose:** Reduce on-disk footprint by enabling CompactOS and LZX-compressing key system/user directories.
- **Inputs:** None.
- **Outputs:** Side effects — NTFS compression state changes; console progress.
- **Dependencies:** `compact.exe` (Win 10+ for `/CompactOS` and `/exe:lzx`), NTFS, Administrator.
- **Behavior:**
  1. **Standardized self-elevation** header (added).
  2. **Windows 10+ guard** (added): exits with a message on 8.1/older instead of emitting "invalid parameter".
  3. `Compact /CompactOS:always`.
  4. Iterates the directory set with `compact /c /s /a /i /exe:lzx "<path>\*"`.
- **Defect fixed (Q9):** the path list used `set "paths=%programFiles(x86)%" "…"`; the outer `set "…"` quotes stripped the first path's opening quote, leaving `C:\Program Files (x86)"` unquoted so its `(x86)` parenthesis broke the `for` — the per-directory pass **silently never ran**. Changed to `set paths="…"` (each path individually quoted). Verified: all 10 directories now iterate.
- **Undo:** `Uncompact Windows.bat` (new).

### 1.2 `Uncompact Windows.bat` — *new this pass*

- **Purpose:** Reverse `Compact Windows.bat`.
- **Inputs:** None.
- **Outputs:** `Compact /CompactOS:never` + `compact /u /s /a /i "<path>\*"` over the same directory set.
- **Dependencies:** `compact.exe`, Administrator, Windows 10+.
- **Behavior:** Standardized elevation + Win 10+ guard, then decompress loop (same corrected `set paths=` idiom).

### 1.3 `Restore Windows Services To Default Settings.bat` — *modified this pass*

- **Purpose:** Reset Windows service **startup types** to Microsoft defaults for the detected OS, then reboot.
- **Inputs:** Forwarded args via the UAC self-elevation relaunch.
- **Outputs:** ~1180 `sc config <service> start= <type>` mutations; system reboot.
- **Dependencies:** `reg.exe`, `sc.exe`, `ver`, `shutdown`, `ping`. Administrator.
- **Behavior:** Elevation gate (FreeBooter original, unchanged) → **`ver`-based OS routing (rewritten)** → per-OS `sc config` block → `:Reboot`.
- **Defect fixed (Q10, supersedes old Q3):** the previous detection tested `find "Windows 8"` **before** `"Windows 8.1"`, so 8.1 wrongly took the Win 8 branch; Windows 11 also reports ProductName "Windows 10", forcing a slow, locale-dependent `systeminfo | find "Windows 11"`. Replaced with numeric `ver` routing. Verified across simulated XP/Vista/7/8/8.1/10/11 (and build-22000 split) — all route correctly; per-OS `sc config` blocks unchanged.
- **Attribution:** "FreeBooter" (third-party).

### 1.4 `Basic Protection Against to Unauthorized Access.bat` — *modified this pass*

- **Purpose:** Enable the firewall, basic logon auditing, and disable SMBv1.
- **Inputs:** None.
- **Outputs:** `netsh` firewall config; `auditpol` policy; SMBv1 disable.
- **Dependencies:** `netsh`, `auditpol`, `dism`/`reg`, Administrator.
- **Behavior:** Standardized self-elevation → `ver` detection → **version-adaptive** sections:
  - *Firewall:* `netsh advfirewall` on Vista+; `netsh firewall set opmode` fallback on XP.
  - *Auditing:* granular `auditpol` on Vista+; skipped with a notice on XP.
  - *SMBv1:* DISM `SMB1Protocol` on 8+; `LanmanServer\Parameters\SMB1=0` registry fallback on Vista/7; skipped on XP.
- **Verified:** dry-run across XP→11 selects the correct branch each time; elevation block parses non-elevated.

### 1.5 `Security On.bat` — *modified this pass*

- **Purpose:** Apply core Defender/credential hardening, import `Enable Windows Security.reg`, and call `Basic Protection…bat`.
- **Inputs:** None.
- **Outputs:** `reg add` (LSA PPL, HVCI, cert padding, security services, Tamper Protection attempt); `regedit /s` import; `call` of the firewall script.
- **Dependencies:** `reg`, `regedit`, Administrator, Windows 10+.
- **Behavior:** **Standardized self-elevation** (was warn-only) + **Win 10+ guard** (added) → registry hardening → import hardening pack → call firewall script.
- **Advisory (Q11):** `TamperProtection` set via the registry is frequently reverted/ignored — Defender enforces it. An inline note now points the user to Windows Security → Virus & threat protection if the value does not stick.

### 1.6 `Performance.bat` — *modified this pass*

- **Purpose:** Latency/throughput tuning: disable device power management, DPTF, telemetry; TCP tuning; import power plans; HPET/dynamic-tick, Modern Standby, AVX; import tweak `.reg` packs; apply HMB.
- **Inputs:** None.
- **Outputs:** CIM/WMI power-management disable; `pnputil /disable-device` (DPTF); `sc`, `netsh`, `powercfg`, `bcdedit`, `reg`, `regedit`; HMB PowerShell call.
- **Dependencies:** PowerShell, `pnputil` (10 2004+), `powercfg`, `bcdedit`, Administrator, Windows 10+.
- **Behavior:** **Standardized self-elevation** (replaces the fsutil/VBS getadmin trick) + **Win 10+ guard** (added) → tuning sections → `.reg` imports → HMB.
- **Changes:**
  - **D3 fixed:** removed the misleading `if %errorlevel% equ 0 (…succeeded) else (…failed)` blocks that reported only the last redirected command's status; replaced with honest `[*]` progress lines.
  - **CIM→WMI fallback:** the `MSPower_DeviceEnable` call now tries `Get-CimInstance` and falls back to `Get-WmiObject`.
  - HMB script now invoked directly (already elevated; no second RunAs prompt).
  - Emoji in the final banner replaced with ASCII (they render as mojibake under the console code page).

### 1.7 `Internet Download Manager Activation.ps1` / `Windows Activation.ps1` / `Tools of Tweaks.ps1` — *unmodified (document & warn)*

- **Purpose:** One-liners that download and execute a remote script: `massgrave.dev/ias` (IDM activation), `get.activated.win` (Windows activation — Microsoft Activation Scripts), `christitus.com/win` (WinUtil).
- **Behavior:** `irm <url> | iex` with `-ExecutionPolicy Bypass` — **remote code execution by design**, run as the current (often elevated) user.
- **Risk (Q12):** integrity depends entirely on the remote host + TLS; a compromised endpoint runs arbitrary code as admin. The two activation scripts are also **license-circumvention** tools (legal/licensing exposure). Left unmodified per project decision; not optimized.

### 1.8 `TakeControl.reg` — *modified this pass*

- **Purpose:** Power-user pack: unlock hidden Power Option settings, disable telemetry, add elevated-ownership context-menu entries, re-arm Windows Update auto-install.
- **Inputs:** None (registry import). Encoding: **UTF-16 LE with BOM** — do not re-encode. ~653 lines.
- **Outputs (grouped):** telemetry `AllowTelemetry=0`; "Acquire Admin Ownership" `runas`/`runas2` verbs (`takeown` + `icacls /grant administrators:F`); Windows Update `AU` re-arm; ~104 `Control\Power\PowerSettings\{GUID}` `Attributes` unlock/hide values.
- **Defect fixed (Q8):** line 24's `Directory\shell\runas\command` **`IsolatedCommand` value was truncated** (`… icacls \` with no closing quote). An unterminated string bleeds into the following `[-…WindowsUpdate\AU]` / `[…\AU]` keys, so the truncation could also break the Windows Update re-arm. Restored to the full command (mirrors the complete `@=` on line 23). Verified: throwaway-hive import now parses the value fully and the `AU` keys import intact.
- **Undo:** `TakeControl (Revert).reg` (new).

### 1.9 `TakeControl (Revert).reg` — *new this pass*

- **Purpose:** Reverse the security/privacy-relevant parts of `TakeControl.reg` and re-hide the unlocked power settings.
- **Inputs:** None. Encoding: **UTF-16 LE with BOM**.
- **Outputs:** deletes the `runas`/`runas2` ownership verbs (`[-HKCR\*\shell\runas]`, `…\exefile\shell\runas2`, `…\Directory\shell\runas`, `…\Msi.Package\shell\runas`); deletes the telemetry policy value (`"AllowTelemetry"=-`); deletes the `WindowsUpdate\AU` policy key; deletes the `Attributes` value under each of the 104 unlocked power-setting keys (re-hiding them; other values untouched).
- **Behavior:** Restores the default (policy-absent) state. Auto-generated from `TakeControl.reg`'s key list, so it stays complete. Verified via root-swapped throwaway import (deletions confirmed applied).

### 1.10 `Disable Windows Update.reg` / `Enable Windows Update.reg` — *unchanged*

- Sets / deletes `HKLM\…\WindowsUpdate\SetDisableUXWUAccess` (UTF-16 LE). Only hides the WU UX page; does not itself stop update installation.

### 1.11 `OfflineInsiderEnroll.cmd` — *unchanged (third-party, correctly gated)*

- abbodi1406 script (`scriptver=2.6.4`). Enrolls a device into a Windows Insider channel by writing registry state; self-gates to build ≥ 17763; includes its own reset/stop path.

---

## 2. Module: Application & Extension Configurations (`Softwares_Apps_Extensions Configurations/`)

Declarative settings exports and enforcement recipes. **No executable logic** — consumed by importing into the respective application.

| File | Purpose | Format |
|---|---|---|
| `Adguard Extension Settings.json`, `Improve Youtube Settings.json`, `wastenotime-settings.json`, `UniGetUI Settings.json`, `ReVancedManager_settings.json` | App/extension config backups | JSON |
| `UblockOriginConfig.txt`, `UblockOriginLiteConfig.json` | uBO / uBO-Lite settings | text/JSON |
| `Kaspersky Premium.cfg` / `Kaspersky Total Security.cfg` | Kaspersky exported profiles | binary `.cfg` |
| `ProcessLasso Settings.INI` | Process Lasso tuning profile | INI |
| `Blocked Site.csv` | Blocked-site list | CSV |
| `Hardware Specification and Configuration.txt` | GPU overclock offsets + fan mapping reference | text |
| `Enforce Extension on Google Chrome.txt` | Force-install Chrome extensions via `HKLM\…\Policies\Google\Chrome` | regedit recipe |
| `How to add Brave Search on other Browsers.txt` | Custom search-engine entry | text |

- **Behavior:** Static data. No side effects until imported by the user. Versions are not pinned.

---

## 3. Module: Linux Guides (`Troubleshooting and Tweak Guides for Linux (Debian Based)/`)

Plain-text command recipes. **Reference only.**

- **`Linux Tweaks.txt`** — CPU governor → `performance`; `sysctl` RAM/kernel tuning; NVIDIA PowerMizer; swap via `/etc/fstab`; disable throttling; install `preload`/`Ananicy`/`Nohang`.
- **`Troubleshooting.txt`** — start `snapd`; GRUB `os-prober`; **passwordless sudo (`NOPASSWD: ALL`)** and **untrusted-repo** recipes — weaken auth/repo trust by design.
- **`Application Installation commands in Linux.txt`** — install recipes (Wine, Flatpak/Snap, app-centers, etc.).
- **`How do you make a Bash script run automatically after login in Linux.txt`** — single external URL.

---

## 4. Module: Other Platform Guides

- **`Tweaks for Android/Xiaomi.txt`** — MIUI ad/debloat package list (ADB uninstall).
- **`Packages and Tools in Termux/*.txt`** — Termux setup recipes (Lazymux, Tool-X, Weeman — pentest frameworks; operator-authorized use assumed).
- **`Xiaomi AX6000 Router Settings/`** — router walkthrough (`.docx`/`.pdf` + screenshots).
- **`Troubleshooting and Tweak Guides for Windows/`** — binary reference docs (power, drivers, commands).
- **`Programming Related/`** — consolidated reference document.

---

## 5. Systemic Operational Mechanics

- **Architecture:** Flat, category-foldered document store. No inter-file dependencies except the intentional `Security On.bat → Enable Windows Security.reg + Basic Protection…bat` and `Performance.bat → *.reg + Force HMB…ps1` call chains.
- **Control flow:** Only inside `Tweaks for Windows/` scripts. Pattern: *standardized elevation → `ver` detection (guard or route) → linear command application → optional reboot*. `.reg` files are declarative imports.
- **Data flow:** One-directional, operator-mediated: file → (manual import/execute) → OS state. No data returns to the repo.
- **Dependency surface (external):** Windows built-ins (`reg`, `sc`, `compact`, `bcdedit`, `pnputil`, `netsh`, `auditpol`, `dism`, `powercfg`, `shutdown`, `takeown`, `icacls`, PowerShell); three network endpoints (`massgrave.dev`, `get.activated.win`, `christitus.com`, §1.7). No vendored deps, no lockfiles.
- **Privilege model:** Most Windows artifacts require Administrator; the scripts self-elevate. Several Linux recipes require root and intentionally relax security.
- **Idempotency / reversibility:** `.reg` and `sc config` operations are largely idempotent. Explicit reverts now exist for Windows Update (§1.10), **Compact (§1.2, new)**, **TakeControl (§1.9, new)**, and Security (On ↔ Off). `Performance.bat` and the Insider/HMB scripts still have no single bundled undo.

---

## 6. QA & Risk Findings

Static QA of the executable scripts (logic, edge cases, error handling, integration).

| ID | File | Severity | Finding |
|---|---|---|---|
| Q1 | `Restore…bat` (UACPrompt) | Bug — **FIXED (prior pass)** | Malformed `set params` dropped forwarded args on relaunch. |
| Q2 | `Restore…bat` (Win_11 block) | Bug — **FIXED (prior pass)** | `sc config AssignedAccessManagerSvc` missing the `start` keyword. |
| Q8 | `TakeControl.reg:24` | Bug — **FIXED (this pass)** | `IsolatedCommand` value truncated (unterminated string); bled into the following `WindowsUpdate\AU` keys, risking a broken import. Restored to the full command; verified via throwaway-hive import. |
| Q9 | `Compact Windows.bat` (paths) | Bug — **FIXED (this pass)** | `set "paths=%programFiles(x86)%" …` stripped the first path's opening quote; the `(x86)` parenthesis then broke the `for`, so per-directory compression **silently never ran**. Changed to `set paths="…"`; verified all 10 directories iterate. |
| Q10 | `Restore…bat` (detection) | Bug — **FIXED (this pass; supersedes Q3)** | `find "Windows 8"` tested before `"Windows 8.1"` → 8.1 took the Win 8 path; Win 11 detection was locale-dependent (`systeminfo`). Replaced with numeric `ver` routing; verified across XP→11. |
| Q11 | `Security On.bat` / `Enable Windows Security.reg` | Advisory | `TamperProtection` (and to a degree ASR) set via the registry is often reverted by Defender. Inline note added; toggle in the Windows Security app if it does not stick. |
| Q12 | `Windows/IDM Activation.ps1`, `Tools of Tweaks.ps1` | Advisory (security + licensing) | `irm \| iex` runs unverified remote code as admin; the activation pair are license-circumvention tools. Documented; left unmodified. |
| Q5 | `TakeControl.reg` (whole) | Advisory — **mitigated** | Bulk HKLM changes; a revert script now exists (§1.9). Still back up hives before import. |
| Q6 | `Compact Windows.bat` | Edge case | Compressing in-use system folders relies on `/i` to swallow sharing violations — partial compression is silent by design. |
| Q7 | `.reg` files | Integration | `TakeControl.reg`, `TakeControl (Revert).reg`, and the Windows Update `.reg` files are UTF-16 LE with BOM. Re-encoding to UTF-8 breaks `reg import`. Preserve encoding on edit. |

**Gate status:** **PASS.** Q8/Q9/Q10 fixed and validated (dry-run mirrors across simulated Windows versions; throwaway-hive registry imports). Q5 mitigated by the new revert script. Q6/Q7/Q11/Q12 remain as advisories.

---

## 7. Maintenance Notes (for future AI agents)

- **Scope of "code":** Only `Tweaks for Windows/` contains executable logic. Apply the `AGENTS.md` QA/static-analysis workflow primarily to §1 when those files change.
- **Inline comments:** Added this pass **alongside functional edits only** (the *why* — e.g., why `set paths=` is unquoted, why detection uses `ver`, why the SMBv1 path branches). Do not add comments to encoding-sensitive `.reg` files or third-party scripts without a functional reason.
- **Editing `.reg`/`.cmd`:** preserve **UTF-16 LE BOM** on `TakeControl.reg` / `TakeControl (Revert).reg` / the Windows Update `.reg` files (edit via `[System.IO.File]` with `UnicodeEncoding`, not tools that rewrite as UTF-8). Keep batch files **ASCII/UTF-8 without BOM and CRLF**. Verify with a throwaway-hive `reg import` and neutered dry-runs in a VM before committing.
- **Compatibility contract:** 10/11-only scripts must **guard** (clean exit below their minimum OS); scripts with legacy paths must **branch** on the shared `ver` primitive. Never silently run a 10/11 command on an older OS.
- **When updating this file:** revise the affected §1 entry and the §1.0 matrix, refresh §6, and keep the Purpose/Inputs/Outputs/Dependencies/Behavior structure.
