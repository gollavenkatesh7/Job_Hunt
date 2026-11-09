#!/usr/bin/env node
// Tracks outreach in tracker.json and lists follow-ups that are due.
import path from 'node:path';
import { ROOT, parseArgs, print, fail, readJson, writeJson } from './lib.mjs';

const FILE = path.join(ROOT, 'tracker.json');
const STATUSES = ['sent', 'replied', 'referred', 'interview', 'rejected', 'ghosted', 'offer', 'closed'];
const { positional, flags } = parseArgs();
const cmd = positional[0];
const data = readJson(FILE, { nextId: 1, entries: [] });
const day = 86400000;
const today = () => new Date().toISOString().slice(0, 10);
const find = (id) => data.entries.find((e) => e.id === Number(id)) || fail(`No entry with id ${id}`);
const save = () => writeJson(FILE, data);

switch (cmd) {
  case 'add': {
    if (!flags.company || !flags.contact) {
      fail('Usage: node scripts/tracker.mjs add --company Acme --contact "Jane Doe" [--role "Frontend"] [--channel email|linkedin] [--days 5] [--note "..."]');
    }
    const days = Number(flags.days || 5);
    const entry = {
      id: data.nextId++,
      company: flags.company,
      contact: flags.contact,
      role: flags.role || null,
      channel: flags.channel || 'email',
      status: 'sent',
      sentOn: today(),
      followUpOn: new Date(Date.now() + days * day).toISOString().slice(0, 10),
      followUps: 0,
      note: flags.note || null,
    };
    data.entries.push(entry);
    save();
    print(entry);
    break;
  }
  case 'mark': {
    if (!flags.id || !STATUSES.includes(flags.status)) fail(`Usage: node scripts/tracker.mjs mark --id 3 --status ${STATUSES.join('|')}`);
    const e = find(flags.id);
    e.status = flags.status;
    if (flags.note) e.note = flags.note;
    save();
    print(e);
    break;
  }
  case 'followed-up': {
    if (!flags.id) fail('Usage: node scripts/tracker.mjs followed-up --id 3 [--days 7]');
    const e = find(flags.id);
    e.followUps += 1;
    e.followUpOn = new Date(Date.now() + Number(flags.days || 7) * day).toISOString().slice(0, 10);
    save();
    print(e);
    break;
  }
  case 'due': {
    const due = data.entries.filter((e) => e.status === 'sent' && e.followUpOn <= today());
    print({ today: today(), count: due.length, due });
    break;
  }
  case 'list': {
    const entries = flags.status ? data.entries.filter((e) => e.status === flags.status) : data.entries;
    print({ count: entries.length, entries });
    break;
  }
  default:
    fail('Commands: add | mark | due | followed-up | list');
}
