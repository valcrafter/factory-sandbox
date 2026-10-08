# factory-sandbox

A small TypeScript todo app: a web UI deployed to GitHub Pages, plus an Express API. Agents in the software-factory POC implement and review tickets against it.

## Commands
- `npm ci`: install dependencies
- `npm run typecheck`: TypeScript check, must pass
- `npm test`: Vitest + Supertest suite, must pass
- `npm run build`: builds the web UI into `dist/`, must pass
- `npm run dev`: web UI with hot reload
- `npm start`: run the API on port 3000

## Layout
- `src/store.ts`: todo data and operations. Shared by the API and the web UI.
- `src/validation.ts`: input validation. Shared by the API and the web UI.
- `src/app.ts`: API routes. Keep handlers thin.
- `web/`: the web UI (`index.html`, `main.ts`, `style.css`). It uses `src/` directly and keeps todos in localStorage.
- `test/`: tests for `src/` and the API.

## Conventions
- Put logic in `src/` with tests; keep `web/main.ts` to rendering and event wiring.
- Validation errors return 400 with `{ "error": "<message>" }`. Missing resources return 404 with `{ "error": "not found" }`. The web UI shows the same messages.
- Every behavior change comes with a test in `test/`.
- Don't add dependencies unless the ticket needs one.
- Commit messages start with the ticket key, for example `FAC-2: validate todo titles`.

## Deployment
Every push to `main` deploys the web UI to GitHub Pages (`.github/workflows/pages.yml`). The page footer shows the deployed commit.
