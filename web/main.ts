import { formatPrice, PLANS, pricePerMonth, type Billing } from "../src/pricing";

declare const __BUILD__: { sha: string; time: string; repo: string };

const plansEl = document.querySelector<HTMLDivElement>("#plans")!;
const toggles = [...document.querySelectorAll<HTMLButtonElement>("[data-billing]")];

function renderPlans(billing: Billing) {
  plansEl.replaceChildren(
    ...PLANS.map((plan) => {
      const card = document.createElement("article");
      card.className = plan.highlighted ? "card plan highlighted" : "card plan";

      const name = document.createElement("h3");
      name.textContent = plan.name;

      const price = document.createElement("p");
      price.className = "price";
      const amount = pricePerMonth(plan, billing);
      price.textContent = formatPrice(amount);
      if (amount > 0) {
        const unit = document.createElement("span");
        unit.className = "unit";
        unit.textContent = billing === "yearly" ? " per user / month, billed yearly" : " per user / month";
        price.append(unit);
      }

      const blurb = document.createElement("p");
      blurb.textContent = plan.blurb;

      const list = document.createElement("ul");
      for (const feature of plan.features) {
        const item = document.createElement("li");
        item.textContent = feature;
        list.append(item);
      }

      const cta = document.createElement("a");
      cta.className = plan.highlighted ? "button" : "button ghost";
      cta.href = "#signup";
      cta.textContent = plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`;

      card.append(name, price, blurb, list, cta);
      return card;
    }),
  );
}

for (const toggle of toggles) {
  toggle.addEventListener("click", () => {
    for (const t of toggles) t.setAttribute("aria-pressed", String(t === toggle));
    renderPlans(toggle.dataset.billing as Billing);
  });
}
renderPlans("monthly");

// Footer: which commit is live, so each factory merge is visible here.
const build = document.querySelector<HTMLElement>("#build")!;
const shortSha = __BUILD__.sha.slice(0, 7);
const commit = __BUILD__.repo
  ? Object.assign(document.createElement("a"), { href: `https://github.com/${__BUILD__.repo}/commit/${__BUILD__.sha}`, textContent: shortSha })
  : document.createTextNode(shortSha);
build.append("Build ", commit, ` · ${new Date(__BUILD__.time).toLocaleString()}`);
