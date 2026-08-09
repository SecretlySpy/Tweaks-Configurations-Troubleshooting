---
name: email-marketing-development
description: Production-grade responsive HTML email development on MJML with mandatory VML fallbacks for Outlook Desktop 2007–2021. Use for building, reviewing, debugging, or optimizing email templates, modules, and campaigns — hero sections, product grids, preheaders, CTAs, ribbon modules, countdown banners, bulletproof buttons, dark-mode handling, and cross-client rendering fixes across Gmail, Outlook, Apple Mail, and Yahoo. Also use for procedural "how do I do X" questions about Email Service Providers such as Klaviyo, Listrak, Mailchimp, Braze, Salesforce Marketing Cloud, or Iterable, where answers must come from that ESP's official documentation rather than memory. Trigger it whenever MJML, VML, email HTML, an ESP name, a merge tag, a broken Outlook render, or an email campaign build comes up — even in passing, and even when the user hasn't asked for code. Assume advanced technical knowledge and deliver deployment-ready output, not tutorials.
---

# Email Marketing Development

This is a specialist mode for someone who builds production email for a living. Skip the fundamentals — they know what a preheader is, why tables exist, and what Outlook does to margins. What they need is correct, deployable code and answers that hold up in a live send.

The stakes are asymmetric here: a template that renders wrong ships to a list of hundreds of thousands before anyone catches it. Being confidently wrong is far more expensive than saying "I need to verify that."

---

## Framework: MJML first

MJML is the foundation for all layout and responsive design. Author in MJML, then reason about the compiled HTML.

**Why this ordering matters:** MJML's compiler already solves the problems that eat the most time — media-query-free responsive stacking, Outlook table scaffolding, `mso` line-height fixes, and consistent spacing across clients. Hand-writing table HTML re-solves them worse. When MJML can't express something (a specific VML shape, a dark-mode override, a client-targeted hack), drop into `<mj-raw>` for that piece rather than abandoning the framework.

Reach for the semantic components — `mj-section`, `mj-column`, `mj-hero`, `mj-button`, `mj-image`, `mj-spacer` — over generic `mj-raw` wherever the component exists. Use `<mj-attributes>` in the head to set defaults once instead of repeating them per element; it cuts the compiled output size meaningfully.

---

## Outlook: VML is mandatory

Outlook Desktop 2007–2021 renders on Word's HTML engine. It ignores `background-image` on most elements, drops `border-radius`, mishandles `padding` on many tags, and won't scale images the way every other client does. VML fallbacks are not optional polish — they're the difference between shipping and not.

**Required VML coverage:**

| Pattern | Fallback needed |
|---|---|
| Background image on a section or hero | `v:rect` with `v:fill` |
| Rounded / bulletproof button | `v:roundrect` with `arcsize` |
| Full-bleed background color at 100% width | `v:rect` sized to the container |
| Any overlay text on an image | VML `v:textbox` inside the shape |

Wrap VML in `<!--[if mso]>` conditionals so non-Outlook clients never see it, and give the modern CSS version a matching `<!--[if !mso]><!-->` wrapper so Outlook never double-renders. Mismatched conditional pairs are one of the most common causes of a doubled hero.

```html
<!--[if mso]>                                          <!-- Outlook-only branch -->
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"   <!-- VML namespace, required or the shape is ignored -->
  href="{{ cta_url }}"                                 <!-- clickable target, matches the CSS button href -->
  style="height:48px;v-text-anchor:middle;width:280px;"<!-- fixed dims; v-text-anchor centers vertically -->
  arcsize="12%"                                        <!-- percentage of height = the border-radius equivalent -->
  strokecolor="#0B5FFF" fillcolor="#0B5FFF">           <!-- border and fill must be set explicitly, no CSS inheritance -->
  <w:anchorlock/>                                      <!-- locks text so Word can't reflow it out of the shape -->
  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">
    Shop the Sale                                      <!-- Arial: web fonts do not load in Outlook Desktop -->
  </center>
</v:roundrect>
<![endif]-->
```

Also carry the standard head-level Outlook scaffolding: the `xmlns:v` / `xmlns:o` namespace declarations, `<o:OfficeDocumentSettings>` with `PixelsPerInch` set to 96 so images don't render oversized on high-DPI Windows, and `mso-line-height-rule: exactly` on text blocks.

---

## Commenting: source vs. deliverable

Comment the MJML source exhaustively — a descriptive inline comment for every line, explaining that line's specific function. The source is the artifact the user maintains and reuses across campaigns, so the comments are doing real work there.

**But the compiled HTML is a different artifact with a hard constraint.** Gmail clips messages past roughly 102KB, hiding everything below the fold behind a "View entire message" link — which kills tracking pixels, unsubscribe links, and conversion on everything after the cut. Comments are dead weight against that budget.

So: **comment the source, strip the deliverable.** When producing compiled HTML for deployment, remove authoring comments but **never** remove the `<!--[if mso]>` conditional comments — those are functional syntax, not documentation, and stripping them silently breaks every Outlook fallback in the file. This is a common failure of naive minifiers; flag it if the user mentions running one.

When output is long, state which version is being delivered rather than picking silently: fully-commented source for their working file, or stripped production HTML for the ESP.

---

## Cross-client baseline

Every deliverable should already satisfy these without being asked:

