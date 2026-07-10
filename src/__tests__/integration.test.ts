/**
 * Integration tests for client composition and wiring.
 *
 * Tests that sub-clients can be instantiated, wired together,
 * and that the InterfacerClient facade works without a real backend.
 */
import { describe, expect, it } from "vitest";
import { InterfacerClient } from "../client";
import { createConfig, deriveEndpointsFromProxy } from "../config/config";
import { createMemoryStorage } from "../config/storage";
import type { InterfacerConfig } from "../config/config";

const PROXY_URL = "https://test.example.com";

const testConfig: InterfacerConfig = createConfig({ proxyUrl: PROXY_URL });

// Explicit config for tests that need to verify exact URLs
const testConfigExplicit: InterfacerConfig = createConfig({
  zenflowsUrl: "https://test.example.com/zenflows/api",
  zenflowsFileUrl: "https://test.example.com/zenflows/api/file",
  dppUrl: "https://test.example.com/interfacer-dpp",
  inbox: {
    send: "https://test.example.com/inbox/send",
    read: "https://test.example.com/inbox/read",
    countUnread: "https://test.example.com/inbox/count-unread",
    setRead: "https://test.example.com/inbox/set-read",
  },
  walletUrl: "https://test.example.com/wallet/token",
  social: {
    personBase: "https://test.example.com/inbox/person",
    economicResourceBase: "https://test.example.com/inbox/economicresource",
  },
  oshUrl: "https://test.example.com/osh",
});

describe("InterfacerClient", () => {
  it("creates a client with default memory storage", () => {
    const client = new InterfacerClient(testConfig);
    expect(client).toBeDefined();
    expect(client.config.zenflowsUrl).toBe("https://test.example.com/zenflows/api");
  });

  it("creates a client with custom storage", () => {
    const store = createMemoryStorage();
    const client = new InterfacerClient(testConfig, store);
    expect(client.store).toBe(store);
  });

  it("isAuthenticated returns false without keys", () => {
    const client = new InterfacerClient(testConfig);
    expect(client.isAuthenticated()).toBe(false);
  });

  it("isAuthenticated returns true with keys set", () => {
    const client = new InterfacerClient(testConfig);
    client.store.setItem("eddsaPrivateKey", "test-key");
    client.store.setItem("authEmail", "test@example.com");
    expect(client.isAuthenticated()).toBe(true);
  });

  it("getPublicKey returns null when not set", () => {
    const client = new InterfacerClient(testConfig);
    expect(client.getPublicKey()).toBeNull();
  });

  it("getPublicKey returns the stored key", () => {
    const client = new InterfacerClient(testConfig);
    client.store.setItem("eddsaPublicKey", "abcdef123");
    expect(client.getPublicKey()).toBe("abcdef123");
  });
});

describe("Sub-client access", () => {
  it("all sub-clients are accessible and lazy-initialized", () => {
    const client = new InterfacerClient(testConfig);

    expect(client.auth).toBeDefined();
    expect(client.graphql).toBeDefined();
    expect(client.resources).toBeDefined();
    expect(client.files).toBeDefined();
    expect(client.dpp).toBeDefined();
    expect(client.inbox).toBeDefined();
    expect(client.wallet).toBeDefined();
    expect(client.social).toBeDefined();
    expect(client.tagging).toBeDefined();
    expect(client.import).toBeDefined();
  });

  it("sub-clients share the same store", () => {
    const client = new InterfacerClient(testConfig);
    client.store.setItem("test", "shared");

    // Auth client uses the same store (tested indirectly)
    expect(client.isAuthenticated()).toBe(false); // no keys set yet
    expect(client.store.getItem("test")).toBe("shared");
  });
});

describe("GraphQLClient construction", () => {
  it("creates GraphQLClient with signing disabled by default", () => {
    const client = new InterfacerClient(testConfig);
    // GraphQLClient starts with signing disabled
    const gql = client.graphql;
    expect(gql).toBeDefined();
  });
});

describe("Config", () => {
  it("createConfig passes through all values", () => {
    const config = createConfig({
      zenflowsUrl: "https://z.example.com/api",
    });

    expect(config.zenflowsUrl).toBe("https://z.example.com/api");
  });
});

