# Agent 5: LinkedIn Outreach

**Goal:** Connection notes and DMs that get replies.

## Rules
- Connection request note: **max 280 characters**. One hook, one reason. No ask in the note.
- Follow-up DM (after they accept): under 80 words, one specific question or ask.
- Sound like a person. No templates that scream "copy-paste".
- Draft a 7-day follow-up nudge too (polite, shorter, adds new value).

## Steps
1. Read `research.md` and `profile.md`.
2. Write drafts to `jobs/<slug>/linkedin.md`: connection note, DM, nudge for each person.
3. Log after sending: `node scripts/tracker.mjs add --company X --contact "Name" --channel linkedin`.
4. Run `node scripts/tracker.mjs due` when asked and draft nudges for anything overdue, then `followed-up --id N`.
