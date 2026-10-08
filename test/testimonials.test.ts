import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { declaration, rootVars, rule, rules } from "./css";

const html = readFileSync(new URL("../web/index.html", import.meta.url), "utf8");

const section = html.match(/<section id="testimonials"[\s\S]*?<\/section>/)?.[0] ?? "";
const cards = section.split(/(?=<figure\b)/).slice(1);

const text = (fragment: string, className: string) =>
  fragment.match(new RegExp(`class="${className}"[^>]*>([^<]*)<`))?.[1].trim() ?? "";

const testimonialSelectors = [".testimonials", ".testimonial", ".avatar", ".person"];
const testimonialRules = rules.filter((r) => testimonialSelectors.some((s) => r.selector.includes(s)));

describe("testimonials section", () => {
  it("exists with an id and the 'Loved by calm teams' heading", () => {
    expect(section).not.toBe("");
    expect(section).toMatch(/<h2[^>]*>Loved by calm teams<\/h2>/);
  });

  it("is labelled by its heading", () => {
    const labelledBy = section.match(/^<section[^>]*aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeDefined();
    expect(section).toMatch(new RegExp(`<h2 id="${labelledBy}"`));
  });

  it("sits between Features and Pricing", () => {
    const order = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
    const at = order.indexOf("testimonials");
    expect(order[at - 1]).toBe("features");
    expect(order[at + 1]).toBe("pricing");
  });

  it("has exactly three quote cards that use the shared card style", () => {
    expect(section).toMatch(/class="cards testimonials"/);
    expect(cards).toHaveLength(3);
    for (const card of cards) expect(card).toMatch(/^<figure class="card testimonial">/);
  });

  it("gives every card a quote, name, role and company", () => {
    for (const card of cards) {
      const quote = card.match(/<blockquote>\s*<p>([^<]+)<\/p>\s*<\/blockquote>/)?.[1].trim() ?? "";
      expect(quote.length, "quote").toBeGreaterThan(0);
      expect(quote.length, "quote should be short").toBeLessThanOrEqual(140);
      for (const field of ["name", "role", "company"]) expect(text(card, field), field).not.toBe("");
      expect(card, "attribution belongs in the figcaption").toMatch(/<figcaption>[\s\S]*class="name"[\s\S]*<\/figcaption>/);
    }
  });

  it("quotes three different people from three different companies", () => {
    expect(new Set(cards.map((c) => text(c, "name"))).size).toBe(3);
    expect(new Set(cards.map((c) => text(c, "company"))).size).toBe(3);
  });

  it("shows an avatar with the person's initials, hidden from screen readers", () => {
    for (const card of cards) {
      const name = text(card, "name");
      const initials = name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
      expect(card).toMatch(/<span class="avatar" aria-hidden="true">/);
      expect(text(card, "avatar"), name).toBe(initials);
    }
  });
});

describe("testimonials styling", () => {
  it("puts three cards side by side on desktop", () => {
    expect(declaration(rule(".testimonials"), "grid-template-columns")).toMatch(/^repeat\(3,/);
  });

  it("stacks the cards in a single column on mobile", () => {
    const mobile = rules.find((r) => r.selector === ".testimonials" && /max-width:\s*\d+px/.test(r.media ?? ""));
    expect(mobile, "mobile media query for .testimonials").toBeDefined();
    expect(declaration(mobile, "grid-template-columns")).toBe("1fr");
    const breakpoint = Number(mobile!.media!.match(/max-width:\s*(\d+)px/)![1]);
    // Below ~720px three columns get too narrow to read; above the 1040px content width it's desktop.
    expect(breakpoint).toBeGreaterThanOrEqual(720);
    expect(breakpoint).toBeLessThan(1040);
  });

  it("draws the avatar as a circle", () => {
    const avatar = rule(".avatar");
    expect(declaration(avatar, "border-radius")).toBe("50%");
    expect(declaration(avatar, "width")).toBe(declaration(avatar, "height"));
  });

  it("uses only CSS variables for colors", () => {
    expect(testimonialRules.length).toBeGreaterThan(0);
    for (const r of testimonialRules) {
      expect(r.body, r.selector).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black)\b/i);
      for (const property of ["color", "background", "background-color", "border-color"]) {
        const value = declaration(r, property);
        if (value) expect(value, `${r.selector} ${property}`).toMatch(/^var\(--[\w-]+\)$/);
      }
    }
  });

  it("only uses variables that have both light and dark values", () => {
    const light = rootVars(null);
    const dark = rootVars("@media (prefers-color-scheme: dark)");
    const used = new Set(testimonialRules.flatMap((r) => [...r.body.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1])));
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) {
      expect(light.has(name), `${name} in light :root`).toBe(true);
      // --radius and similar non-color tokens don't need a dark override.
      if (name !== "--radius") expect(dark.has(name), `${name} in dark :root`).toBe(true);
    }
  });
});
