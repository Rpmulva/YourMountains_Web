#!/usr/bin/env node
/**
 * Prep script for the FC-000005..FC-0000NN historical import block.
 *
 * Reads SharePoint List "YM Signup List" + MS Forms FC opt-in exports,
 * dedupes by LOWER(email), sorts by earliest signup_date ascending,
 * normalizes role values into segments arrays, and emits an INSERT block
 * that drops into database/migrations/members_marketing.sql.
 *
 * Input shape (both files accepted as CSV with header row):
 *   - SharePoint export: columns typically include Email, Role, Created (timestamptz)
 *   - MS Forms export:   columns vary — see CLI flags to map them
 *
 * Output: stdout — single INSERT statement with explicit member_numbers
 *          starting at FC-000005, plus a setval() line to advance the seq.
 *
 * Usage:
 *   node scripts/prep-members-historical-import.mjs \
 *     --sharepoint /path/to/sharepoint.csv \
 *     --msforms /path/to/msforms.csv \
 *     --start-fc 5 \
 *     [--sharepoint-email-col Email] \
 *     [--sharepoint-role-col Role] \
 *     [--sharepoint-date-col Created] \
 *     [--msforms-email-col Email] \
 *     [--msforms-role-col "Founder's Club: which best describes you?"] \
 *     [--msforms-date-col "Completion time"]
 *
 * Stops short of running anything. Pipes into the migration file by hand.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROLE_TO_SEGMENTS = {
  explorer:        ['Explorers'],
  explorers:       ['Explorers'],
  vendor:          ['Vendor Partners'],
  'vendor partner': ['Vendor Partners'],
  'vendor partners': ['Vendor Partners'],
  both:            ['Explorers', 'Vendor Partners'],
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      args[a.slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

// Minimal CSV parser handling quoted fields with embedded commas.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
        if (c === '\r' && text[i + 1] === '\n') i++;
      }
      else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return { header: [], rows: [] };
  const [header, ...data] = rows;
  return {
    header,
    rows: data.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? '']))),
  };
}

function normalizeRoleToSegments(roleRaw) {
  if (!roleRaw) return ['Explorers']; // sane default if source omits role
  const key = String(roleRaw).trim().toLowerCase();
  return ROLE_TO_SEGMENTS[key] ?? ['Explorers'];
}

function sqlString(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function sqlArray(arr) {
  if (!arr || !arr.length) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(sqlString).join(', ') + "]";
}

function sqlTimestamp(ts) {
  // Accept ISO 8601 or Sharepoint-style. Re-emit as ISO with timezone.
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Unparseable timestamp: ${ts}`);
  }
  return sqlString(d.toISOString()) + '::timestamptz';
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.sharepoint && !args.msforms) {
    console.error('Provide at least one of --sharepoint <csv> or --msforms <csv>.');
    process.exit(2);
  }

  const startFc = parseInt(args['start-fc'] ?? '5', 10);

  const records = []; // { email, segments[], created_at, source }

  if (args.sharepoint) {
    const text = fs.readFileSync(path.resolve(args.sharepoint), 'utf8');
    const { rows } = parseCSV(text);
    const emailCol = args['sharepoint-email-col'] ?? 'Email';
    const roleCol  = args['sharepoint-role-col']  ?? 'Role';
    const dateCol  = args['sharepoint-date-col']  ?? 'Created';
    for (const r of rows) {
      const email = (r[emailCol] || '').trim();
      if (!email) continue;
      records.push({
        email,
        segments: normalizeRoleToSegments(r[roleCol]),
        created_at: r[dateCol] || null,
        source: 'sharepoint',
      });
    }
  }

  if (args.msforms) {
    const text = fs.readFileSync(path.resolve(args.msforms), 'utf8');
    const { rows } = parseCSV(text);
    const emailCol = args['msforms-email-col'] ?? 'Email';
    const roleCol  = args['msforms-role-col']  ?? 'Role';
    const dateCol  = args['msforms-date-col']  ?? 'Completion time';
    for (const r of rows) {
      const email = (r[emailCol] || '').trim();
      if (!email) continue;
      records.push({
        email,
        segments: normalizeRoleToSegments(r[roleCol]),
        created_at: r[dateCol] || null,
        source: 'msforms',
      });
    }
  }

  // Dedupe by lower(email). On collision: union segments, keep earliest created_at.
  const byEmail = new Map();
  for (const rec of records) {
    const key = rec.email.toLowerCase();
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, { ...rec, segments: [...rec.segments] });
      continue;
    }
    // Union segments
    const merged = new Set([...existing.segments, ...rec.segments]);
    existing.segments = Array.from(merged).sort();
    // Keep earliest non-null created_at
    if (rec.created_at) {
      const a = existing.created_at ? new Date(existing.created_at).getTime() : Infinity;
      const b = new Date(rec.created_at).getTime();
      if (!Number.isFinite(a) || b < a) existing.created_at = rec.created_at;
    }
  }

  // Sort chronologically by created_at ascending; rows missing dates go last.
  const merged = Array.from(byEmail.values()).sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : Infinity;
    const tb = b.created_at ? new Date(b.created_at).getTime() : Infinity;
    return ta - tb;
  });

  // Emit
  console.log('-- Historical FC signups merged from SharePoint + MS Forms.');
  console.log(`-- Source rows: ${records.length} (sharepoint=${records.filter(r => r.source === 'sharepoint').length}, msforms=${records.filter(r => r.source === 'msforms').length})`);
  console.log(`-- Deduped: ${merged.length} unique emails`);
  console.log(`-- Numbering: FC-${String(startFc).padStart(6, '0')}..FC-${String(startFc + merged.length - 1).padStart(6, '0')}`);
  console.log('');
  console.log('INSERT INTO public.members (email, segments, tier, member_number, created_at) VALUES');
  const lines = merged.map((rec, idx) => {
    const n = startFc + idx;
    const fc = 'FC-' + String(n).padStart(6, '0');
    const ts = rec.created_at ? sqlTimestamp(rec.created_at) : "'__BETA_LAUNCH_DATE__'::timestamptz";
    return `  (${sqlString(rec.email)}, ${sqlArray(rec.segments)}, 'founder', ${sqlString(fc)}, ${ts})`;
  });
  console.log(lines.join(',\n') + ';');
  console.log('');
  console.log(`-- Next FC number for Three Partners append: FC-${String(startFc + merged.length).padStart(6, '0')}`);
}

main();
