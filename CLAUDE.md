# CLAUDE.md – Wisconsin AI Infrastructure & Water Tracker

Instructions for Claude Code working in this repo. Read fully before any change.

## What this project is

A public site that tracks data centers in Wisconsin with a focus on water. Every figure on the site carries a source, an evidence type and a date. `unknown` is a valid, displayed value. The site is descriptive. It does not argue for or against any project.

Read `docs/PLAN.md` for scope and `docs/SCHEMA.md` for the data model. The schema is the contract. Do not change field names without updating SCHEMA.md and the validator in the same commit.

## Stack

- Astro (static output), TypeScript
- Data: YAML in `data/`, loaded at build time. No database in V1.
- Map: MapLibre GL with OpenStreetMap tiles. One pin per facility. Pin color = water confidence (High, Medium, Low, None).
- Forms: the submission form is a Tally form embedded on the site. The Tally form URL lives in `PUBLIC_TALLY_FORM_URL` in `.env`. Submissions are reviewed in Tally. Move to Supabase only when the update agent needs to read the queue.
- Hosting: GitHub Pages, deployed by the official Astro GitHub Action on push to `main`. Static build. Free.
- Validation: `npm run validate` runs `scripts/validate.js` and must pass before `npm run build`.

## Folder layout

```
data/
  facilities/   facility.yaml files
  claims/       one file per facility
  events/       one file per facility
  sources/      one file per source
  templates/    facility.template.yaml
docs/
  PLAN.md
  SCHEMA.md
  research/     maintainer notes per facility before they become data (not published)
scripts/
  validate.js
src/
  pages/        index (map), facilities/[id], explainers/*, sources, methodology, submit, privacy
  components/   Map, ClaimTable, EventTimeline, ConfidenceBadge, SubmitForm
  lib/          loadData.ts, confidence.ts, units.ts
```

## Data rules (non-negotiable)

1. Never add or change a number in `data/` without a `source` id that exists in `data/sources/`.
2. Never invent a value. If a field has no source, it is `unknown`.
3. Never compute a figure for display unless it is stored as a claim with `evidence_type: modeled` and a `method` string.
4. Water withdrawal and water consumption are separate claim types. Never combine them.
5. Two sources that disagree are two claims linked by `conflicts_with`. Do not pick a winner in the data.
6. Confidence is computed in `src/lib/confidence.ts` from evidence type, age and conflicts. It is never hand-typed.
7. When asked to research a facility, produce candidate claims and events with URLs and evidence types for the maintainer to review. Do not write them into `data/` unless the maintainer explicitly says to.

## Display rules

- Every number on a page shows its evidence type badge and its `as_of` date inline.
- Every facility page has a "What is not disclosed" section listing every `unknown` water and cooling claim.
- Every facility page has a sources list at the bottom with title, publisher, date and link.
- Ranges display as `low–high` with an en dash. Never a single point for a modeled value.
- Units: MW for power. Gallons per day for water, with liters per day in a tooltip.
- No adjectives about projects. "Proposed 300 MW campus," not "massive."

## Writing style for site copy

- Short sentences. Plain words. Explain the term the first time it appears.
- No Oxford comma.
- En dashes for ranges (2026–2027, 300–500 MW).
- Em dashes only when nothing else works.
- Write for a resident who heard about a project at a county meeting last night.

## Commits

- One logical change per commit.
- Data commits: `data(<facility-id>): add PSC docket 1234 water withdrawal claim`
- Site commits: `site: add confidence badge to claim table`
- Never commit `.env`.

## Two-machine workflow

The maintainer works from two computers. Always `git pull` before editing. Never leave uncommitted data changes at the end of a session.
