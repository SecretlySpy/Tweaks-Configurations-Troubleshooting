# AI Documentation Notes

> Project-specific navigation index. Keep this page short. Replace bracketed entries after inspecting the project; delete rows that do not apply.

## Quick orientation

**Project:** [name and one-sentence purpose]  
**Primary entry point:** [source path or application URL]  
**Documentation status:** TEMPLATE — project mapping pending  
**Last source check:** [date or UNVERIFIED]

## How to read

1. Identify the task area below.
2. Read its one authoritative Project Guidelines page, then any linked module page that actually affects the task.
3. Inspect relevant source, tests, and runtime evidence before editing or asserting behavior.
4. Follow dependencies only when needed; broaden the read for a repository-wide audit.
5. Stop once the evidence is sufficient. Correct stale links here and put detailed facts in the owner page.

## Documentation map

| Task or question | Canonical page | Optional detailed page / source path |
|---|---|---|
| Scope, goals, acceptance | [Plan and Goals.md](Plan%20and%20Goals.md) | [feature path if applicable] |
| UI flows and prototype | [Design Prototype.md](Design%20Prototype.md) | [screen path if applicable] |
| Data ownership and schema | [Database Structure.md](Database%20Structure.md) | [schema path if applicable] |
| APIs, services, integrations | [Backend Functionalities.md](Backend%20Functionalities.md) | [service path if applicable] |
| System boundaries and operations | [Architecture and Operations.md](Architecture%20and%20Operations.md) | [deployment path if applicable] |
| Tests and observed evidence | [Verification and Evaluation.md](Verification%20and%20Evaluation.md) | [test path if applicable] |
| Decisions and continuation | [Decisions and Handover.md](Decisions%20and%20Handover.md) | [ADR link if applicable] |
| Install and run on an OS | [Tech Stack Setup Guide.md](Tech%20Stack%20Setup%20Guide.md) | [interactive guide](tech-stack-setup.html) |

## Component pointers

Add only components that matter for navigation. For large projects, link a short `Modules/<component>.md` page from its canonical owner page. Do not introduce an unrelated `AI Documentation/` tree.

| Component | Source glob | Owner page | Detail page if needed |
|---|---|---|---|
| [component] | [path/**] | [one page above] | [Modules/component.md or N/A] |

## Cross-component pointers

- [Component A] → [Component B]: [brief reason; link to the page that explains it].

This index does **not** store function catalogs, setup commands, architecture narratives, test logs, decision history, or handover status. Those belong in the linked pages, source, tests, or ADRs. Remove this reminder when the project map has been populated.
