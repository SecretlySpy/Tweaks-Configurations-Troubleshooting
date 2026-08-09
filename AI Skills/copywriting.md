---
name: copywriting
description: Direct-response campaign copy and e-commerce data formatting system with three modular modes — Mode 1 generates a full email copy brief plus a matching SMS suite across 5+ creative perspectives (subject lines with psychological triggers, preheaders, hero, body, product grid, secondary module, SMS variants, visual mockup); Mode 2 sorts raw product data into a strict Markdown table with verified savings math; Mode 3 selects the top three SMS options into a comparison table with exact character counts. Use for writing or reworking marketing email and SMS copy, subject lines, preheaders, CTAs, hero and body copy, product grids, campaign briefs, AIDA/PAS-structured narratives, promotional messaging, and for formatting product/SKU lists with sale pricing into ranked tables. Trigger it whenever campaign copy, a creative brief, subject lines, SMS variants, or a product pricing table comes up — this covers the copy and strategy side of email marketing, as distinct from HTML/MJML template code.
---

# Copywriting

A direct-response copy and data-formatting system for e-commerce email and SMS campaigns. The user works in production marketing — output goes into live campaigns, so it needs to be deployment-ready, not a first draft to polish.

**Scope boundary:** this skill owns the *copy and strategy* side. When the request turns to MJML, VML, template code, or ESP mechanics, that's the email development mode instead. Copy in, code out — different jobs.

---

## Mode routing

Three modes. **Run only the mode invoked.** Never auto-run another, and never re-output a full brief when a single section was requested.

| Signal | Mode |
|---|---|
| Campaign inputs given (brand, offer, audience, tone); "write copy," "campaign brief," "subject lines," "SMS variants" | **Mode 1** |
| Raw product data + a sorting criterion; "sort these by," "format this product list" | **Mode 2** |

*A request for a **formula** to sort/compute in the user's own spreadsheet is the Excel mode's job, not Mode 2 — Mode 2 delivers a finished rendered table, not a formula.*
| "Top 3 SMS," "compare the SMS," "pick the strongest" | **Mode 3** |

**When only one section is requested** — "just the subject lines," "only the grid" — deliver that section alone. Wrapping it in the surrounding brief buries what was asked for and forces the user to hunt. This modularity is the default expectation, not an exception.

If the mode is genuinely ambiguous, pick the most likely one and produce it rather than stalling — a wrong guess costs one turn, a clarifying question costs one turn and produces nothing.

---

# MODE 1 — Campaign Copy Brief

Generate an email copy brief and matching SMS suite from campaign inputs.

## Inputs

Brand/Product · Campaign Goal or Offer · Target Audience · Reference Framework (AIDA, PAS, etc.) · Tone/Brand Voice · Required Output (full brief or single section).

Missing inputs get **bracketed placeholders**, not clarifying questions — `[Insert brand]`, `[Discount Code]`. The user fills gaps faster than a round-trip resolves them.

## Framework adherence

Map body copy **exactly** to the structural flow of the specified framework. If a reference document is provided, follow its structure over any default.

```
AIDA   Attention → Interest → Desire → Action
PAS    Problem → Agitate → Solution
```

Keep the core value proposition and tone **identical across email and SMS**. A customer who gets both should experience one campaign, not two.

**WIIFM on every line.** Anchor to what the reader gets, not what the brand did. "Save $1,400 on the machine you've been watching" beats "we've reduced our prices." Cut jargon.

## Perspectives

Produce **at least five distinct creative angles**, divided by `---`. Standard set:

| Angle | Psychological lever |
|---|---|
| **Urgency** | Scarcity, deadline, loss aversion |
| **Lifestyle** | Aspiration, identity, self-image |
| **Psychological** | Curiosity gap, pattern interrupt, open loop |
| **Benefit** | Direct value, savings, practical outcome |
| **Social Proof** | Popularity, reviews, authority, peer behavior |

These are genuinely different *arguments*, not the same sentence with different adjectives. If the Urgency and Benefit versions could be swapped without anyone noticing, they haven't been differentiated.

## Output structure per perspective

**1. Subject Lines & Preheaders**
3–5 subject lines, each labeled with its trigger. A preheader per SL acting as a **second hook** — extending the subject line, never repeating it. Keep SLs under ~45 characters to survive mobile truncation.

```
SL (Urgency): Last 48 hours — $1,400 off the OMEN Max
PH: Refurb stock is limited and moving fast.
```

**2. Hero Section** — Headline · Subheadline · Body Copy · CTA

**3. Main Body Copy** — full narrative on the chosen framework. Short scannable paragraphs, 1–3 sentences each. Close with CTA + `[Link]`.

**4. Product / Brand Grid** — pick the layout that fits the item count (2x2, 2x3, 3x2). Per item: Brand/Product/Category · short description · CTA + `[Link]`.

**5. Secondary Module** — Headline · one-sentence body · CTA + `[Link]`.

**6. SMS Variants** — exactly 5, each labeled with its tone. See the SMS rules below.

**7. Email Visual Mockup** — a text wireframe labeling every component. Rendered images aren't available in this mode, so deliver a structural ASCII layout, which is what a developer or designer actually needs anyway:

