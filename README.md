# @interfacer/client

TypeScript SDK for the [Interfacer](https://interfacer.dyne.org) ecosystem — a unified client for Zenflows, Digital Product Passport (DPP), messaging, points, and social features.

```bash
pnpm add @interfacer/client zenroom
```

## Quick Start

```typescript
import { InterfacerClient } from "@interfacer/client";

const client = new InterfacerClient({
  zenflowsUrl: "https://proxy.example.com/zenflows/api",
  zenflowsFileUrl: "https://proxy.example.com/zenflows/api/file",
  dppUrl: "https://proxy.example.com/interfacer-dpp",
  inbox: {
    send: "https://proxy.example.com/inbox/send",
    read: "https://proxy.example.com/inbox/read",
    countUnread: "https://proxy.example.com/inbox/count-unread",
    setRead: "https://proxy.example.com/inbox/set-read",
  },
  walletUrl: "https://proxy.example.com/wallet/token",
  social: {
    personBase: "https://proxy.example.com/inbox/person",
    economicResourceBase: "https://proxy.example.com/inbox/economicresource",
  },
});

// Register a new user
await client.auth.requestHmac("user@example.com", true);
await client.auth.deriveKeys(
  {
    whereParentsMet: "Paris",
    nameFirstPet: "Rex",
    nameFirstTeacher: "Smith",
    whereHomeTown: "Berlin",
    nameMotherMaid: "Jones",
  },
  "user@example.com",
  hmac
);
await client.auth.registerUser({
  name: "Alice",
  user: "alice",
  email: "user@example.com",
});
await client.auth.login({ email: "user@example.com" });
```

## Architecture

The SDK is organized as a facade with lazy-initialized sub-clients:

```
InterfacerClient
├── auth        — Keypairoom auth, EdDSA signing, login/register
├── graphql     — Fetch-based client with auto-signing
├── resources   — Project/Resource CRUD, proposals, contributions
├── files       — File hashing (SHA-512 via Zenroom, SHA-256 via Web Crypto)
├── dpp         — Digital Product Passport operations
├── inbox       — Messaging & notifications
├── wallet      — Idea/Strength points
├── social      — ActivityPub likes & follows
├── tagging     — Classification system (15+ tag prefixes, numeric ranges)
└── import      — GitHub/GitLab auto-import
```

## Sub-Client APIs

### Auth

```typescript
// Step 1: Get HMAC server-side shard
const hmac = await client.auth.requestHmac(email, firstRegistration);

// Step 2a: Derive keys from challenges (first-time)
await client.auth.deriveKeys(challenges, email, hmac);

// Step 2b: Recreate keys from seed (login)
await client.auth.recreateKeys(seed, hmac);

// Step 3: Register user
await client.auth.registerUser({ name, user, email });

// Step 4: Login
const profile = await client.auth.login({ email });

// Post-registration
await client.auth.sendEmailVerification();
await client.auth.claimDid(personId);

// Check status
client.isAuthenticated(); // boolean
client.getPublicKey();    // string | null
```

### Resources

```typescript
// Create
const project = await client.resources.createProject({
  projectType: "DESIGN",
  name: "My Design",
  note: "Description",
  tags: ["open-source", "3d-printing"],
  license: "CERN-OHL-S-2.0",
});

const machine = await client.resources.createMachine({
  name: "CNC Router",
  metadata: { specs: "..." },
});

// Read
const resource = await client.resources.getResource(id);
const projects = await client.resources.getProjects();
const machines = await client.resources.getMachines();

// Relations
await client.resources.citeResource(resourceId, processId);
await client.resources.consumeResource(resourceId, processId);
await client.resources.contributeToResource(processId, designSpecId);

// Metadata
await client.resources.updateMetadata(resourceId, { contributors: [...] });
await client.resources.updateClassifiedAs(resourceId, tags);
await client.resources.relocateResource(resourceId, locationId);
```

### Proposals & Contributions

```typescript
// Propose a contribution
const { proposalId, citeIntentId, acceptIntentId, modifyIntentId } =
  await client.resources.proposeContribution({
    resourceForkedId: forkedResourceId,
    resourceOriginId: originalResourceId,
    ownerId: originalOwnerId,
    note: "My contribution",
  });

// Accept a proposal
await client.resources.acceptProposal({
  proposalId,
  citeIntentId, acceptIntentId, modifyIntentId,
  resourceForkedId, resourceOriginId,
  ownerId, proposerId,
  newMetadata: { ...updatedMetadata },
});

// Reject
await client.resources.rejectProposal(citeIntentId, acceptIntentId, modifyIntentId);
```

### Files

```typescript
// Hash and prepare for Zenflows
const files = await client.files.prepFilesForZenflows(fileList);

// Upload to Zenflows
await client.files.uploadToZenflows(file);

// Upload to DPP
const attachment = await client.files.uploadToDpp(file);

// Upload model files to DPP
const models = await client.files.uploadModelsToDpp(modelFiles);
```

### DPP

```typescript
const dpp = await client.dpp.createDpp({ productOverview: { ... } });
const existing = await client.dpp.getDpp(id);
await client.dpp.updateDpp(id, { status: "active" });
const list = await client.dpp.listDpps({ status: "active", limit: 10 });
const qrUrl = client.dpp.getQrCodeUrl(id, 256);
await client.dpp.addAttachment(id, "certificates", file);
```

### Messaging

```typescript
await client.inbox.sendMessage(
  { proposalId: "..." },
  ["receiverId"],
  "Contribution proposed"
);

const messages = await client.inbox.getMessages();
const unreadCount = await client.inbox.getUnreadCount();
await client.inbox.markRead(messageId);
```

### Wallet

```typescript
const ideaBalance = await client.wallet.getBalance(agentId, "idea");
const strengthBalance = await client.wallet.getBalance(agentId, "strengths");
await client.wallet.addPoints(agentId, "idea", 100);
const trend = await client.wallet.getTrend(agentId, "idea", weekStartMs);
```

### Social

```typescript
await client.social.likeResource(resourceId);
await client.social.followResource(resourceId);
const likes = await client.social.getLikes();
const isLiked = await client.social.isLiked(resourceId);
const followers = await client.social.getFollowers(resourceId);
```

### Tagging

```typescript
const normalizedTags = client.tagging.normalizeUserTags(["3D Printing", "handmade"]);
// → ["tag-3d-printing", "tag-handmade"]

const userTags = client.tagging.extractUserTagValues(classifiedAs);
// → strips system prefixes, returns user-visible tags

const filterTags = client.tagging.derivedProductFilterTags({
  categories: ["Electronics"],
  powerRequirementW: 120,
  recyclabilityPct: 75,
});
// → ["category-electronics", "powerreq-ge-100", "powerreq-le-150", "recyclability-ge-70", "recyclability-le-80"]
```

### Auto-Import

```typescript
const ghData = await client.import.importFromGithub("https://github.com/owner/repo");
// → { main: { title, link, description, tags }, licenses: [...] }

const glData = await client.import.importFromGitlab("https://gitlab.com", "projectId");
const isOsh = await client.import.analyzeRepoForOsh("https://github.com/owner/repo");
```

## Installation

```bash
pnpm add @interfacer/client zenroom
```

`zenroom` is a peer dependency (WASM-based crypto VM). The SDK imports it dynamically at runtime.

## Development

```bash
pnpm install
pnpm build        # Build ESM + CJS + DTS
pnpm typecheck    # TypeScript strict check
pnpm lint         # ESLint
pnpm test         # Vitest (41 tests)
```

## License

AGPL-3.0-or-later — Dyne.org foundation
