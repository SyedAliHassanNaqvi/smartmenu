import { z } from "zod";

/**
 * Zod-validated server-side environment variables.
 *
 * Fails fast at server startup when required variables are missing or invalid,
 * so misconfiguration is caught before traffic ever hits an endpoint.
 * Import this only from server code (API routes, lib, scripts run via tsx).
 */
const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DB_NAME: z.string().min(1).default("visiondine"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Payments (Nexi XPay) — optional, required only when payments are enabled
  NEXI_XPAY_API_URL: z.string().url().optional(),
  NEXI_XPAY_API_KEY: z.string().optional(),

  // Media (Cloudinary) — optional, required only for menu media uploads
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Emails (Resend) — optional, required only when sending invitation emails
  RESEND_API_KEY: z.string().optional(),

  // AI providers — optional, required only when the AI features are enabled
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid server environment configuration:\n${issues}`);
}

export const serverEnv = parsed.data;

export const isProduction = serverEnv.NODE_ENV === "production";
export const isDevelopment = serverEnv.NODE_ENV === "development";
