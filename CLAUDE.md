# factory-sandbox

A small Express + TypeScript todo API. Agents in the software-factory POC implement and review tickets against it.

## Commands
- `npm ci`: install dependencies
- `npm run typecheck`: TypeScript check, must pass
- `npm test`: Vitest + Supertest suite, must pass
- `npm start`: run the API on port 3000

## Layout
- `src/app.ts`: routes. Keep handlers thin.
- `src/store.ts`: in-memory data access.
- `test/`: one Supertest file per resource.

## Conventions
- Validation errors return 400 with `{ "error": "<message>" }`. Missing resources return 404 with `{ "error": "not found" }`.
- Every behavior change comes with a test in `test/`.
- Don't add dependencies unless the ticket needs one.
- Commit messages start with the ticket key, for example `FAC-2: validate todo titles`.
