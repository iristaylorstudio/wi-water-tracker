# Wisconsin AI Infrastructure & Water Tracker – Plan

Working name. Rename when you have one you like.

## What this is

A public web app that tracks proposed and operating data centers in Wisconsin with a focus on water. Every figure carries its source, its evidence type and its date. "Unknown" is shown as a finding, not hidden.

It is the first buildable piece of a larger idea: an AI resource intelligence layer that understands, measures, optimizes and predicts the physical resources AI needs, water and energy first. This project starts at the facility layer because that is where the problem is physical and where public records exist.

## How it maps to the long-term vision

| Vision stage | What this project does about it |
|---|---|
| 1. Resource Advisor (task → estimate → compare) | Later. Becomes a page on this site once the tracker has users. |
| 2. Resource tracking | Calculator input logging (anonymous) and tracker submissions. See "Data collection" below. |
| 3. Workload optimization | Not in V1. |
| 4. Infrastructure intelligence | This is V1. Facilities, power, cooling, water source, permits, dockets. |
| 5. Water intelligence | This is V1's focus. Per-facility water claims, cooling type, water source, basin water stress. |
| 6. Prediction | Not in V1. The facility dataset is the input it will need. |
| 7. Resource network | Not in V1. Other states come after Wisconsin works. |

## V1 scope

In:

- Wisconsin only
- 5–15 facilities, seeded from Build Wisconsin Better (17 projects) and cross-checked against dcmap.us (65 sites) and news guides
- Map plus one page per facility
- Claims graded by evidence type (see SCHEMA.md)
- Event timeline per facility (filings, hearings, votes, announcements)
- Three to five explainer pages
- A submission form for tips, documents and corrections
- A sources page and a methodology page

Out:

- The Advisor calculator
- User accounts
- Other states
- Automated data changes without review
- Any number the site computed itself without a stated method

## Sprint 1 (first 2–3 weekends)

1. **Schema.** Read SCHEMA.md. Adjust field names if something feels wrong. Then freeze it.
2. **Seed.** Build `data/facilities/*.yaml` from the Build Wisconsin Better list. Cross-check MW and status against dcmap.us. Every water, cooling and permit field starts as `unknown`.
3. **Scaffold.** Run KICKOFF_PROMPT.md in Claude Code. Get the map, one facility page and the submission form working with seed data.
4. **Deep-dive three facilities.** Candidates to verify against the seed list: Mount Pleasant (Microsoft), Port Washington (Vantage) and one more with an active PSC docket. Work the PSC docket, DNR permits and county records. Record what water data actually exists. This tells you whether the water layer is fillable or mostly unknown.
5. **Publish.** GitHub Pages (free, deploys on push). Send the link to one reporter covering this beat and one local group. Ask one question: what's missing?

## Data collection (both mechanisms)

### A. Tracker submissions (build in V1)

A form on every facility page and on the home page.

Fields:

- Facility (select from list, or "new facility")
- Type: document, meeting notice, news article, correction, tip
- URL or file upload
- Date of the thing being submitted
- Notes (free text, short)
- Email, optional, with a checkbox: "You can contact me about this submission"

Handling:

- Submissions land in Tally to start (free, no code). Review them there. Move to a Supabase table when the update agent needs to read the queue.
- Nothing goes live without review
- A reviewed submission becomes a claim, an event or a source record with the submitter's evidence attached
- Post a short privacy page: what is collected, that emails are never published, how to ask for deletion

### B. Calculator input logging (build when the Advisor page exists)

Anonymous events only. No IP, no email, no free text.

Event shape:

```
ts, task_type, model_class, volume_bucket, approach_viewed, approach_chosen
```

Handling:

- A free analytics tool with custom events, or a Supabase table. Decide when the Advisor page exists.
- Aggregate to at least 20 events before showing anything publicly
- What it tells you: which tasks people care about, which models and volumes, which approach they pick. That is demand data. It does not measure energy or water.
- What it does not tell you: anything about actual resource use. Studies need real API usage logs from companies that opt in. That is a later product.

## Staying up to date: the update agent

Yes, you can build one. Build it in three levels and stop at whichever one you can maintain.

### Level 1 – Checklist (start here)

A weekly 30-minute pass through a fixed source list. Log what you checked and the date in `data/sources/` even if nothing changed.

Source list:

- PSC of Wisconsin ERF docket search, one docket number per facility where one exists
- WI DNR public notices for high-capacity wells and water withdrawals
- County and municipal agendas for the facility's jurisdiction (Legistar where available)
- Wisconsin Watch, WPR, Urban Milwaukee, Wausau Pilot data center coverage
- Build Wisconsin Better map and moratorium list
- dcmap.us Wisconsin page
- Utility filings from the serving utility (We Energies, Alliant, MGE, others)
- Google Alerts for each facility name and developer name

### Level 2 – Scheduled research agent (after Level 1 runs a few weeks)

A scheduled task in Claude (weekly) that walks the source list and produces a "candidate updates" report. Each candidate carries the source URL, the evidence type it would get, the facility it belongs to and a one-line reason. You review and enter the ones you accept.

Rules for the agent:

- It proposes. It never edits data files.
- Every proposal has a URL and a date.
- It flags conflicts with existing claims explicitly.
- It reports "no change" sources too, so you know it looked.

### Level 3 – Pull-request agent (only if Level 2 proves useful)

A GitHub Action on a schedule that runs the same research and opens a pull request with proposed YAML changes. You merge or reject. Same rules as Level 2. The PR is the review step.

## Learning track

Docs I write myself, one at a time. I will need a brief from claude to understand what I should be writing and why. Then I do the Draft rough, send for review, then the next one.

1. Research note for the first real facility. What I found, where, what date, what is unclear.
2. Explainer page: "What a data you center actually uses." Every number carries a source.
3. Update-agent prompt. What to do, what never to do, what done looks like.

How I review Claude Code reports:
- "What I built" is a receipt. Skim it.
- "Things I wasn't sure about" is where the decisions are.
- Three questions: Does it match SCHEMA.md? Does it change what a resident sees? Is it easy to undo?

## Go/no-go signals

After Sprint 1 and one month live:

- Go: someone (reporter, official, resident) used it for a real decision or story and told you
- Go: submissions arrive that you did not solicit
- Rethink: the water layer is almost entirely unknown after working three dockets. Then the honest product is the explainers plus a "what is not disclosed" page, and the tracker is the evidence for it
- Stop: a month of no traffic and no submissions after direct outreach

## Repo habits

Iris is working on One computer since this is a personal project. Everything lives in the GitHub repo. Push origin in GitHub Desktop at the end of every session. Data files are the source of truth.

Source documents (downloaded filings, PDFs, screenshots, spreadsheets) do not go in the repo. Keep them in a synced cloud folder (Google Drive or OneDrive) named the same as the repo plus `-files`, one subfolder per facility id. Link to the public URL from the source record. If the public URL might disappear, save a Wayback snapshot and store the archive URL in `archived_url`.
