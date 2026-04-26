import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
    // The RxDB E2E suite under tests/replication.e2e.test.ts boots a real
    // RxDB instance against fake-indexeddb. Boot/teardown takes a few
    // seconds; raise the per-test timeout so slower CI runners don't false-
    // alarm. Other tests are unaffected because the timeout is a ceiling.
    testTimeout: 20_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "html"],
      include: ["src/lib/rxdb/**"],
      // schemas/* is wire-format JSON; types.ts is type-only and erases at
      // compile time, so V8 reports 0 %. Excluding both keeps the metric
      // honest about runtime sync code (database, replication, provider,
      // schemas.ts wrapper).
      exclude: ["src/lib/rxdb/schemas/**", "src/lib/rxdb/types.ts"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
