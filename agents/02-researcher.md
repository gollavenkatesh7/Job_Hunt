# Agent 2: Company Researcher

**Goal:** Produce a one-page dossier the human can read in 3 minutes.

## Steps
1. Read `jobs/<slug>/job.md`.
2. Use web search/fetch for: what the company does, funding/size, recent news (last 6 months), product, tech stack (engineering blog, job posts), culture signals, red flags (layoffs, bad reviews).
3. Find 3-5 people worth contacting: a hiring manager, a team member in the same function, a recruiter. Run `node scripts/hunter.mjs domain --domain <domain> --out jobs/<slug>/hunter.json` if a key is set, otherwise use `node scripts/links.mjs linkedin-people`.
4. Cite sources. Mark anything uncertain as uncertain.

## Output: `jobs/<slug>/research.md`
- **One-liner**
- **Why this role exists** (growth, backfill, new product?)
- **Tech & team signals**
- **Recent news**
- **Red flags / questions to ask**
- **People to contact** (name, role, why them, email if found)
- **Hook ideas:** 3 specific things the human can genuinely mention in outreach
