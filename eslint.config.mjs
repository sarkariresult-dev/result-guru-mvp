import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  /* Project-specific rules */
  {
    rules: {
      /* Warn on console.log (allow warn/error) - prevents leaked debug logs */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      /* Prefer const over let when variable is never reassigned */
      "prefer-const": "error",
      /* Unused vars - allow underscore prefix for intentionally unused */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      /* Allow explicit any in escape hatches but warn */
      "@typescript-eslint/no-explicit-any": "warn",
      /* Enforce exhaustive deps in useEffect */
      "react-hooks/exhaustive-deps": "warn",
      /* No img - enforce next/image for optimisation + CLS */
      "@next/next/no-img-element": "error",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "eslint-report.json",
    "supabase/**",
  ]),
]);

export default eslintConfig;
