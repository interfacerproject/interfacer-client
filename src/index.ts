// @interfacer/client — TypeScript SDK for the Interfacer ecosystem
//
// This SDK provides a unified client for:
// - Zenflows (GraphQL, ValueFlows vocabulary) — authentication, resource CRUD, proposals
// - DPP (REST) — Digital Product Passport operations
// - Inbox (REST) — messaging and notifications
// - Wallet (REST) — idea/strength points
// - Social (ActivityPub REST) — likes and follows
//
// Quick start:
//   import { InterfacerClient } from "@interfacer/client";
//   const client = new InterfacerClient({ zenflowsUrl: "https://..." });
//   await client.auth.login({ email: "..." });

export { InterfacerClient } from "./client";

// Auth
export { AuthClient } from "./auth/AuthClient";
export type { UserChallenges } from "./auth/types";

// Crypto types
export type { Keyring } from "./types/entities";

// Resources
export { ResourceClient } from "./resources/ResourceClient";
export type { CreateProjectParams, ProjectFilter } from "./resources/types";

// Files
export { FileClient } from "./files/FileClient";

// DPP
export { DppClient } from "./dpp/DppClient";
export type { DppDocument, DppStatus } from "./dpp/types";

// Messaging
export { InboxClient } from "./messaging/InboxClient";

// Wallet
export { WalletClient } from "./wallet/WalletClient";

// Social
export { SocialClient } from "./social/SocialClient";

// Tagging
export { TaggingClient } from "./tagging/TaggingClient";

// Import
export { ImportClient } from "./import/ImportClient";

// Domain types
export type {
  Project,
  ProjectType,
  ProductFilters,
  ServiceFilters,
  License,
  Contributor,
  Proposal,
  MachineRef,
  MaterialRef,
  ImageRef,
  ModelFile,
  Location,
} from "./types/entities";

// Config
export { createConfig } from "./config/config";
export type { InterfacerConfig } from "./config/config";
