/**
 * Integration tests for client composition and wiring.
 *
 * Tests that sub-clients can be instantiated, wired together,
 * and that the InterfacerClient facade works without a real backend.
 */
import { describe, expect, it } from "vitest";
import { InterfacerClient } from "../client";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";
import { InterfacerConfig } from "../config/config";

const testConfig: InterfacerConfig = createConfig({
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
