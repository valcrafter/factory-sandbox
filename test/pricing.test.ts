import { describe, expect, it } from "vitest";
import { formatPrice, PLANS, pricePerMonth, YEARLY_DISCOUNT } from "../src/pricing";

const plan = (id: string) => PLANS.find((p) => p.id === id)!;

describe("pricing", () => {
  it("charges the list price on monthly billing", () => {
    expect(pricePerMonth(plan("team"), "monthly")).toBe(12);
    expect(pricePerMonth(plan("business"), "monthly")).toBe(24);
  });

  it("keeps the starter plan free on yearly billing", () => {
    expect(pricePerMonth(plan("starter"), "yearly")).toBe(0);
    expect(formatPrice(pricePerMonth(plan("starter"), "yearly"))).toBe("Free");
  });

  // FAC-1: yearly billing must apply the advertised 20% discount.
  it.each([
    ["starter", 0, "Free"],
    ["team", 9.6, "$9.60"],
    ["business", 19.2, "$19.20"],
  ])("charges %s %d per user per month on yearly billing", (id, price, label) => {
    expect(pricePerMonth(plan(id), "yearly")).toBe(price);
    expect(formatPrice(pricePerMonth(plan(id), "yearly"))).toBe(label);
  });

  it("makes yearly prices exactly 20% below monthly for every paid plan", () => {
    expect(YEARLY_DISCOUNT).toBe(0.2);
    const paid = PLANS.filter((p) => p.monthly > 0);
    expect(paid.length).toBeGreaterThan(0);
    for (const p of paid) {
      expect(pricePerMonth(p, "yearly"), p.id).toBe((p.monthly * 80) / 100);
    }
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
