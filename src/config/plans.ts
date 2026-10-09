/**
 * Subscription plans. The single source of truth for plan prices — the signup
 * page displays them and the server charges them (the client never sends an amount).
 */
export type PlanId = "starter" | "pro" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  /** Price in minor units (cents) for one billing period. */
  price: number;
  currency: string;
  /** Length of the subscription period bought by one payment. */
  periodDays: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 1550,
    currency: "EUR",
    periodDays: 30,
    description: "Perfect for small cafés and bistros",
    features: ["Digital menu & QR codes", "Basic order tracking", "Up to 50 menu items"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 2900,
    currency: "EUR",
    periodDays: 30,
    description: "For growing restaurants",
    features: ["Everything in Starter", "AI recommendations", "Real-time analytics", "Unlimited menu items"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 4900,
    currency: "EUR",
    periodDays: 30,
    description: "The full Vision Dine experience",
    features: ["Everything in Pro", "WebAR menu previews", "Loyalty gamification", "Priority support"],
  },
];

export const PLAN_IDS = PLANS.map((plan) => plan.id) as [PlanId, ...PlanId[]];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/** Format a minor-unit amount, e.g. 1550 EUR → "€15.50". */
export function formatPlanPrice(plan: Pick<Plan, "price" | "currency">): string {
  return new Intl.NumberFormat("en", { style: "currency", currency: plan.currency }).format(plan.price / 100);
}