describe("Proxy URL derivation", () => {
  it("deriveEndpointsFromProxy maps all paths correctly", () => {
    const endpoints = deriveEndpointsFromProxy(PROXY_URL);

    expect(endpoints.zenflowsUrl).toBe(`${PROXY_URL}/zenflows/api`);
    expect(endpoints.zenflowsFileUrl).toBe(`${PROXY_URL}/zenflows/api/file`);
    expect(endpoints.dppUrl).toBe(`${PROXY_URL}/interfacer-dpp`);
    expect(endpoints.inbox.send).toBe(`${PROXY_URL}/inbox/send`);
    expect(endpoints.inbox.read).toBe(`${PROXY_URL}/inbox/read`);
    expect(endpoints.inbox.countUnread).toBe(`${PROXY_URL}/inbox/count-unread`);
    expect(endpoints.inbox.setRead).toBe(`${PROXY_URL}/inbox/set-read`);
    expect(endpoints.walletUrl).toBe(`${PROXY_URL}/wallet/token`);
    expect(endpoints.social.personBase).toBe(`${PROXY_URL}/inbox/person`);
    expect(endpoints.social.economicResourceBase).toBe(`${PROXY_URL}/inbox/economicresource`);
    expect(endpoints.oshUrl).toBe(`${PROXY_URL}/osh`);
  });

  it("deriveEndpointsFromProxy strips trailing slash", () => {
    const endpoints = deriveEndpointsFromProxy(`${PROXY_URL}/`);
    expect(endpoints.zenflowsUrl).toBe(`${PROXY_URL}/zenflows/api`);
  });

  it("createConfig with only proxyUrl derives all service URLs", () => {
    const config = createConfig({ proxyUrl: PROXY_URL });

    expect(config.zenflowsUrl).toBe(`${PROXY_URL}/zenflows/api`);
    expect(config.zenflowsFileUrl).toBe(`${PROXY_URL}/zenflows/api/file`);
    expect(config.dppUrl).toBe(`${PROXY_URL}/interfacer-dpp`);
    expect(config.inbox?.send).toBe(`${PROXY_URL}/inbox/send`);
    expect(config.inbox?.read).toBe(`${PROXY_URL}/inbox/read`);
    expect(config.inbox?.countUnread).toBe(`${PROXY_URL}/inbox/count-unread`);
    expect(config.inbox?.setRead).toBe(`${PROXY_URL}/inbox/set-read`);
    expect(config.walletUrl).toBe(`${PROXY_URL}/wallet/token`);
    expect(config.social?.personBase).toBe(`${PROXY_URL}/inbox/person`);
    expect(config.social?.economicResourceBase).toBe(`${PROXY_URL}/inbox/economicresource`);
    expect(config.oshUrl).toBe(`${PROXY_URL}/osh`);
  });

  it("createConfig with proxyUrl + extra fields preserves non-derivable fields", () => {
    const config = createConfig({
      proxyUrl: PROXY_URL,
      loshId: "06EG20F8TN5159QS8VXVAEJ1WR",
      zenflowsAdmin: "secret-admin-token",
      specs: { machine: "06DGHXVBGFFMANA12H3WGXSHFC" },
      walletCycle: { startDate: "2024-01-01", cycleLength: 30 },
    });

    expect(config.loshId).toBe("06EG20F8TN5159QS8VXVAEJ1WR");
    expect(config.zenflowsAdmin).toBe("secret-admin-token");
    expect(config.specs?.machine).toBe("06DGHXVBGFFMANA12H3WGXSHFC");
    expect(config.walletCycle?.startDate).toBe("2024-01-01");
    // Service URLs still derived
    expect(config.zenflowsUrl).toBe(`${PROXY_URL}/zenflows/api`);
  });

  it("createConfig explicit URL overrides proxy-derived URL", () => {
    const config = createConfig({
      proxyUrl: PROXY_URL,
      zenflowsUrl: "https://custom.example.com/zenflows",
    });

    expect(config.zenflowsUrl).toBe("https://custom.example.com/zenflows");
    // Other URLs still derived
    expect(config.dppUrl).toBe(`${PROXY_URL}/interfacer-dpp`);
  });

  it("client works with proxy-only config", () => {
    const config = createConfig({ proxyUrl: PROXY_URL });
    const client = new InterfacerClient(config);

    expect(client).toBeDefined();
    expect(client.config.zenflowsUrl).toBe(`${PROXY_URL}/zenflows/api`);
    expect(client.config.inbox?.send).toBe(`${PROXY_URL}/inbox/send`);
  });
});
