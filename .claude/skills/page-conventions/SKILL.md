---
name: page-conventions
description: How to add or change sections, styles and copy on the Tempo landing page (web/index.html, web/style.css, web/main.ts). Use for any change that is visible on the page.
---

# Page conventions

## Sections
- Every section is a `<section id="…" class="section">` inside `<main>`, with one `h2`. The page has exactly one `h1` (the hero).
- A new section that people should reach gets a nav link in the header: `<a href="#your-id">Label</a>`. Every `href="#…"` must point at an existing id; `test/page.test.ts` fails otherwise.
- Keep ids short, lowercase and unique (`faq`, `testimonials`, `compare`).

## Styling
- All styling lives in `web/style.css`. Reuse existing classes (`card`, `cards`, `button`, `button ghost`, `section`) before adding new ones.
- Colours, radii and shadows come from the CSS variables in `:root`. Never hard-code a colour: the dark-mode values under `@media (prefers-color-scheme: dark)` only work through the variables.
- New colours need a value in both `:root` and the dark-mode block. Check both themes before you finish.
- Layouts must work from 360px wide upwards: grids collapse to one column on small screens, nothing scrolls horizontally.

## Behaviour
- `web/main.ts` only renders and wires events. Anything with logic (prices, parsing, formatting) goes in `src/` with unit tests.
- Use real `<button>` and `<a>` elements, never clickable `div`s. Decorative icons get `aria-hidden="true"`; meaningful images get `alt` text.
- Respect `prefers-reduced-motion` for animation and smooth scrolling.

## Before you finish
Run `npm run typecheck`, `npm test` and `npm run build`. All three must pass.
