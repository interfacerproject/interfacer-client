/**
 * Authentication client for the Interfacer ecosystem.
 *
 * Handles the full auth lifecycle:
 *   1. requestHmac — get server-side shard from Zenflows keypairoomServer
 *   2. deriveKeys / recreateKeys — client-side key derivation via Zenroom
 *   3. registerUser — create a Person on Zenflows
 *   4. verifyUser / login — check credentials, fetch profile
 *   5. sendEmailVerification, claimDid — post-registration tasks
 */

import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { deriveKeys, recreateKeys } from "../crypto/keypair";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { Keyring, UserChallenges, UserProfile } from "../types/entities";
import {
  CLAIM_DID,
  FETCH_SELF,
  REGISTER_USER,
  SEND_EMAIL_VERIFICATION,
  SIGN_UP,
} from "../graphql/operations";

// ─── Email template enum matching Zenflows backend ──────────────────

enum EmailTemplate {
  InterfacerDeployment = "INTERFACER_DEPLOYMENT",
  InterfacerStaging = "INTERFACER_STAGING",
  InterfacerTesting = "INTERFACER_TESTING",
  InterfacerBeta = "INTERFACER_BETA",
  InterfacerSelf = "INTERFACER_SELF",
}

// ─── Client ─────────────────────────────────────────────────────────

