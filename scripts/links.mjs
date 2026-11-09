#!/usr/bin/env node
// Prints ready-to-click links. Nothing is ever sent for you.
import { parseArgs, print, fail } from './lib.mjs';

const { positional, flags } = parseArgs();
const cmd = positional[0];

if (cmd === 'gmail') {
  if (!flags.subject || !flags.body) fail('Usage: node scripts/links.mjs gmail [--to a@b.com] --subject "..." --body "..."');
  const u = new URL('https://mail.google.com/mail/');
  u.searchParams.set('view', 'cm');
  u.searchParams.set('fs', '1');
  if (flags.to) u.searchParams.set('to', flags.to);
  u.searchParams.set('su', flags.subject);
  u.searchParams.set('body', flags.body);
  print({ gmail: u.toString() });
} else if (cmd === 'linkedin-people') {
  if (!flags.company) fail('Usage: node scripts/links.mjs linkedin-people --company "Acme" [--role "engineering manager"]');
  const kw = [flags.company, flags.role].filter((x) => x && x !== true).join(' ');
  const u = new URL('https://www.linkedin.com/search/results/people/');
  u.searchParams.set('keywords', kw);
  print({ linkedin: u.toString() });
} else if (cmd === 'linkedin-jobs') {
  if (!flags.query) fail('Usage: node scripts/links.mjs linkedin-jobs --query "frontend" [--location "Bengaluru"]');
  const u = new URL('https://www.linkedin.com/jobs/search/');
  u.searchParams.set('keywords', flags.query);
  if (flags.location) u.searchParams.set('location', flags.location);
  print({ linkedin: u.toString() });
} else {
  fail('Commands: gmail | linkedin-people | linkedin-jobs');
}
