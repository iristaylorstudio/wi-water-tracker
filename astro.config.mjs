// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves this repo as a project site at https://<owner>.github.io/<repo>/.
// If the repo is renamed, or moves to a custom domain, update `site` and `base`.
export default defineConfig({
  output: 'static',
  site: 'https://iristaylorstudio.github.io',
  base: '/wi-water-tracker',
});
