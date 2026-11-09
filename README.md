# AI Job Hunter

A team of six AI agents that find jobs, research companies, tailor your resume, draft referral emails and LinkedIn messages, and prep you for interviews, all running in [Claude Code](https://claude.com/claude-code).

This repo holds the small Node.js tools the agents call, plus the agent prompts. **You decide everything; nothing is ever sent for you.**

## What's inside

```
ai-job-hunter/
├── agents/                 Prompts for the six agents
├── scripts/
│   ├── search-jobs.mjs     JSearch + Google Jobs, merged and de-duplicated
│   ├── check-posting.mjs   Is the job still open? (Greenhouse, Lever, Ashby)
│   ├── hunter.mjs          Find and verify contact emails (Hunter.io)
│   ├── make-pdf.mjs        Resume HTML -> A4 PDF
│   ├── links.mjs           Gmail compose / LinkedIn search links
│   ├── tracker.mjs         Outreach tracker with follow-up reminders
│   ├── resume-template.html
│   └── lib.mjs             Shared helpers
├── .claude/settings.json   Permissions (allows scripts, blocks reading .env)
├── CLAUDE.md               Project rules every agent follows
├── profile.example.md      Your targets + master resume
└── .env.example
```

## Setup

Requires **Node.js 20.12+**.

```bash
npm install
cp .env.example .env
cp profile.example.md profile.md
mkdir -p jobs
```

Fill in `.env` (every key is optional; scripts skip a service whose key is missing):

| Key | Used by | Where to get it |
|---|---|---|
| `JSEARCH_RAPIDAPI_KEY` | `search-jobs` | JSearch on [RapidAPI](https://rapidapi.com) (free tier) |
| `SERPAPI_KEY` | `search-jobs` | [SerpApi](https://serpapi.com) (free tier) |
| `HUNTER_API_KEY` | `hunter` | [Hunter.io](https://hunter.io) (optional) |

Then fill in `profile.md` with your target roles and your full master resume. Agents may only reword what is in it; they must never invent anything.

`.env`, `profile.md`, `jobs/` and `tracker.json` are git-ignored, so your keys, resume and job data stay on your machine.

## Scripts

```bash
# Find jobs
node scripts/search-jobs.mjs --query "frontend developer" --location "Bengaluru" --days 14

# Is it still open? (also returns the full description)
node scripts/check-posting.mjs --url "https://boards.greenhouse.io/acme/jobs/12345"
node scripts/check-posting.mjs --company "Acme" --title "Frontend Engineer"

# Find people to contact (results cached in --out to save credits)
node scripts/hunter.mjs domain --domain acme.com --out jobs/acme-frontend/hunter.json
node scripts/hunter.mjs find --domain acme.com --first Jane --last Doe
node scripts/hunter.mjs verify --email jane@acme.com

# Resume -> PDF
cp scripts/resume-template.html jobs/acme-frontend/resume.html   # fill it in
node scripts/make-pdf.mjs jobs/acme-frontend/resume.html

# Draft links (you review and send)
node scripts/links.mjs gmail --to jane@acme.com --subject "Referral for Frontend role" --body "Hi Jane, ..."
node scripts/links.mjs linkedin-people --company "Acme" --role "engineering manager"

# Track outreach
node scripts/tracker.mjs add --company Acme --contact "Jane Doe" --role "Frontend" --channel email --days 5
node scripts/tracker.mjs due
node scripts/tracker.mjs followed-up --id 1
node scripts/tracker.mjs mark --id 1 --status replied
node scripts/tracker.mjs list
```

## Using it with Claude Code

1. Open this folder in Claude Code. `CLAUDE.md` and `.claude/settings.json` load automatically.
2. Start with the Scout: *"Act as the agent in agents/01-scout.md and find me jobs."*
3. Pick a job, then run agents 02 -> 03 -> 04/05 in order. Run 06 when an interview is booked.

Each agent prompt is plain Markdown. Edit them to match your style. You can also run them as separate Claude Code sessions or subagents if you want them working in parallel.

## Notes

- Greenhouse, Lever and Ashby expose public job APIs, so `check-posting` needs no key. Other job boards return `status: "unknown"`.
- Be considerate with outreach: personalise every message, send a few at a time, and respect "no".

## License

MIT