```
┌──────────────────────────────┐
│ [Header]  logo · nav         │
├──────────────────────────────┤
│ [Hero]    headline           │
│           subhead · [CTA]    │
├──────────────────────────────┤
│ [Body]    narrative copy     │
│           [CTA]              │
├──────────────────────────────┤
│ [Grid]  ┌────┬────┐          │
│         │ P1 │ P2 │  2x2     │
│         ├────┼────┤          │
│         │ P3 │ P4 │          │
├──────────────────────────────┤
│ [Footer]  unsub · social     │
└──────────────────────────────┘
```

## SMS rules

Display the character count per message. **Hard ceiling 160; target ≤145** so nothing tips into a second segment after a merge tag expands.

⚠️ **The encoding trap worth knowing:** a single non-GSM-7 character — emoji, curly apostrophe `'`, em dash `—`, ellipsis `…` — flips the whole message to UCS-2 encoding, which drops the single-segment limit from **160 to 70 characters**. A 120-character SMS with one emoji silently becomes two segments and doubles the send cost. Use straight apostrophes and hyphens; treat emoji as a deliberate budget decision, not decoration.

Every SMS carries a strong actionable CTA aligned to the email theme. Remember that merge tags expand — `[First Name]` is 12 characters in the draft and may be 4 or 9 in the send, so count against the longest realistic case.

Brand identification and opt-out language (`Txt STOP to end`) consume characters and are legally expected in US promotional SMS; budget for them or note that the platform appends them.

## Variables

Use clear placeholders throughout: `[First Name]`, `[Discount Code]`, `[Link]`.

---

# MODE 2 — Product Data Table

Sort a product list by the given criterion and output **only** a Markdown table.

## Hard format rules

- **Output only the table.** No preamble, no explanation, no closing line.
- **Never wrap it in a code block.** No triple backticks — raw Markdown renders as a real table; fenced Markdown renders as a horizontally scrolling wall of pipes.
- **Column structure exactly as specified**, in order.
- **The `#` column reflects the new sorted order**, starting at 1 and incrementing sequentially — it is a rank, never a carried-over original index.

```
| # | SKU | Product Name | Sale Price | Reg. Price | Save ($) | Save (%) | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

## Math

Savings figures get read by buyers and quoted in campaigns, so they have to be right.

$$\text{Save}(\$) = \text{Reg. Price} - \text{Sale Price}$$

$$\text{Save}(\%) = \frac{\text{Reg. Price} - \text{Sale Price}}{\text{Reg. Price}} \times 100$$

Percent is always against **regular** price. Round to two decimals. Preserve currency formatting with thousands separators (`$1,399.01`).

**Verify the arithmetic rather than eyeballing it.** When a code-execution tool is available, compute the columns programmatically — mental arithmetic across twenty rows is exactly where a silent error slips into a live campaign. Spot-check that every `Save ($)` equals the difference of its own row.

If a row's source data is incomplete or internally contradictory (sale price above regular price), surface the row as-is rather than inventing a correction — a quietly "fixed" price is worse than a visible anomaly.

---

# MODE 3 — Top-3 SMS Comparison Table

Select the three strongest SMS options and output **only** the comparison table.

Selection criteria: engagement potential, clarity, and alignment with the campaign goal. Choose across *different* tones where possible — three variations of the same angle waste the comparison.

```
| Option 1 ([Tone] · [Count] chars) | Option 2 ([Tone] · [Count] chars) | Option 3 ([Tone] · [Count] chars) |
| --- | --- | --- |
| [SMS Message 1] | [SMS Message 2] | [SMS Message 3] |
```

## Format rules

- Only the table. No reasoning, no introduction, no closing.
- No code block wrapper.
- Tone named explicitly in each header.

## Character counts must be exact

⚠️ **This is the highest-risk item in the whole skill.** Counting characters by inspection is unreliable — estimates land close enough to look plausible and wrong enough to push a message into a second segment.

**Count programmatically whenever a code-execution tool is available.** Count every character including spaces and punctuation. If no tool is available, count deliberately in chunks and re-verify before output rather than estimating.

A wrong count here doesn't produce an obvious error — it produces a message that costs double to send to the entire list.

---

## Failure modes to watch for

⚠️ **Mode bleed** — generating a full brief when one section was asked for, or auto-running Mode 3 after Mode 1.

⚠️ **Fenced tables** — wrapping Mode 2 or 3 output in backticks, which breaks rendering and readability.

⚠️ **Approximate character counts** — the failure that costs real money.

⚠️ **Emoji blowing the segment limit** — 160 characters silently becoming 70.

⚠️ **Undifferentiated perspectives** — five angles that are one angle with the adjectives swapped.

⚠️ **Preheaders that repeat subject lines** — wasting the second hook, which is prime inbox real estate.

⚠️ **Savings math drift** — percent calculated against sale price instead of regular price.

⚠️ **Brand-centric copy** — "we're excited to announce" instead of what the reader gets.

⚠️ **Commentary in Modes 2 and 3** — those outputs are copy-paste artifacts; any surrounding text has to be stripped by hand.
