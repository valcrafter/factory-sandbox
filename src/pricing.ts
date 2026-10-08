export type Billing = "monthly" | "yearly";

export interface Plan {
  id: string;
  name: string;
  /** Price per user per month on monthly billing, in USD. */
  monthly: number;
  blurb: string;
  features: string[];
  highlighted?: boolean;
}

/** Yearly billing discount, shown on the page as "Save 20%". */
export const YEARLY_DISCOUNT = 0.2;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    blurb: "For trying Tempo with a small group.",
    features: ["Up to 3 people", "Weekly plan", "Friday recap"],
  },
  {
    id: "team",
    name: "Team",
    monthly: 12,
    blurb: "For teams that plan together every week.",
    features: ["Unlimited people", "Focus blocks", "Calendar sync", "Priority support"],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 24,
    blurb: "For companies with many teams.",
    features: ["Everything in Team", "SSO", "Admin controls", "Usage reports"],
  },
];

/** Price per user per month for the chosen billing period. */
export function pricePerMonth(plan: Plan, billing: Billing): number {
  if (billing === "yearly") return plan.monthly * (1 - YEARLY_DISCOUNT / 100);
  return plan.monthly;
}

/** "$12", "$9.60", or "Free". */
export function formatPrice(amount: number): string {
  if (amount === 0) return "Free";
  return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
}
