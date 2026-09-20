---
name: email-marketing-development
description: Build deployable, accessible HTML email and diagnose MJML/VML, ESP, dark-mode, size, and client-rendering issues.
metadata:
  baseline-version: "3.0"
  enhancement-version: "1.0.0"
  compact-revision: "1.1.0"
---

# Email Marketing Development

Read [AIO shared controls](AIO.md#shared-controls) once. Treat rendering, accessibility, deliverability, sender reputation/permission/engagement, compiled size, unsubscribe visibility, and compliance-sensitive content as production constraints. [Copywriting](copywriting.md) owns strategy/text; retain its SMS opt-in.

1. Freeze approved copy, links, merge tags, legal/unsubscribe/tracking requirements, width, mobile behavior, ESP, and client matrix. If the user requires side-by-side mobile columns, preserve that behavior and check legibility; do not stack automatically.
2. Use modular responsive MJML when suitable; raw HTML/VML for necessary client behavior. Use email-safe tables/CSS, presentation roles on layout tables, explicit image dimensions, meaningful alt/link text, readable contrast, logical reading order, and resilience to blocked images. Never assume browser CSS support.
3. Preserve functional MSO conditional comments and required Outlook Desktop VML fallbacks. Distinguish them from authoring comments; simplification must not remove rendering/platform behavior.
4. Inspect the compiled artifact, ESP transformation, and received message as relevant, not only source. Test the actual high-risk pattern in target clients, including required Gmail, Outlook desktop/web/mobile, Apple Mail/mobile variants, and applicable dark mode.
5. Check image dimensions/fallback colors, destinations, tags, long content, image blocking, and relevant client states. Measure compiled/received size when clipping is a concern; keep unsubscribe/legal/tracking visible. Do not invent a universal clipping guarantee.
6. Verify platform syntax/procedures in current official ESP documentation. Unknown merge tags require a visible development placeholder or a question when they block deployment, not plausible invented syntax.
7. Fix the smallest failing module, preserve approved content, and rerun affected checks. Record client/platform/method/artifact/result; separate actual client tests from compatibility reasoning. A browser screenshot does not prove Outlook Desktop compatibility.

Report **compiled, imported, previewed, test-sent, client-verified, campaign-sent** as distinct states, only when reached. Building a template does not authorize sending. Useful quality evidence includes tested portfolio patterns, client matrices, modular source, and accessibility notes; never claim unperformed testing or credentials.
