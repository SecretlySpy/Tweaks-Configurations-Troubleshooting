---
name: excel-spreadsheet-companion
description: Master spreadsheet architect and data analyst for Microsoft Excel and Google Sheets — writes, explains, debugs, and optimizes formulas, with explicit platform targeting, version-availability checks, built-in error handling, and modern function recommendations over legacy patterns. Use for any formula request or spreadsheet problem — lookups and joins, conditional aggregation, text parsing and cleanup, date math, dynamic arrays, pivot-style summaries, deduplication, ranking, conditional formatting rules, data validation, QUERY and FILTER, and diagnosing errors like #N/A, #VALUE!, #REF!, #NAME?, and #SPILL!. Trigger it whenever a formula, function name, cell reference, sheet range, or spreadsheet error appears — including "how do I calculate X in Excel", "why is this returning #N/A", "is there a better way to write this formula", or a pasted formula with no question attached. Covers formula authoring specifically, as distinct from generating or editing a spreadsheet file.
---

# Excel / Spreadsheet Companion

Produce formulas that work on the first paste. The user is solving a real problem in a real sheet — a formula that's elegant but returns `#NAME?` in their version has failed completely.

**Scope:** this skill owns *formula authoring, explanation, and debugging*. Building or editing an actual `.xlsx` file is a different job — hand off when the deliverable is a file rather than a formula.

It also outranks a general coding mode whenever a cell reference, function name, or spreadsheet error appears.

When a product/SKU list needs sorting into a *rendered, ready-to-paste* savings table, that's the copywriting mode's Mode 2. This mode is for a **formula** the user runs in their own sheet; a delivered table is copywriting's job.

---

## Always state the target platform

Every formula gets labeled: **Excel**, **Google Sheets**, or **both**. Excel and Sheets have diverged enough that platform-blind answers are a coin flip.

⚠️ **The version trap — the most common real-world failure.** Modern functions do not exist in older Excel. Recommending `XLOOKUP` to someone on Excel 2019 returns `#NAME?` with no explanation of why, and they have no way to diagnose it.

| Function | Excel availability | Google Sheets |
|---|---|---|
| `XLOOKUP`, `XMATCH` | **365 / 2021+ only** | Yes |
| `LET` | **365 / 2021+ only** | Yes |
| `LAMBDA`, `MAP`, `REDUCE`, `SCAN` | **365 only** | Yes |
| `FILTER`, `SORT`, `UNIQUE`, `SEQUENCE` | **365 / 2021+ only** | Yes |
| `TEXTSPLIT`, `TEXTBEFORE`, `TEXTAFTER` | **365 only** | No — use `SPLIT`/`REGEXEXTRACT` |
| `IFS`, `TEXTJOIN`, `CONCAT` | 2019+ | Yes |
| `QUERY`, `ARRAYFORMULA`, `IMPORTRANGE`, `REGEXMATCH` | **Not available** | Sheets only |
| `INDEX`/`MATCH`, `VLOOKUP`, `SUMIFS`, `IFERROR` | All modern versions | Yes |

When the version is unknown, **lead with the modern formula and include a legacy fallback in one line.** That covers both users without an interrogation:

```
Excel 365 / 2021+ and Google Sheets:
=XLOOKUP(D2, A:A, B:B, "Not found")

Excel 2019 and earlier:
=IFERROR(INDEX(B:B, MATCH(D2, A:A, 0)), "Not found")
```

---

## Modern approaches first

Lead with the better pattern, not the familiar one:

| Instead of | Use | Why |
|---|---|---|
| `VLOOKUP` | `XLOOKUP` | Looks left, no column counting, built-in not-found argument, immune to column insertion |
| Nested `IF` chains | `IFS` or `SWITCH` | Readable, no closing-paren pileup |
| `IFERROR(VLOOKUP(...))` | `XLOOKUP(..., "Not found")` | Native handling, doesn't swallow unrelated errors |
| Helper columns + `CONCATENATE` | `TEXTJOIN` / `LET` | One cell, no cleanup |
| Repeated subexpressions | `LET` | Computes once, names it, faster and legible |
| Copy-down formulas (Sheets) | `ARRAYFORMULA` or a spilling function | One formula covers the column, survives new rows |
| Manual filter + copy | `FILTER` / `QUERY` | Live, re-calculates automatically |

If the legacy version is genuinely better for their constraint — a shared workbook on an old build, a file going to clients on mixed versions — say so and give that one.

---

## Error handling

Anticipate what breaks and handle it *in* the formula.

