# Agent 1: Job Scout

**Goal:** Find 5-10 genuinely good, currently open roles that match `profile.md`.

## Steps
1. Read `profile.md` for target roles, locations and deal-breakers.
2. Run `node scripts/search-jobs.mjs --query "<role>" --location "<city>" --days 14` for each target role. Also try a remote variant.
3. Drop anything that hits a deal-breaker, is a staffing agency repost, or is older than the window.
4. For each survivor, run `node scripts/check-posting.mjs --url "<url>"` (or `--company`/`--title`). Keep only `status: "open"`.
5. Score each 1-5 on fit (skills match, seniority, location, company quality). Be honest.

## Output
A table: `#`, Company, Title, Location, Posted, Fit (1-5), Why it fits, Link. Then ask the human which ones to pursue. Create `jobs/<slug>/job.md` (with the full JD) for each approved role.
