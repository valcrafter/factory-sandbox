---
name: writing-tests
description: How to write Vitest tests in this repo, both logic tests for src/ and page-structure tests for web/index.html. Use when adding logic, adding a section, or fixing a bug.
---

# Writing tests

Tests live in `test/` and run with `npm test` (Vitest). There is no browser or DOM library: page tests read `web/index.html` as text.

## Logic in `src/`
- One test file per module: `src/pricing.ts` → `test/pricing.test.ts`.
- Test behaviour through the exported functions, with concrete inputs and expected outputs. Cover every plan, option or branch the change touches, not just one example.
- For money, compare exact values (`toBe(9.6)`), never approximate.

## Page structure
- Extend `test/page.test.ts`, or add `test/<section>.test.ts` for a new section.
- Read the HTML once at the top: `readFileSync(new URL("../web/index.html", import.meta.url), "utf8")`.
- Assert what matters to the work item: the section id exists, the nav link resolves, the expected number of items (cards, questions) is present.
- Prefer small regular expressions over string positions, so unrelated edits don't break the test.

## Bug fixes
Write the failing test first, reproducing the bug from the work item, then fix the code. A bug fix without a regression test is not done.

## Done means
`npm test` passes, and the new tests fail if you revert the change.
