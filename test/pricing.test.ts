import { describe, expect, it } from "vitest";
import { formatPrice, PLANS, pricePerMonth } from "../src/pricing";

const plan = (id: string) => PLANS.find((p) => p.id === id)!;

describe("pricing", () => {
  it("charges the list price on monthly billing", () => {
    expect(pricePerMonth(plan("team"), "monthly")).toBe(12);
    expect(pricePerMonth(plan("business"), "monthly")).toBe(24);
  });

  it("keeps the starter plan free on yearly billing", () => {
    expect(pricePerMonth(plan("starter"), "yearly")).toBe(0);
  });

  it("formats prices", () => {
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(12)).toBe("$12");
    expect(formatPrice(9.6)).toBe("$9.60");
  });

  it("highlights exactly one plan", () => {
    expect(PLANS.filter((p) => p.highlighted)).toHaveLength(1);
  });
});
