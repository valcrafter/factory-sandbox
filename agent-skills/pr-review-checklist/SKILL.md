---
name: pr-review-checklist
description: The checklist for reviewing a pull request on this repo before approving it. Use when reviewing a PR or deciding whether to request changes.
---

# PR review checklist

Check each item against the diff and the work item. Request changes only for problems in **Blocking**; mention the rest without blocking.

## Blocking
1. **Does what the work item asks.** Every acceptance criterion is met, and nothing it didn't ask for was changed.
2. **Tests.** New logic and new sections have tests, a bug fix has a regression test, and `npm test` passes.
3. **Builds.** `npm run typecheck` and `npm run build` pass.
4. **Links and ids.** Every `href="#…"` resolves, ids are unique, and there is still one `h1`.
5. **Themes.** Colours come from CSS variables, and anything new has dark-mode values.
6. **Accessibility.** Real buttons and links, `alt` or `aria-hidden` on images and icons, keyboard focus still visible.
7. **No new dependencies** unless the work item needs one.

## Non-blocking
- Naming, small duplication, copy wording.
- Styling that could reuse an existing class.
- Commit messages that don't start with the work item key.

## How to report
Name the file and line for each blocking problem, and say what the fix should achieve, not just what is wrong.
