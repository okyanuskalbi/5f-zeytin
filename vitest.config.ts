import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // Tam takımda 160+ dosya paralel koşar; CPU'ya bağlı testler (ör. 150 bin beklentili indirim taraması, CLI süreçleri) 5 sn varsayılanını aşıp dalgalanıyordu.
    testTimeout: 30000,
    setupFiles: ["./tests/setup-d1.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.{ts,tsx}"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
