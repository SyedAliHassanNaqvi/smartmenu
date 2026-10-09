import { randomBytes, randomUUID } from "crypto";
import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/api-error";

/**
 * Nexi XPay (hosted payment page) client. Server-only.
 *
 * `NEXI_XPAY_API_URL` points at the hosted-page endpoint
 * (…/api/v1/orders/hpp); the other endpoints are derived from it.
 */

const HPP_SUFFIX = /\/orders\/hpp\/?$/;

function getConfig() {
  const hppUrl = serverEnv.NEXI_XPAY_API_URL;
  const apiKey = serverEnv.NEXI_XPAY_API_KEY;
  if (!hppUrl || !apiKey) {
    throw new ApiError(503, "Online payments are not configured");
  }
  return { hppUrl, apiKey, baseUrl: hppUrl.replace(HPP_SUFFIX, "") };
}

async function nexiRequest(url: string, apiKey: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
  let response: Response;
  let rawText: string;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "Correlation-Id": randomUUID(),
        ...init.headers,
      },
      cache: "no-store",
    });
    rawText = await response.text();
  } catch (error) {
    console.error("[xpay] Network error:", error);
    throw new ApiError(502, "Could not reach the payment provider");
  }

  let data: Record<string, unknown>;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new ApiError(502, "Invalid response from the payment provider");
  }

  if (!response.ok) {
    console.error("[xpay] Error response:", response.status, data);
    throw new ApiError(502, "The payment provider rejected the request");
  }

  return data;
}

/**
 * Generate an order reference for Nexi (≤ 18 chars, unique).
 * `kind` is "S" for subscriptions and "O" for diner orders.
 */
export function generateOrderRef(kind: "S" | "O"): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
  return `VD${kind}${time}${random}`.slice(0, 18);
}

/**
 * Create a hosted payment page session. Returns the URL to redirect the payer to
 * and the security token Nexi will echo in its webhook notifications.
 */
export async function createHostedPayment(input: {
  orderRef: string;
  /** Minor units (cents). */
  amount: number;
  currency: string;
  resultUrl: string;
  cancelUrl: string;
}): Promise<{ hostedPage: string; securityToken?: string }> {
  const { hppUrl, apiKey } = getConfig();
  const appUrl = serverEnv.NEXT_PUBLIC_APP_URL;

  const paymentSession: Record<string, unknown> = {
    actionType: "PAY",
    amount: String(input.amount),
    recurrence: { action: "NO_RECURRING" },
    resultUrl: input.resultUrl,
    cancelUrl: input.cancelUrl,
  };
  // Nexi can only reach a public HTTPS URL; skip notifications on localhost.
  if (appUrl.startsWith("https://")) {
    paymentSession.notificationUrl = `${appUrl}/api/payments/nexi/webhook`;
  }

  const data = await nexiRequest(hppUrl, apiKey, {
    method: "POST",
    body: JSON.stringify({
      order: { orderId: input.orderRef, amount: String(input.amount), currency: input.currency },
      paymentSession,
    }),
  });

  if (typeof data.hostedPage !== "string") {
    throw new ApiError(502, "The payment provider did not return a payment page");
  }

  return {
    hostedPage: data.hostedPage,
    securityToken: typeof data.securityToken === "string" ? data.securityToken : undefined,
  };
}

export type PaymentState = "paid" | "failed" | "pending";

const SUCCESS_RESULTS = ["AUTHORIZED", "EXECUTED"];
const SUCCESS_TYPES = ["AUTHORIZATION", "CAPTURE"];
const FAILURE_RESULTS = ["DECLINED", "DENIED_BY_RISK", "THREEDS_FAILED", "FAILED", "CANCELED", "CANCELLED"];

interface NexiOperation {
  operationType?: string;
  operationResult?: string;
}

/**
 * Ask Nexi for the real state of an order. Never trust a redirect or a webhook
 * body on its own — always confirm here before granting anything.
 */
export async function getPaymentState(orderRef: string): Promise<{
  state: PaymentState;
  amount?: number;
  currency?: string;
}> {
  const { baseUrl, apiKey } = getConfig();
  const data = await nexiRequest(`${baseUrl}/orders/${encodeURIComponent(orderRef)}`, apiKey);

  const operations = (Array.isArray(data.operations) ? data.operations : []) as NexiOperation[];
  const order = (data.orderStatus as { order?: { amount?: string; currency?: string } } | undefined)?.order;

  const paid = operations.some(
    (op) => SUCCESS_TYPES.includes(op.operationType ?? "") && SUCCESS_RESULTS.includes(op.operationResult ?? "")
  );
  const failed = !paid && operations.some((op) => FAILURE_RESULTS.includes(op.operationResult ?? ""));

  return {
    state: paid ? "paid" : failed ? "failed" : "pending",
    amount: order?.amount !== undefined ? Number(order.amount) : undefined,
    currency: order?.currency,
  };
}
