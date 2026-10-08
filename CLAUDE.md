# factory-sandbox

**Tempo**: an example product landing page (a fictional product) deployed to GitHub Pages. Agents in the software-factory POC change it through pull requests.

## Commands
- `npm ci`: install dependencies
- `npm run typecheck`: TypeScript check, must pass
- `npm test`: Vitest suite, must pass
- `npm run build`: builds the page into `dist/`, must pass
- `npm run dev`: local preview with hot reload

## Layout
- `web/index.html`: page content and sections. Every section has an `id`; nav links point at those ids.
- `web/style.css`: all styling. Colors and radii are CSS variables in `:root`, with dark-mode values under `prefers-color-scheme: dark`.
- `web/main.ts`: rendering and event wiring only (pricing cards, billing toggle, build footer).
- `src/`: logic used by the page (`pricing.ts`). Logic goes here, with tests.
- `test/`: `pricing.test.ts` for logic, `page.test.ts` for page structure (sections exist, anchor links resolve, one h1).

## Conventions
- Use the CSS variables for colors; every change must look right in light and dark mode.
- Keep the page accessible: real buttons and links, alt text or `aria-hidden` on decorative icons, one `h1`.
- New logic gets tests in `test/`. New sections get an `id` and, if linked, a nav link.
- Don't add dependencies unless the ticket needs one.
- Commit messages start with the ticket key, for example `FAC-1: add testimonials section`.

## Deployment
Every push to `main` deploys to GitHub Pages (`.github/workflows/pages.yml`). The footer shows the deployed commit.
