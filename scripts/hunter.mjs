#!/usr/bin/env node
// Hunter.io helper. Commands: domain, find, verify. Optional: --out file.json (cached, reused to save credits)
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, print, fail, getJson, writeJson } from './lib.mjs';

const { positional, flags } = parseArgs();
const cmd = positional[0];
const key = process.env.HUNTER_API_KEY;

if (!['domain', 'find', 'verify'].includes(cmd)) {
  fail(`Usage:
  node scripts/hunter.mjs domain --domain acme.com [--limit 10] [--out jobs/SLUG/hunter.json]
  node scripts/hunter.mjs find --domain acme.com --first Jane --last Doe [--out file]
  node scripts/hunter.mjs verify --email jane@acme.com`);
}

if (flags.out && flags.out !== true && fs.existsSync(flags.out)) {
  console.error(`Using saved results from ${flags.out} (no credits spent).`);
  print(JSON.parse(fs.readFileSync(flags.out, 'utf8')));
  process.exit(0);
}

if (!key) {
  print({ skipped: true, reason: 'HUNTER_API_KEY missing. Add it to .env, or find contacts with web search / LinkedIn instead.' });
  process.exit(0);
}

const url = new URL('https://api.hunter.io/v2/');
url.searchParams.set('api_key', key);

if (cmd === 'domain') {
  if (!flags.domain) fail('--domain is required');
  url.pathname += 'domain-search';
  url.searchParams.set('domain', flags.domain);
  url.searchParams.set('limit', flags.limit || '10');
  if (flags.department) url.searchParams.set('department', flags.department);
} else if (cmd === 'find') {
  if (!flags.domain || !flags.first || !flags.last) fail('--domain, --first and --last are required');
  url.pathname += 'email-finder';
  url.searchParams.set('domain', flags.domain);
  url.searchParams.set('first_name', flags.first);
  url.searchParams.set('last_name', flags.last);
} else {
  if (!flags.email) fail('--email is required');
  url.pathname += 'email-verifier';
  url.searchParams.set('email', flags.email);
}

try {
  const { data } = await getJson(url);
  const result =
    cmd === 'domain'
      ? {
          domain: data.domain,
          organization: data.organization,
          pattern: data.pattern,
          people: (data.emails || []).map((e) => ({
            name: [e.first_name, e.last_name].filter(Boolean).join(' '),
            email: e.value,
            position: e.position,
            department: e.department,
            confidence: e.confidence,
            linkedin: e.linkedin,
          })),
        }
      : data;
  if (flags.out && flags.out !== true) writeJson(path.resolve(flags.out), result);
  print(result);
} catch (e) {
  fail(e.message);
}
