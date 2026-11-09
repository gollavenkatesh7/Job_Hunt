#!/usr/bin/env node
// Checks that a job is still open on Greenhouse, Lever or Ashby. No API key needed.
import { parseArgs, print, fail, getJson, stripHtml, slugify, normalize } from './lib.mjs';

const { flags } = parseArgs();
const { url, company, title } = flags;
if (!url && !(company && title)) {
  fail('Usage: node scripts/check-posting.mjs --url "<job url>"  OR  --company "Acme" --title "Frontend Engineer"');
}

const ats = {
  greenhouse: {
    async byId(board, id) {
      const j = await getJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${id}`);
      return {
        ats: 'greenhouse', board, id: String(j.id), title: j.title, location: j.location?.name,
        url: j.absolute_url, description: stripHtml(decodeEntities(j.content)),
      };
    },
    async list(board) {
      const d = await getJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`);
      return (d.jobs || []).map((j) => ({
        ats: 'greenhouse', board, id: String(j.id), title: j.title, location: j.location?.name,
        url: j.absolute_url, description: stripHtml(decodeEntities(j.content)),
      }));
    },
  },
  lever: {
    async byId(board, id) {
      const j = await getJson(`https://api.lever.co/v0/postings/${board}/${id}`);
      return leverShape(board, j);
    },
    async list(board) {
      const d = await getJson(`https://api.lever.co/v0/postings/${board}?mode=json`);
      return d.map((j) => leverShape(board, j));
    },
  },
  ashby: {
    async list(board) {
      const d = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${board}`);
      return (d.jobs || []).map((j) => ({
        ats: 'ashby', board, id: j.id, title: j.title, location: j.location,
        url: j.jobUrl, description: j.descriptionPlain || stripHtml(j.descriptionHtml),
      }));
    },
    async byId(board, id) {
      const all = await this.list(board);
      return all.find((j) => j.id === id) || null;
    },
  },
};

function leverShape(board, j) {
  return {
    ats: 'lever', board, id: j.id, title: j.text, location: j.categories?.location,
    url: j.hostedUrl, description: j.descriptionPlain || stripHtml(j.description),
  };
}

function decodeEntities(s = '') {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function parseUrl(u) {
  let x;
  try { x = new URL(u); } catch { return null; }
  const parts = x.pathname.split('/').filter(Boolean);
  if (/greenhouse\.io$/.test(x.hostname)) {
    const jobId = x.searchParams.get('gh_jid') || parts[parts.indexOf('jobs') + 1];
    if (parts[0] && jobId) return { ats: 'greenhouse', board: parts[0], id: jobId };
  }
  if (x.hostname === 'jobs.lever.co' && parts.length >= 2) return { ats: 'lever', board: parts[0], id: parts[1] };
  if (x.hostname === 'jobs.ashbyhq.com' && parts.length >= 2) return { ats: 'ashby', board: parts[0], id: parts[1] };
  return null;
}

async function main() {
  if (url) {
    const p = parseUrl(url);
    if (!p) {
      return print({ status: 'unknown', reason: 'URL is not a Greenhouse, Lever or Ashby link. Check the page manually or try --company and --title.', url });
    }
    try {
      const job = await ats[p.ats].byId(p.board, p.id);
      if (!job) return print({ status: 'closed', ...p });
      return print({ status: 'open', ...job });
    } catch (e) {
      const closed = /^404/.test(e.message);
      return print({ status: closed ? 'closed' : 'error', ...p, detail: e.message });
    }
  }

  // Company + title search across all three boards.
  const base = slugify(company);
  const slugs = [...new Set([base, base.replace(/-/g, ''), base.split('-')[0]])];
  const wanted = normalize(title);
  const tried = [];
  for (const slug of slugs) {
    for (const name of ['greenhouse', 'lever', 'ashby']) {
      try {
        const jobs = await ats[name].list(slug);
        tried.push(`${name}:${slug}`);
        const hits = jobs
          .map((j) => ({ j, score: overlap(wanted, normalize(j.title)) }))
          .filter((x) => x.score >= 0.6)
          .sort((a, b) => b.score - a.score);
        if (hits.length) {
          return print({ status: 'open', matches: hits.slice(0, 3).map((h) => ({ ...h.j, matchScore: +h.score.toFixed(2) })) });
        }
      } catch { /* board does not exist, try next */ }
    }
  }
  print({ status: 'not_found', note: 'No matching open role on Greenhouse, Lever or Ashby. It may be closed, or hosted elsewhere.', tried });
}

function overlap(a, b) {
  const A = new Set(a.split(' '));
  const B = new Set(b.split(' '));
  let hit = 0;
  for (const w of A) if (B.has(w)) hit++;
  return A.size ? hit / A.size : 0;
}

main().catch((e) => fail(e.message));