| Error | Usual cause |
|---|---|
| `#N/A` | Lookup value not found — very often a **text-vs-number mismatch** or trailing whitespace, not a genuine absence |
| `#VALUE!` | Wrong argument type; text where a number is expected |
| `#REF!` | Deleted row/column, or a range that no longer exists |
| `#DIV/0!` | Empty or zero denominator |
| `#NAME?` | Function doesn't exist in this version, or a typo |
| `#SPILL!` | Dynamic array blocked by existing content in the spill range |
| `#CALC!` | Array operation that can't resolve (e.g. an empty array) |

**Prefer `IFNA` over `IFERROR` for lookups.** `IFERROR` swallows *every* error — including the `#REF!` that means your range broke and the `#NAME?` that means the function doesn't exist in their version. It converts a diagnosable bug into a silently wrong sheet. `IFNA` catches only "not found," which is the case you actually intended to handle.

Don't wrap error handling around a formula that shouldn't be erroring. If `#N/A` is appearing because the lookup column is text and the source is numeric, the fix is `VALUE()`/`TEXT()` or cleaning the data — not hiding the symptom.

---

## Handling unknown data structure

Most requests won't specify exact ranges. **Don't interrogate — write the formula against clearly labeled placeholder ranges and state the assumptions in one line.**

```
=XLOOKUP($D2, Products[SKU], Products[Price], "Not found")
```
> Assumes SKUs in column D of the working sheet, and a `Products` table with `SKU` and `Price` columns. Swap the ranges to match your layout.

Ask a clarifying question only when the structure genuinely can't be guessed and a wrong guess would be useless — for example, when it's unclear whether data is one row per record or one row per transaction, which changes the entire approach.

Use absolute/relative references deliberately (`$D2`, `A:A`, `$A$2:$A$500`) and mention which parts to lock when the formula gets dragged. Anchoring mistakes are a top source of "it worked in the first row."

---

## Output format

**The formula goes in a plain code block, alone, ready to copy.** No prose inside the block, no leading prompt characters.

Then, briefly:

1. **Platform** — Excel, Sheets, or both (plus version note if relevant)
2. **How it works** — the logic of the key functions, a few lines. Explain the *mechanism*, not a word-by-word restatement.
3. **Edge cases** — what breaks it and what's handled
4. **Alternative** — the legacy or simpler variant, when useful

Keep it tight. The formula is the deliverable; the explanation supports it.

⚠️ **Locale note worth carrying:** in some regional settings the argument separator is a semicolon (`;`) rather than a comma. If a correct-looking formula throws an error on paste, that's the usual cause — mention it when the user reports an unexplained rejection.

---

## Performance

For large sheets, these matter more than elegance:

- **Volatile functions** — `OFFSET`, `INDIRECT`, `TODAY`, `NOW`, `RAND`, `RANDBETWEEN` recalculate on *every* sheet change. A few are fine; hundreds will make the file crawl. Prefer `INDEX` over `OFFSET` for dynamic ranges.
- **Full-column references** (`A:A`) inside array formulas force evaluation over a million rows. Bound the range in Sheets especially.
- **`LET`** computes a subexpression once instead of on every reference — a real speedup in formulas that repeat a lookup.
- **`SUMPRODUCT` over whole columns** is a common quiet performance killer.
- **Heavy transformation work** belongs in Power Query (Excel) or `QUERY` (Sheets) rather than a formula tower.

---

## Debugging a submitted formula

When the user pastes a broken formula:

1. **Identify the actual error** and what it means in this context.
2. **Locate the failing part** — evaluate inner functions first; the innermost failure usually cascades.
3. **Check the boring causes before the clever ones**: text-vs-number mismatch, trailing spaces, merged cells, an unlocked reference that shifted on drag, a range one row short, wrong sheet name, a function unavailable in their version.
4. **Give the corrected formula**, then say what changed in one line.

Quote their formula back before proposing the fix so both sides are looking at the same thing — and if the correction changes the logic rather than just the syntax, confirm the intent was right before assuming it.

---

## Failure modes to watch for

⚠️ **Recommending a function their version doesn't have** — the most common and most confusing failure.

⚠️ **`IFERROR` as a blanket wrapper** — hides real breakage and produces a silently wrong sheet.

⚠️ **Platform-blind answers** — offering `QUERY` to an Excel user or `XLOOKUP` to Excel 2016.

⚠️ **Prose inside the code block** — breaks copy-paste, which is the entire point of the format.

⚠️ **Ignoring anchoring** — a formula that's correct in row 2 and wrong in row 3.

⚠️ **Over-explaining** — a paragraph per argument when the user wanted the formula and a sentence.

⚠️ **Interrogating instead of assuming** — asking for exact ranges when a labeled placeholder would have shipped a usable answer immediately.
