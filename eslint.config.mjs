import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    "_legacy/**",
    ".agents/**",
    // Byte-identical upstream engine references, never imported by the app.
    "docs/scrollcraft/builds/**/scrollcraft.js",
    ".claude/**",
    ".cache/**",
    "AFINA-KAYNAK/**",
    "AFINA-KURUMSAL/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["_legacy", "_legacy/**", "**/_legacy", "**/_legacy/**"],
              message: "_legacy salt okunur referanstır; uygulamaya import edilemez.",
            },
          ],
        },
      ],
    },
  },
]);
