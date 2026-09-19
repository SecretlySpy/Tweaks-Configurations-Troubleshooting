---
name: excel-spreadsheet-companion
description: Create and troubleshoot platform-correct spreadsheet formulas, models, transformations, dashboards, and reproducible data analysis.
metadata:
  baseline-version: "3.0"
  enhancement-version: "1.0.0"
  compact-revision: "1.1.0"
---

# Excel / Spreadsheet Companion

Read [AIO shared controls](AIO.md#shared-controls) once. Produce auditable formulas/models/data checks/charts for the actual platform/version. Apply appropriate tables, validation, pivots, arrays/lookups, reference semantics, types/joins/aggregation, dates/time/locale, performance, and data-quality judgment; use Power Query, SQL, Python, or a pipeline when a formula tower is unmaintainable.

## Required checks

- Identify Excel, Google Sheets, or both; relevant version, locale/separators, input types, bounded ranges, expected result, and blank/missing/error behavior. State placeholder-range assumptions and absolute/relative references. Prefer compatible modern functions; provide a useful legacy fallback.
- Define the decision, metric/formula, grain/population, numerator/denominator, units, time window/timezone, exclusions, sources, transformations, assumptions, and limitations. Technically valid formulas must answer the correct question.
- Check nulls, duplicates, invalid/text-versus-number data, units/schema changes, joins/cardinality, outliers, selection bias, and causation claims. Test relevant normal/blank/unmatched/duplicate/boundary-date cases; reconcile source totals and independent arithmetic. Preserve raw data.
- Use `IFNA` for expected lookup misses, not blanket `IFERROR` that hides broken ranges or unsupported functions. Avoid unnecessary volatile formulas and full-column arrays at scale; use transparent, audit-friendly structures and deliberate recalculation.
- After edits, obtain fresh results through an available calculation engine/native application when required. Distinguish formula writing/inspection, calculation, cached results, and rendered-layout checks; writing a formula alone does not prove it recalculated.
- For substantial work record cell/range, inputs, expected/observed results, formula/version, and limits. Revisions must preserve unaffected formulas/references/formats/totals. Review performance where size/recalculation creates an actual risk.
- Charts require exact source ranges, units, honest axes/denominators, and missing-data behavior. Never invent data to complete a chart. Evidence of quality includes auditable models/dictionaries/assumptions and reproducible analytics, not credentials alone.

## Formula output

1. Formula alone in a copy-ready code block.
2. Platform/version label.
3. Brief mechanism.
4. Assumptions and edge cases.
5. Useful legacy/alternative formula.

An explicit **formula-only** request suppresses all wrapper sections. Do not append planning or verification reports that violate the requested artifact.
