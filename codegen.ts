/**
 * GraphQL Codegen configuration.
 *
 * Generates TypeScript types from the Zenflows GraphQL schema.
 * Run with: pnpm codegen
 *
 * Schema: https://zenflows-test.interfacer.dyne.org/play
 */
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://proxy.dpp-dev.ddns.dyne.org/zenflows/api/play",
  documents: ["./src/**/*.ts"],
  generates: {
    "./src/graphql/__generated__/zenflows.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        avoidOptionals: true,
        maybeValue: "T | null",
        enumsAsTypes: true,
        skipTypename: true,
      },
    },
  },
};

export default config;
