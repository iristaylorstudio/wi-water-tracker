# Claude Code kickoff prompt

Before running this: create an empty GitHub repo, clone it, copy `CLAUDE.md`, `docs/PLAN.md`, `docs/SCHEMA.md` and `data/templates/facility.template.yaml` into it and commit. Then open Claude Code in the repo and paste the prompt below.

---

Read CLAUDE.md, docs/PLAN.md and docs/SCHEMA.md before doing anything.

Set up this project as an Astro static site with TypeScript. Then do the following, in order, committing after each step:

1. Create the folder layout in CLAUDE.md. Add `scripts/validate.js` that enforces every rule in the Validation section of SCHEMA.md. Wire `npm run validate` so `npm run build` fails if validation fails.

2. Add `src/lib/loadData.ts` that reads all YAML in `data/` into typed objects. Add `src/lib/confidence.ts` that computes claim confidence and facility water confidence exactly as SCHEMA.md defines. Add `src/lib/units.ts` for gpd to liters per day.

3. Create three example facilities in `data/` using the template. Use clearly fake names (Example City A, B, C) and fake sources. Make one facility have a High-confidence water claim, one have a conflict between two claims and one have every water field `unknown`. These exist so every UI state can be seen. Mark them `notes: "EXAMPLE – delete before publish"`.

4. Build the home page: a MapLibre map of Wisconsin with one pin per facility. Pin color by water confidence. Clicking a pin shows name, developer, status and a link to the facility page. Below the map, a table of all facilities sortable by status and county.

5. Build `facilities/[id]`: header with name, developer, status, county. A ClaimTable grouped by claim type with value, unit, qualifier, evidence badge, as_of and source link. Conflicting claims render side by side with a "sources disagree" label. A "What is not disclosed" section listing every unknown water and cooling claim. An EventTimeline. A sources list. The SubmitForm at the bottom, prefilled with this facility.

6. Build `submit`, `sources`, `methodology` and `privacy` pages. The methodology page must explain the evidence types and how confidence is computed in plain language, copied from SCHEMA.md. The privacy page must state exactly what the submission form collects and that emails are never published.

7. Build the SubmitForm component. It embeds the Tally form from `PUBLIC_TALLY_FORM_URL` in `.env` and passes the current facility id as a hidden field using Tally's URL parameter. If the variable is missing, render a placeholder that says the form is not configured yet. Do not build a custom form backend.

8. Add a GitHub Actions workflow that builds and deploys to GitHub Pages on every push to `main`, using the official Astro action. Set `site` and `base` in `astro.config.mjs` correctly for GitHub Pages. Add a README with setup, `npm run dev`, `npm run validate`, `npm run build` and how the deploy works.

Stop after each step and tell me what you built and anything you were unsure about. Do not add features that are not listed. Do not add any real facility data. Do not add explainer pages yet.