export class AuthClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage,
    private graphql: GraphQLClient
  ) {}

  // ─── Step 1: Request HMAC ─────────────────────────────────────────

  /**
   * Request the server-side HMAC shard from Zenflows keypairoomServer.
   *
   * @param email - User's email
   * @param firstRegistration - true for sign-up, false for sign-in
   * @returns The HMAC string (base64)
   */
  async requestHmac(email: string, firstRegistration: boolean): Promise<string> {
    const userData = JSON.stringify({ email });

    const res = await this.graphql.request<{
      keypairoomServer: string;
    }>(
      REGISTER_USER,
      { firstRegistration, userData }
    );

    if (res.errors?.length) {
      throw new Error(`HMAC request failed: ${res.errors[0]!.message}`);
    }

    const hmac = res.data?.keypairoomServer;
    if (!hmac) throw new Error("HMAC not returned from server. Email may not exist.");

    return hmac;
  }

  // ─── Step 2: Key derivation ───────────────────────────────────────

  /**
   * Derive all keypairs from user challenges + server HMAC (registration).
   * Keys are persisted to the store automatically.
   */
  async deriveKeys(challenges: UserChallenges, email: string, hmac: string): Promise<Keyring> {
    return deriveKeys(challenges, email, hmac, this.store);
  }

  /**
   * Recreate all keypairs from seed mnemonic + server HMAC (login).
   * Keys are persisted to the store automatically.
   */
  async recreateKeys(seed: string, hmac: string): Promise<Keyring> {
    return recreateKeys(seed, hmac, this.store);
  }

  // ─── Step 3: Register ─────────────────────────────────────────────

  /**
   * Register a new person on Zenflows.
   * Requires keys to already be derived (via deriveKeys).
   */
  async registerUser(params: {
    name: string;
    user: string;
    email: string;
  }): Promise<string> {
    const res = await this.graphql.request<{
      createPerson: {
        agent: { id: string; name: string; user: string; email: string };
      };
    }>(
      SIGN_UP,
      {
        name: params.name,
        user: params.user,
        email: params.email,
        eddsaPublicKey: this.store.getItem("eddsaPublicKey") || "",
        reflowPublicKey: this.store.getItem("reflowPublicKey") || "",
        ethereumAddress: this.store.getItem("ethereumAddress") || "",
        ecdhPublicKey: this.store.getItem("ecdhPublicKey") || "",
        bitcoinPublicKey: this.store.getItem("bitcoinPublicKey") || "",
      },
      this.config.zenflowsAdmin
        ? { "zenflows-admin": this.config.zenflowsAdmin }
        : undefined
    );

    if (res.errors?.length) {
      throw new Error(`Registration failed: ${res.errors[0]!.message}`);
    }

    const agent = res.data?.createPerson.agent;
    if (!agent) throw new Error("Registration failed: no agent returned.");

    // Persist auth info
    this.store.setItem("authId", agent.id);
    this.store.setItem("authName", agent.name);
    this.store.setItem("authUsername", agent.user);
    this.store.setItem("authEmail", agent.email);

    return agent.id;
  }

  // ─── Step 4: Verify / Login ───────────────────────────────────────

  /**
   * Verify a user exists on Zenflows by email + EdDSA public key.
   */
  async verifyUser(email: string, eddsaPublicKey: string): Promise<UserProfile | null> {
    const res = await this.graphql.request<{
      personCheck: {
        id: string;
        name: string;
        user: string;
        email: string;
        isVerified: boolean;
        note?: string;
        primaryLocation?: {
          id: string;
          name: string;
          mappableAddress?: string;
          lat?: number;
          long?: number;
        };
        images?: Array<{ bin: string; mimeType: string }>;
      } | null;
    }>(FETCH_SELF, { email, pubkey: eddsaPublicKey });

    const person = res.data?.personCheck;
    if (!person) return null;

    return {
      id: person.id,
      name: person.name,
      username: person.user,
      email: person.email,
      isVerified: person.isVerified,
      note: person.note,
      location: person.primaryLocation
        ? {
            id: person.primaryLocation.id,
            name: person.primaryLocation.name,
            address: person.primaryLocation.mappableAddress,
            lat: person.primaryLocation.lat,
            lng: person.primaryLocation.long,
          }
        : undefined,
      image: person.images?.[0]
        ? `data:${person.images[0].mimeType};base64,${person.images[0].bin}`
        : undefined,
    };
  }

  /**
   * Full login flow:
   * 1. Verify user on Zenflows
   * 2. Persist auth info to storage
   * 3. Enable GraphQL request signing
   */
  async login(params: { email: string }): Promise<UserProfile> {
    const pubkey = this.store.getItem("eddsaPublicKey");
    if (!pubkey) throw new Error("No public key found. Derive keys first.");

    const profile = await this.verifyUser(params.email, pubkey);
    if (!profile) throw new Error("User not found. Check email and keys.");

    // Persist auth info
    this.store.setItem("authId", profile.id);
    this.store.setItem("authName", profile.name);
    this.store.setItem("authUsername", profile.username);
    this.store.setItem("authEmail", profile.email);

    // Enable signing for subsequent requests
    this.graphql.setSigningEnabled(true);

    return profile;
  }

  // ─── Step 5: Post-registration ────────────────────────────────────

  /**
   * Send email verification.
   * The template is auto-detected from the Zenflows URL origin.
   */
  async sendEmailVerification(): Promise<void> {
    // Determine template from origin
    const template = this.detectTemplate();

    const res = await this.graphql.request(SEND_EMAIL_VERIFICATION, { template });

    if (res.errors?.length) {
      throw new Error(`Email verification failed: ${res.errors[0]!.message}`);
    }
  }

  /**
   * Claim a DID for the current user.
   */
  async claimDid(personId: string): Promise<string> {
    const res = await this.graphql.request<{ claimPerson: string }>(CLAIM_DID, { id: personId });

    if (res.errors?.length) {
      throw new Error(`DID claim failed: ${res.errors[0]!.message}`);
    }

    return res.data?.claimPerson || "";
  }

  // ─── Logout ───────────────────────────────────────────────────────

  /** Clear all auth state from storage. */
  logout(): void {
    this.store.clear();
    this.graphql.setSigningEnabled(false);
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private detectTemplate(): EmailTemplate {
    if (typeof window === "undefined") return EmailTemplate.InterfacerTesting;

    const origin = window.location.origin;
    switch (origin) {
      case "https://interfacer.dyne.org":
        return EmailTemplate.InterfacerDeployment;
      case "https://interfacer-gui-staging.dyne.org":
        return EmailTemplate.InterfacerStaging;
      case "https://beta.interfacer.dyne.org":
        return EmailTemplate.InterfacerBeta;
      case "http://localhost:3000":
        return EmailTemplate.InterfacerTesting;
      default:
        return EmailTemplate.InterfacerSelf;
    }
  }
}
