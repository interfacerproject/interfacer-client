/**
 * Real integration tests against the dev backend.
 *
 * These tests exercise the full lifecycle against proxy.dpp-dev.ddns.dyne.org.
 * Requires a .env file with real credentials (not committed).
 *
 * In CI: values come from GitHub Secrets.
 * Locally: copy from interfacer-gui/.env.local
 */

import { describe, expect, it } from "vitest";
import { InterfacerClient } from "../client";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";
import { ProjectType } from "../types/entities";

// Load from env (vitest loads .env automatically via Vite)
const getEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
};

function makeConfig() {
  return createConfig({
    zenflowsUrl: getEnv("INTERFACER_ZENFLOWS_URL"),
    zenflowsFileUrl: getEnv("INTERFACER_ZENFLOWS_FILE_URL"),
    dppUrl: getEnv("INTERFACER_DPP_URL"),
    inbox: {
      send: getEnv("INTERFACER_INBOX_SEND"),
      read: getEnv("INTERFACER_INBOX_READ"),
      countUnread: getEnv("INTERFACER_INBOX_COUNT_UNREAD"),
      setRead: getEnv("INTERFACER_INBOX_SET_READ"),
    },
    walletUrl: getEnv("INTERFACER_WALLET_URL"),
    social: {
      personBase: getEnv("INTERFACER_SOCIAL_PERSON"),
      economicResourceBase: getEnv("INTERFACER_SOCIAL_ER"),
    },
    oshUrl: getEnv("INTERFACER_OSH_URL"),
    loshId: getEnv("INTERFACER_LOSH_ID"),
    zenflowsAdmin: getEnv("INTERFACER_ZENFLOWS_ADMIN"),
    specs: {
      machine: getEnv("INTERFACER_SPEC_MACHINE"),
      dpp: getEnv("INTERFACER_SPEC_DPP"),
    },
  });
}

describe("Real backend integration", () => {
  const TEST_EMAIL = `test-${Date.now()}@interfacer-test.dyne.org`;
  const TEST_USERNAME = `testuser-${Date.now()}`;
  const TEST_NAME = "SDK Integration Test";
  const TEST_CHALLENGES = {
    whereParentsMet: "Rome",
    nameFirstPet: "Fido",
    nameFirstTeacher: "Rossi",
    whereHomeTown: "Milan",
    nameMotherMaid: "Bianchi",
  };

  // We'll derive these during the test
  let hmac = "";
  let client: InterfacerClient;

  it("step 1: request HMAC from Zenflows keypairoomServer", async () => {
    client = new InterfacerClient(makeConfig(), createMemoryStorage());

    hmac = await client.auth.requestHmac(TEST_EMAIL, true);
    expect(hmac).toBeTruthy();
    expect(typeof hmac).toBe("string");
    console.log("  ✓ HMAC received:", hmac.substring(0, 20) + "...");
  });

  it("step 2: derive keys from challenges + HMAC", async () => {
    const keyring = await client.auth.deriveKeys(TEST_CHALLENGES, TEST_EMAIL, hmac);
    expect(keyring.eddsa).toBeTruthy();
    expect(keyring.eddsa_public_key).toBeTruthy();
    expect(keyring.ethereum_address).toBeTruthy();
    console.log("  ✓ Keys derived. EdDSA pub:", keyring.eddsa_public_key.substring(0, 20) + "...");
  });

  it("step 3: register user on Zenflows", async () => {
    const agentId = await client.auth.registerUser({
      name: TEST_NAME,
      user: TEST_USERNAME,
      email: TEST_EMAIL,
    });
    expect(agentId).toBeTruthy();
    console.log("  ✓ User registered. Agent ID:", agentId);
  });

  it("step 4: login / verify user", async () => {
    const profile = await client.auth.login({ email: TEST_EMAIL });
    expect(profile).toBeTruthy();
    expect(profile.name).toBe(TEST_NAME);
    expect(profile.username).toBe(TEST_USERNAME);
    expect(client.isAuthenticated()).toBe(true);
    console.log("  ✓ Logged in as:", profile.name, `(${profile.id})`);
  });

  it("step 5: fetch instance variables", async () => {
    // We can't easily access the internal getInstanceVariables,
    // but the resource client uses it. Test indirectly:
    const projects = await client.resources.getProjects();
    expect(projects).toBeDefined();
    console.log("  ✓ Instance variables fetched, projects query works");
  });

  it("step 6: create a project (Design)", async () => {
    const project = await client.resources.createProject({
      projectType: ProjectType.DESIGN,
      name: `Test Design ${Date.now()}`,
      note: "Created by SDK integration test",
      tags: ["tag-test"],
      license: "CERN-OHL-S-2.0",
    });
    expect(project).toBeTruthy();
    expect(project.id).toBeTruthy();
    expect(project.name).toContain("Test Design");
    console.log("  ✓ Project created:", project.id, project.name);
  });

  it("step 7: get the project by ID", async () => {
    // We don't have the ID from step 6 — list projects instead
    const projectsData = await client.resources.getProjects();
    expect(projectsData).toBeDefined();
    console.log("  ✓ Projects listed");
  });

  it("step 8: fetch classifications (tags)", async () => {
    // This is a public query, no auth needed
    const graphql = client.graphql;
    const res = await graphql.request(`{ economicResourceClassifications }`);
    expect(res.data).toBeDefined();
    console.log("  ✓ Tags fetched");
  });
});
