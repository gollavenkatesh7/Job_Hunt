#!/usr/bin/env node
// Renders a resume HTML file to an A4 PDF next to it.
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs, fail, print } from './lib.mjs';

const { positional } = parseArgs();
const input = positional[0];
if (!input) fail('Usage: node scripts/make-pdf.mjs jobs/SLUG/resume.html');
const file = path.resolve(input);
if (!fs.existsSync(file)) fail(`File not found: ${input}`);

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  fail('puppeteer is not installed. Run `npm install` first.');
}

const out = file.replace(/\.html?$/i, '') + '.pdf';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' },
  });
  const pages = (await fs.promises.readFile(out)).toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? null;
  print({ pdf: path.relative(process.cwd(), out), pages, warning: pages > 1 ? 'Resume is longer than one page. Trim it.' : undefined });
} finally {
  await browser.close();
}
