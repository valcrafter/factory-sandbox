import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

describe("landing page", () => {
  it("has the main sections", () => {
    for (const id of ["features", "testimonials", "pricing", "signup"]) expect(ids.has(id), `#${id}`).toBe(true);
  });

  it("only links to sections that exist", () => {
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) expect(ids.has(anchor), `#${anchor}`).toBe(true);
  });

  it("has unique ids", () => {
    const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(all.length).toBe(ids.size);
  });

  it("has a single h1", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });
});

const css = readFileSync(new URL("../web/style.css", import.meta.url), "utf8");

describe("accessibility", () => {
  it("has a skip link as the first element in body targeting main", () => {
    const body = html.slice(html.indexOf("<body>") + 6).trim();
    expect(body).toMatch(/^<a class="skip-link" href="#top">Skip to content<\/a>/);
    expect(html).toMatch(/<main id="top"[^>]*tabindex="-1"/);
  });

  it("has an accent focus ring for links and buttons", () => {
    expect(css).toMatch(/a:focus-visible,\s*button:focus-visible\s*\{[^}]*var\(--accent\)/);
    expect(css).toMatch(/\.skip-link:focus\s*\{/);
  });

  it("only uses smooth scrolling when motion is not reduced", () => {
    const stripped = css.replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\}/g, "");
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(stripped).not.toContain("scroll-behavior: smooth");
  });
});
