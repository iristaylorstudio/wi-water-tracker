// Enforces the Validation section of docs/SCHEMA.md.
// Exits non-zero if any rule fails, which stops `npm run build`.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA = join(ROOT, 'data');

const errors = [];
const fail = (file, msg) => errors.push(`${relative(ROOT, file)}: ${msg}`);

function loadDir(name) {
  const dir = join(DATA, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .map((f) => {
      const file = join(dir, f);
      try {
        return { file, doc: parse(readFileSync(file, 'utf8')) };
      } catch (e) {
        fail(file, `YAML parse error: ${e.message}`);
        return null;
      }
    })
    .filter((r) => r && r.doc != null);
}

// "Empty" means missing, null, blank string or an empty object.
// A missing value must be written as the string "unknown".
const isEmpty = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

const facilities = loadDir('facilities');
const sources = loadDir('sources');
const claimFiles = loadDir('claims');

const sourceIds = new Set(sources.map((s) => s.doc.id).filter(Boolean));

const claims = [];
for (const { file, doc } of claimFiles) {
  for (const claim of doc.claims ?? []) claims.push({ file, claim });
}
const claimIds = new Set(claims.map((c) => c.claim.id).filter(Boolean));

// Facility value fields typed `string | unknown` in SCHEMA.md.
const FACILITY_VALUE_FIELDS = [
  ['operator'],
  ['location', 'address'],
  ['jurisdiction', 'agenda_url'],
  ['utility', 'electric'],
  ['utility', 'water'],
  ['watershed', 'basin'],
  ['watershed', 'wri_water_stress'],
];

for (const { file, doc } of facilities) {
  // Rule: any facility has no last_reviewed date.
  const lr = doc.last_reviewed;
  const lrStr = lr instanceof Date ? lr.toISOString().slice(0, 10) : lr;
  if (isEmpty(lr) || !/^\d{4}-\d{2}-\d{2}$/.test(String(lrStr))) {
    fail(file, `facility "${doc.id}" has no valid last_reviewed date (YYYY-MM-DD)`);
  }

  // Rule: any value field is empty rather than unknown.
  for (const path of FACILITY_VALUE_FIELDS) {
    const v = path.reduce((o, k) => (o == null ? undefined : o[k]), doc);
    if (isEmpty(v)) fail(file, `facility "${doc.id}" field ${path.join('.')} is empty; use "unknown"`);
  }
}

for (const { file, claim } of claims) {
  const id = claim.id ?? '(no id)';

  // Rule: any claim's source does not match a source id.
  if (!sourceIds.has(claim.source)) {
    fail(file, `claim "${id}" source "${claim.source}" does not match any id in data/sources/`);
  }

  // Rule: any claim with evidence_type modeled lacks method.
  if (claim.evidence_type === 'modeled' && isEmpty(claim.method)) {
    fail(file, `claim "${id}" has evidence_type modeled but no method`);
  }

  // Rule: any conflicts_with points to a missing claim.
  for (const other of claim.conflicts_with ?? []) {
    if (!claimIds.has(other)) fail(file, `claim "${id}" conflicts_with missing claim "${other}"`);
  }

  // Rule: any value field is empty rather than unknown.
  if (isEmpty(claim.value)) fail(file, `claim "${id}" value is empty; use "unknown"`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Validation passed: ${facilities.length} facilities, ${claims.length} claims, ${sources.length} sources.`,
);
