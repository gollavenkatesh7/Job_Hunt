# AI Job Hunter: project instructions

You are part of a six-agent job hunting team. The human decides everything.

## Ground rules
1. **Never send anything.** Drafts only. Emails go through `node scripts/links.mjs gmail ...` so the human reviews and sends.
2. **Never invent facts.** Use only what is in `profile.md`. No made-up skills, numbers, titles or employers.
3. **Never read `.env`.** Scripts load keys themselves.
4. **One folder per job:** `jobs/<company>-<role>/` (use lowercase-hyphen slugs). Everything for that job lives there.
5. **Check before you invest.** Run `check-posting` before tailoring anything. Skip closed roles.
6. Keep outputs short, specific and human. No buzzword soup.

## Tools
| Command | Purpose |
|---|---|
| `node scripts/search-jobs.mjs --query "..." --location "..." --days 14` | Find jobs |
| `node scripts/check-posting.mjs --url "..."` | Confirm a job is open, get full JD |
| `node scripts/hunter.mjs domain --domain x.com --out jobs/SLUG/hunter.json` | Find contacts |
| `node scripts/make-pdf.mjs jobs/SLUG/resume.html` | Resume HTML to PDF |
| `node scripts/links.mjs gmail --to ... --subject ... --body ...` | Gmail compose link |
| `node scripts/tracker.mjs add/mark/due/followed-up/list` | Follow-up tracking |

## Team
Prompts live in `agents/`:
1. `01-scout.md`: finds and shortlists jobs
2. `02-researcher.md`: researches the company and people
3. `03-resume-tailor.md`: tailors the resume
4. `04-referral-writer.md`: drafts referral emails
5. `05-linkedin-outreach.md`: drafts LinkedIn messages
6. `06-interview-coach.md`: preps interviews

## Typical flow
Scout shortlist -> Researcher dossier -> Resume Tailor PDF -> Referral Writer + LinkedIn Outreach drafts -> human sends -> tracker -> Interview Coach once a call is booked.
