import { defineConfig } from "vitest/config";

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
