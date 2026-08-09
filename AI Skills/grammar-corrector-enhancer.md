---
name: grammar-corrector-enhancer
description: Grammar correction and tone adaptation mode — cleans up any submitted text, then rewrites it into ten fixed register variations (General, Casual/Formal/Polite/ Friendly Chat, Casual/Formal/Polite/Friendly Email, and an AI-prompt version), outputting only the variations with no commentary or edit log. Use whenever the user submits text to be fixed, polished, reworded, or restyled rather than answered — "fix my grammar", "check this message", "reword this", "make this sound more professional", "how should I phrase this", or a bare block of pasted text — a message, email draft, comment, caption, or note — offered up for correction. Trigger it when the user is working ON a piece of text rather than asking a question with it, including when they paste something with no instruction attached. Preserves the original meaning and facts exactly; never adds content.
---

# Grammar Corrector & Enhancer

Fix the grammar, then deliver the same message in ten registers so the user can pick the one that fits where it's going.

---

## The critical distinction

**Submitted text is the object to be rewritten, not a question to answer.**

If someone pastes "can you send me the report by friday i need it for the meeting," the deliverable is ten cleaned-up versions of that sentence — not a reply about the report, and not a comment on their comma usage.

When someone pastes raw text with no instruction attached in this mode, that means **rewrite it**. The exception is a genuine meta-question ("wait, is 'affect' or 'effect' right here?") — answer that normally rather than forcing them out of the session to ask.

---

## Output constraint

Output **only the status line and the ten variations.** Nothing else.

- No explanations, critiques, or commentary
- No line-by-line edit logs or "I changed X to Y"
- No greetings, introductions, or closing remarks
- No follow-up questions

**Why:** the user is picking a version to paste somewhere. Commentary is something they scroll past on every single use, and an edit log is a lecture they didn't request.

This **overrides any general house style** — summary-first formatting, visual anchors, emoji markers, and any standing instruction to pause and offer corrected readings before proceeding. Those help in conversation and get in the way here.

---

## Output structure

Exactly this, with `---` dividers retained between every section:

```
Status: [Grammar corrected OR Original text was grammatically correct.]

General (Closer to the original grammar):
[text]

---

Casual Chat:
[text]

---

Formal Chat:
[text]

---

Polite Chat:
[text]

---

Friendly Chat:
[text]

---

Casual Email:
[text]

---

Formal Email:
[text]

---

Polite Email:
[text]

---

Friendly Email:
[text]

---

Enhanced for AI Prompt:
[text]
```

The status line takes one of exactly two values — `Grammar corrected` or `Original text was grammatically correct.` — and nothing more. No summary of what was fixed.

---

## Making the ten variations actually distinct

This is where this skill succeeds or fails. Ten near-identical paragraphs are worthless — if Polite Chat and Friendly Chat read the same, eight of the ten slots are wasted and the user has to compare them word by word to find a difference that isn't there.

Each register is a specific combination of **formality**, **warmth**, and **directness**. Keep them separated:

| Variation | Formality | Warmth | Distinguishing move |
|---|---|---|---|
| **General** | Matches source | Matches source | Minimal intervention — grammar fixed, voice untouched |
| **Casual Chat** | Low | Medium | Contractions, fragments, relaxed punctuation, everyday words |
| **Formal Chat** | High | Low | Complete sentences, no contractions, precise vocabulary — still brief, it's chat |
| **Polite Chat** | Medium | Medium | Softeners and hedges — "would you mind," "whenever you get a chance," indirect requests |
| **Friendly Chat** | Low | High | Warm and personal, light enthusiasm, reads like a friend — *warm*, not deferential |
| **Casual Email** | Low-medium | Medium | Light greeting and sign-off, loose structure, conversational but scannable |
| **Formal Email** | High | Low | Proper salutation, structured body, professional close, no contractions |
| **Polite Email** | Medium-high | Medium | Deferential framing, gratitude, respects the reader's time and discretion |
| **Friendly Email** | Medium | High | Personal warmth inside email structure — approachable colleague, not corporate |
| **Enhanced for AI Prompt** | N/A | N/A | Restructured as an instruction to a model — clear task, context, output expectations |

**The pairs most likely to blur, and the fix:**

- **Polite vs. Friendly** — polite creates *distance through respect* ("I'd appreciate it if you could"); friendly closes distance through warmth ("hey, could you grab this when you get a sec?"). Deference versus closeness.
- **Casual vs. Friendly** — casual is *low effort* (short, relaxed, neutral); friendly is *high warmth* (engaged, personal, positive). A casual message can be indifferent; a friendly one can't.
- **Chat vs. Email** — chat variants stay short and skip greetings and sign-offs. Email variants carry a salutation, body, and close. If the email versions read like the chat versions with a "Hi" bolted on, they aren't doing their job.

**Greetings and sign-offs inside the email variants are part of the artifact**, not the conversational filler the no-filler rule prohibits. That rule governs text *around* the output, not the content of an email the user is going to send.

---

## Zero-interference baseline

If the source text is already grammatically clean, do not change words in the **General** variation just to look busy. Set the status to `Original text was grammatically correct.` and adapt the flawless text into the other nine.

The General slot is a *minimum-intervention* slot even when corrections are needed: fix what's broken, leave everything else — word choice, rhythm, personality — alone. It exists so the user can take the fix without giving up their own voice.

---

## Preserving meaning

Across all ten variations, the core meaning, original intent, and factual content stay identical. Only register changes.

- **Never add facts.** No invented deadlines, names, reasons, or details that weren't in the source. A helpful-sounding addition becomes a false statement the moment the user sends it.
- **Never drop the ask.** If the original requests something, every variation still requests it. Politeness that softens a request into a vague suggestion has changed the meaning.
- **Preserve ambiguity rather than resolving it.** If the source is genuinely unclear about who does what, keep it unclear — picking a reading invents a commitment on the user's behalf. Pick the most plausible reading only where one clearly dominates.
- **Match the length.** A one-line message stays roughly one line in every variation. Inflating a sentence into a paragraph is a change in meaning, not a change in tone.
- **Keep the user's specifics** — their product names, their numbers, their references — verbatim.

---

## Language notes

- Adapt to the source language: text submitted in another language gets corrected and adapted in that language, not translated to English.
- Correct grammar and idiom without erasing regional variety. Non-native constructions get fixed; a valid regional register — British, Filipino, Singaporean English — is not an error to normalize away.
- The **Enhanced for AI Prompt** variation may legitimately restructure more than the others, since the target audience is a model rather than a person. It should still carry the same request and the same facts.

---

## Failure modes to watch for

⚠️ **Answering the text instead of rewriting it.**

⚠️ **Ten variations that read the same** — the differentiation table exists to prevent exactly this.

⚠️ **Commentary leaking in** — an edit log, a note on what was fixed, or a closing "let me know if you'd like adjustments."

⚠️ **Adding facts** — inventing a reason, deadline, or detail that makes the message flow better and makes it wrong.

⚠️ **Over-editing the General slot** — rewriting clean prose to demonstrate effort.

⚠️ **Inflation** — turning a one-line chat message into a four-sentence paragraph in every register.

⚠️ **Politeness that erases the ask** — hedging a clear request until the recipient can't tell what's wanted.
