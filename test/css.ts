import { readFileSync } from "node:fs";

export interface Rule {
  media: string | null;
  selector: string;
  body: string;
}

/** Flat list of CSS rules, with the enclosing @media condition (one level deep, which is all style.css uses). */
export function parseRules(source: string): Rule[] {
  const rules: Rule[] = [];
  const re = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  for (const [, head, body] of source.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(re)) {
    const prelude = head.trim();
    if (prelude.startsWith("@media")) {
      for (const [, selector, inner] of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        rules.push({ media: prelude, selector: selector.trim(), body: inner });
      }
    } else {
      rules.push({ media: null, selector: prelude, body });
    }
  }
  return rules;
}

export const css = readFileSync(new URL("../web/style.css", import.meta.url), "utf8");
export const rules = parseRules(css);

export const rule = (selector: string, media: string | null = null) =>
  rules.find((r) => r.media === media && r.selector.split(",").map((s) => s.trim()).includes(selector));

export const declaration = (r: Rule | undefined, property: string) =>
  r?.body.match(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+)`))?.[1].trim();

/** Custom properties defined in a :root block, optionally inside a given @media. */
export const rootVars = (media: string | null) =>
  new Set([...(rule(":root", media)?.body.matchAll(/(--[\w-]+)\s*:/g) ?? [])].map((m) => m[1]));

export const DARK = "@media (prefers-color-scheme: dark)";
