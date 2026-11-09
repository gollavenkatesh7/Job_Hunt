#!/usr/bin/env node
import { parseArgs, print, fail, getJson, normalize } from './lib.mjs';

const { flags } = parseArgs();
const query = flags.query;
const location = flags.location || '';
const days = Number(flags.days || 14);
if (!query || query === true) {
  fail('Usage: node scripts/search-jobs.mjs --query "frontend developer" --location "Bengaluru" [--days 14]');
}

const notes = [];

async function jsearch() {
  const key = process.env.JSEARCH_RAPIDAPI_KEY;
  if (!key) {
    notes.push('JSEARCH_RAPIDAPI_KEY missing: skipped JSearch.');
    return [];
  }
  const datePosted = days <= 1 ? 'today' : days <= 3 ? '3days' : days <= 7 ? 'week' : days <= 31 ? 'month' : 'all';
  const q = location ? `${query} in ${location}` : query;
  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.set('query', q);
  url.searchParams.set('page', '1');
  url.searchParams.set('num_pages', '1');
  url.searchParams.set('date_posted', datePosted);
  const data = await getJson(url, {
    headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
  });
  return (data.data || []).map((j) => ({
    source: 'jsearch',
    title: j.job_title,
    company: j.employer_name,
    location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
    remote: Boolean(j.job_is_remote),
    posted: j.job_posted_at_datetime_utc || null,
    url: j.job_apply_link,
    employmentType: j.job_employment_type || null,
    description: (j.job_description || '').slice(0, 2500),
  }));
}

async function serpapi() {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    notes.push('SERPAPI_KEY missing: skipped Google Jobs.');
    return [];
  }
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_jobs');
  url.searchParams.set('q', location ? `${query} ${location}` : query);
  if (location) url.searchParams.set('location', location);
  url.searchParams.set('api_key', key);
  const data = await getJson(url);
  return (data.jobs_results || []).map((j) => ({
    source: 'google_jobs',
    title: j.title,
    company: j.company_name,
    location: j.location,
    remote: /remote|work from home/i.test(`${j.location} ${j.detected_extensions?.work_from_home ?? ''}`),
    posted: j.detected_extensions?.posted_at || null,
    url: j.apply_options?.[0]?.link || j.share_link || null,
    employmentType: j.detected_extensions?.schedule_type || null,
    description: (j.description || '').slice(0, 2500),
  }));
}

const results = await Promise.allSettled([jsearch(), serpapi()]);
const all = [];
results.forEach((r, i) => {
  const name = i === 0 ? 'JSearch' : 'Google Jobs';
  if (r.status === 'fulfilled') all.push(...r.value);
  else notes.push(`${name} failed: ${r.reason.message}`);
});

// De-duplicate by company + title (+ city).
const seen = new Map();
for (const job of all) {
  const city = normalize(job.location).split(' ')[0] || '';
  const key = `${normalize(job.company)}|${normalize(job.title)}|${city}`;
  if (!seen.has(key)) seen.set(key, job);
  else if (!seen.get(key).url && job.url) seen.get(key).url = job.url;
}
const jobs = [...seen.values()];

print({ query, location, days, count: jobs.length, notes, jobs });