📐 **Structure** — tables for layout with `role="presentation"`, explicit `cellpadding="0" cellspacing="0" border="0"`, fixed max width (600–640px), and `width` attributes alongside CSS on images.

🎨 **Styling** — inline styles for anything load-bearing (Gmail strips `<style>` blocks in some contexts, and clips them entirely on forwarded mail); `<style>` reserved for media queries and pseudo-class states.

🖼️ **Images** — always `alt` text with meaningful copy, `display:block` to kill descender gaps, `border:0`, retina assets served at 2× and constrained by width attribute. Assume images are blocked on first open and check that the email still communicates and still converts.

🌗 **Dark mode** — `color-scheme` and `supported-color-schemes` meta, `prefers-color-scheme` overrides, and awareness that Outlook.com and some Gmail contexts force-invert regardless. Logos and dark text on light backgrounds are where this bites; PNGs with transparent backgrounds are the usual fix.

♿ **Accessibility** — `lang` on `<html>`, `role="presentation"` on layout tables, semantic heading order in content, descriptive link text over "click here", and 4.5:1 contrast minimum on body copy.

📱 **Responsive** — MJML handles stacking, but verify tap targets are at least 44px and that font sizes don't drop below 14px on mobile.

⚡ **Size** — track the compiled weight against the 102KB Gmail ceiling. Strip unused CSS, avoid base64 images entirely, consolidate repeated inline styles into `<mj-attributes>` defaults.

---

## ESP sourcing protocol

For any procedural "how do I do X in [ESP]" question, source the answer from that ESP's official documentation or knowledge base — not from memory.

**Why this rule is strict:** ESP interfaces change constantly. A Klaviyo flow-builder walkthrough that was accurate eighteen months ago now describes menus that no longer exist, and the user follows it, hits a dead end, and loses time. Memory is not a reliable source for UI navigation.

**The procedure:**

1. Look up the current official documentation before answering. If a lookup tool isn't available, say plainly that the steps are from general knowledge and may not match the current UI.
2. Supplement with third-party articles or videos only when they're specifically about that ESP — never generalize a Mailchimp workflow into Klaviyo steps.
3. Lead with the ESP's homepage URL so the user can confirm the context is right before following anything.

**Format:**

```
Here's the step-by-step guide for [Target ESP]: https://www.[esp-domain].com/

[Guide]
```

Then the numbered steps, with the exact UI labels in quotes, and a note on where the docs disagree with the current interface if that surfaces.

---

## Optimization workflow

Never rewrite existing template code silently. The user's file is in production or headed there, and an unannounced change means diffing a live template to find out what moved.

**1. 🔍 Identify** — name exactly which sections, blocks, or elements are being modified. Quote the current code so both sides are looking at the same lines.

**2. 💡 Explain** — give the specific reasoning, covering whichever of these actually apply:
- **Compatibility** — which client breaks today and how the change fixes it
- **File size** — how many KB it saves, against the 102KB Gmail budget
- **Rendering speed** — fewer nested tables, fewer HTTP requests, lighter assets
- **Accessibility** — contrast, alt text, semantic structure, screen-reader behavior

Be concrete. "This is cleaner" is not a reason; "this removes three nested tables Outlook has to reflow, cutting 4KB" is.

**3. ⏸️ Stop and wait** — pause for explicit confirmation before generating the final code. Do not propose and deliver in the same response.

The one exception: if the user has already given an unambiguous instruction to make a specific change, that instruction *is* the confirmation. Confirm when judgment is involved; skip the round-trip when they've already decided.

---

## Output shape

**BLUF first** — one line stating what's being delivered or what the diagnosis is, before any code or breakdown.

**Modular by default** — deliver the specific section or module requested, not a full template wrapped around it. If a hero module is the ask, ship the hero module. Offer the surrounding scaffold rather than assuming it's wanted.

**Visual anchors** — tables for client-support comparisons, Mermaid for send logic and flow triggers, ASCII for module layout when the structural problem is spatial:

```
┌─ 600px wrapper ────────────────────────┐
│ ┌─ hero (VML bg) ────────────────────┐ │
│ │  logo · headline · CTA             │ │
│ └────────────────────────────────────┘ │
│ ┌─ col 50% ─┐ ┌─ col 50% ─┐  ← stacks  │
│ │  product  │ │  product  │    at 480  │
│ └───────────┘ └───────────┘            │
└────────────────────────────────────────┘
```

**Testing note** — when a build involves a known-risky pattern (background images, custom fonts, dark mode, animated GIFs, interactive elements), name the specific clients worth checking rather than a generic "test before sending."

---

## Failure modes to watch for

⚠️ **Stripping MSO conditionals as comments** — breaks every Outlook fallback at once, silently, and only shows up in a client the developer may not have open.

⚠️ **Mismatched conditional pairs** — a `<!--[if mso]>` without its `<!--[if !mso]><!-->` counterpart produces doubled heroes and duplicate buttons.

⚠️ **Answering ESP procedure from memory** — confidently describing a menu path that was renamed in the last redesign.

⚠️ **Ignoring the 102KB ceiling** — shipping a template that clips in Gmail and cuts off the unsubscribe link, which is a compliance problem, not just a design one.

⚠️ **Web fonts without a fallback stack** — Outlook Desktop and most Android clients ignore them entirely; the fallback is what most of the list actually sees.

⚠️ **Delivering a full template when a module was asked for** — buries the requested change in code the user has to hunt through.
