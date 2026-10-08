import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DARK, declaration, rootVars, rule, rules } from "./css";

const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const sectionOrder = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);

describe("landing page", () => {
  it("has the main sections", () => {
    for (const id of ["features", "testimonials", "pricing", "faq", "signup"]) expect(ids.has(id), `#${id}`).toBe(true);
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

const faq = html.match(/<section id="faq"[\s\S]*?<\/section>/)?.[0] ?? "";
const items = [...faq.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)].map(([, attrs, body]) => ({ attrs, body }));
const question = (body: string) => body.match(/<summary>([^<]*)<\/summary>/)?.[1].trim() ?? "";
const answer = (body: string) => body.match(/<\/summary>\s*<p>([^<]*)<\/p>/)?.[1].trim() ?? "";

describe("FAQ section", () => {
  it("exists with an id and is labelled by its heading", () => {
    expect(faq).not.toBe("");
    const labelledBy = faq.match(/^<section[^>]*aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeDefined();
    expect(faq).toMatch(new RegExp(`<h2 id="${labelledBy}">[^<]+</h2>`));
  });

  it("sits directly before the sign-up section", () => {
    expect(sectionOrder.indexOf("signup") - sectionOrder.indexOf("faq")).toBe(1);
  });

  it("has exactly four questions: free trial, cancelling, team size, data export", () => {
    expect(items).toHaveLength(4);
    const questions = items.map((i) => question(i.body));
    expect(questions[0]).toMatch(/free trial/i);
    expect(questions[1]).toMatch(/cancel/i);
    expect(questions[2]).toMatch(/team size/i);
    expect(questions[3]).toMatch(/export/i);
    expect(new Set(questions).size).toBe(4);
  });

  it("uses native <details>/<summary>, with the summary first so it is the keyboard-focusable toggle", () => {
    for (const { body } of items) {
      expect(body.trimStart(), "summary must be the first child").toMatch(/^<summary>/);
      expect(body.match(/<summary\b/g), "exactly one summary").toHaveLength(1);
      expect(question(body), "question text").not.toBe("");
      expect(answer(body), "answer text").not.toBe("");
    }
  });

  it("starts with every answer collapsed", () => {
    for (const { attrs } of items) expect(attrs).not.toMatch(/\bopen\b/);
  });

  it("doesn't override the native toggle or keyboard behaviour", () => {
    // No tabindex, roles or inline handlers: <summary> is already focusable and toggles on Enter/Space.
    expect(faq).not.toMatch(/\stabindex=|\srole=|\son\w+=/i);
    // Interactive content inside <summary> would steal clicks and focus from the toggle.
    for (const { body } of items) expect(body.match(/<summary>[\s\S]*?<\/summary>/)![0]).not.toMatch(/<(a|button|input)\b/);
  });

  it("keeps answers consistent with the rest of the page", () => {
    const trial = answer(items[0].body);
    const signup = html.match(/<section id="signup"[\s\S]*?<\/section>/)![0];
    const days = signup.match(/Free for (\d+) days/)![1];
    expect(trial).toContain(`${days}-day`);
    expect(trial).toMatch(/no credit card/i);
  });
});

describe("FAQ navigation", () => {
  const nav = html.match(/<nav aria-label="Main">([\s\S]*?)<\/nav>/)?.[1] ?? "";

  it("has an 'FAQ' link in the top navigation pointing at the section", () => {
    expect(nav).toMatch(/<a href="#faq">FAQ<\/a>/);
  });

  it("lists FAQ in page order, after Pricing", () => {
    const linked = [...nav.matchAll(/<a href="#([^"]+)">/g)].map((m) => m[1]);
    expect(linked).toContain("faq");
    const inPageOrder = [...linked].sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));
    expect(linked).toEqual(inPageOrder);
  });

  it("scrolls the section clear of the sticky header", () => {
    expect(faq).toMatch(/^<section[^>]*class="section"/);
    expect(declaration(rule(".section"), "scroll-margin-top")).toMatch(/^\d+px$/);
  });
});

describe("FAQ styling in light and dark mode", () => {
  const faqRules = rules.filter((r) => r.selector.includes(".faq"));

  it("hides the native marker and shows its own open/closed indicator", () => {
    expect(declaration(rule(".faq-item summary"), "list-style")).toBe("none");
    expect(declaration(rule(".faq-item summary::-webkit-details-marker"), "display")).toBe("none");
    const closed = declaration(rule(".faq-item summary::after"), "content");
    const open = declaration(rule(".faq-item[open] summary::after"), "content");
    expect(closed).toBeDefined();
    expect(open).toBeDefined();
    expect(open).not.toBe(closed);
  });

  it("hides the indicator glyph from screen readers", () => {
    for (const selector of [".faq-item summary::after", ".faq-item[open] summary::after"]) {
      expect(rule(selector)!.body, selector).toMatch(/content:\s*"[^"]*"\s*\/\s*""/);
    }
  });

  it("shows a visible keyboard focus ring on the question", () => {
    expect(declaration(rule(".faq-item summary:focus-visible"), "outline")).toMatch(/var\(--accent\)/);
  });

  it("uses only CSS variables for colors", () => {
    expect(faqRules.length).toBeGreaterThan(0);
    for (const r of faqRules) {
      expect(r.body, r.selector).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black)\b/i);
      for (const property of ["color", "background", "background-color", "border-color"]) {
        const value = declaration(r, property);
        if (value) expect(value, `${r.selector} ${property}`).toMatch(/^var\(--[\w-]+\)$/);
      }
    }
  });

  it("only uses variables that have both light and dark values", () => {
    const light = rootVars(null);
    const dark = rootVars(DARK);
    const used = new Set(faqRules.flatMap((r) => [...r.body.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1])));
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) {
      expect(light.has(name), `${name} in light :root`).toBe(true);
      if (name !== "--radius") expect(dark.has(name), `${name} in dark :root`).toBe(true);
    }
  });

  it("keeps question, answer and indicator readable on the card in both modes", () => {
    const hex = (media: string | null, name: string) => {
      const value = declaration(rule(":root", media), name);
      expect(value, `${name} (${media ?? "light"})`).toMatch(/^#[0-9a-f]{6}$/i);
      return value!;
    };
    const luminance = (color: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(color.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const background = declaration(rule(".faq-item"), "background")!.match(/var\((--[\w-]+)\)/)![1];
    const foregrounds = [".faq-item summary", ".faq-item p", ".faq-item summary::after", ".faq-item summary:hover"].map(
      (selector) => declaration(rule(selector), "color")!.match(/var\((--[\w-]+)\)/)![1],
    );
    for (const media of [null, DARK]) {
      // WCAG AA for normal text.
      for (const fg of foregrounds) expect(contrast(hex(media, fg), hex(media, background)), `${fg} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
