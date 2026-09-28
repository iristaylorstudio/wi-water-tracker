# Wisconsin AI Infrastructure & Water Tracker

A public site that tracks data centers in Wisconsin with a focus on water. Every figure carries a source, an evidence type and a date. `unknown` is shown as a finding.

- Scope and plan: [docs/PLAN.md](docs/PLAN.md)
- Data model and validation rules: [docs/SCHEMA.md](docs/SCHEMA.md)
- Rules for working in this repo: [CLAUDE.md](CLAUDE.md)

Built with [Astro](https://astro.build) as a static site. Data lives as YAML in `data/` and is read at build time. There is no database.

## Setup

You need Node.js 22.12 or newer.

```bash
npm install
```

To show the submission form, create a file named `.env` in the repo root with your Tally form link:

```
PUBLIC_TALLY_FORM_URL=https://tally.so/r/yourFormId
```

The Tally form needs a hidden field named `facility`. Facility pages fill it with the facility id. Without `.env` the site still works and shows "The submission form is not configured yet." `.env` is never committed.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts a local site at http://localhost:4321/wi-water-tracker/ that reloads as you edit. Stop it with `npx astro dev stop`. |
| `npm run validate` | Checks every file in `data/` against the rules in the Validation section of SCHEMA.md. Lists each problem and exits with an error if any are found. |
| `npm run build` | Runs `npm run validate`, then builds the site into `dist/`. The build stops if validation fails. |
| `npm run preview` | Serves the built `dist/` folder locally, to check a build before it deploys. |

## Data

```
data/
  facilities/   one file per facility
  claims/       one file per facility, many claims each
  events/       one file per facility, many events each
  sources/      one file per source
  templates/    facility.template.yaml, copy this to start a facility
```

Every claim and event must cite a source id that exists in `data/sources/`. Run `npm run validate` after any data change.

The four `example-city-*` facilities and their sources are fake. They exist so every state of the site can be seen. Their notes say `EXAMPLE – delete before publish`. Search for that text to find every file to remove.

## How the deploy works

Every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on GitHub Actions:

1. **Build.** The official Astro action installs packages and runs `npm run build`. That validates the data first. If validation fails, the build fails and the live site does not change.
2. **Deploy.** The built site is published to GitHub Pages at https://iristaylorstudio.github.io/wi-water-tracker/.

The form link comes from a repository variable named `PUBLIC_TALLY_FORM_URL`, not from `.env`. Set it under **Settings → Secrets and variables → Actions → Variables**. It is read at build time, so after changing it, run the workflow again from the **Actions** tab or push a new commit.

To see a deploy's progress or why it failed, open the **Actions** tab on GitHub.

`site` and `base` in `astro.config.mjs` match the GitHub Pages address. If the repo is renamed or the site moves to a custom domain, update both.
