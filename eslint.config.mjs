import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "**/*.d.ts", // declaration files for untyped third-party libs (A-Frame, etc.)
  ]),
  {
    rules: {
      // Tech debt: dynamic third-party integrations (A-Frame, Web Audio, Pusher)
      // still rely on `any`. Keep it visible as a warning while new code is strict.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
