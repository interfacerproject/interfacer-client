import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load .env into process.env (vitest auto-loads via Vite's loadEnv which
// only populates import.meta.env, not process.env in Node test context).
dotenv.config();

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
  },
  // Treat .zen files as raw text strings (same as tsup loader: "text")
  plugins: [
    {
      name: "zen-raw",
      transform(_code: string, id: string) {
        if (id.endsWith(".zen")) {
          return {
            code: `export default ${JSON.stringify(_code)};`,
            map: null,
          };
        }
      },
    },
  ],
});
