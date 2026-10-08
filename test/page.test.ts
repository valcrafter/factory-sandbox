import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

describe("landing page", () => {
  it("has the main sections", () => {
    for (const id of ["features", "pricing", "signup"]) expect(ids.has(id), `#${id}`).toBe(true);
  });

  it("only links to sections that exist", () => {
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) expect(ids.has(anchor), `#${anchor}`).toBe(true);
  });

  it("has a single h1", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });
});
