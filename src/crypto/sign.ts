/**
 * EdDSA signing for GraphQL requests using Zenroom.
 *
 * The signing contract (sign_graphql.zen):
 *   1. Takes the GraphQL body as a base64 string
 *   2. Signs it with the EdDSA private key
 *   3. Returns { eddsa_signature, hash }
 *
 * The resulting headers:
 *   - zenflows-sign: the EdDSA signature
 *   - zenflows-user: the username
 *   - zenflows-hash: the hash of the signed body
 */

import base64url from "base64url";
import { KeyStorage } from "../config/storage";
import signContractSource from "../zenflows-crypto/src/sign_graphql.zen";
import { zencodeExec } from "./zenroom-bridge";

const SIGN_CONTRACT = signContractSource;

/**
 * Storage keys used by the signing layer.
 */
export const SIGNING_KEYS = {
  privateKey: "eddsaPrivateKey",
  publicKey: "eddsaPublicKey",
  username: "authUsername",
} as const;

/**
 * Sign a request body and return the Zenflows auth headers.
 *
 * @param body - The raw request body (GraphQL query JSON string, or any string)
 * @param store - KeyStorage containing the EdDSA private key
 * @returns Headers object with zenflows-sign, zenflows-user, zenflows-hash
 */
export async function signGraphQLRequest(
  body: string,
  store: KeyStorage
): Promise<{
  "zenflows-sign": string;
  "zenflows-user": string;
  "zenflows-hash": string;
}> {
  const eddsaKey = store.getItem(SIGNING_KEYS.privateKey);
  const username = store.getItem(SIGNING_KEYS.username);

  if (!eddsaKey) {
    throw new Error("Missing EdDSA private key. Authenticate first.");
  }

  const keys = JSON.stringify({ keyring: { eddsa: eddsaKey } });
  const data = JSON.stringify({
    gql: Buffer.from(body, "utf8").toString("base64"),
  });

  const { result } = await zencodeExec(SIGN_CONTRACT, { data, keys });
  const parsed = JSON.parse(result) as {
    eddsa_signature: string;
    hash: string;
  };

  return {
    "zenflows-sign": parsed.eddsa_signature,
    "zenflows-user": username || "",
    "zenflows-hash": parsed.hash,
  };
}

/**
 * Sign a request body for DPP REST API (createDpp, updateDpp, etc.).
 * Base64-encodes the full JSON body before signing.
 */
export async function signDidRequest(
  body: string,
  store: KeyStorage
): Promise<{
  "did-sign": string;
  "did-pk": string;
}> {
  const eddsaKey = store.getItem(SIGNING_KEYS.privateKey);
  const pk = store.getItem(SIGNING_KEYS.publicKey);

  if (!eddsaKey) {
    throw new Error("Missing EdDSA private key. Authenticate first.");
  }

  const keys = JSON.stringify({ keyring: { eddsa: eddsaKey } });
  const data = JSON.stringify({
    gql: Buffer.from(body, "utf8").toString("base64"),
  });

  const { result } = await zencodeExec(SIGN_CONTRACT, { data, keys });
  const parsed = JSON.parse(result) as {
    eddsa_signature: string;
    hash: string;
  };

  return {
    "did-sign": parsed.eddsa_signature,
    "did-pk": pk || "",
  };
}

/**
 * Sign a file checksum for DPP file upload.
 * Signs the raw hex SHA-256 checksum (NOT base64-encoded).
 * This matches the DPP service's verify_graphql.zen contract.
 */
export async function signFileUpload(
  checksumHex: string,
  store: KeyStorage
): Promise<string> {
  const eddsaKey = store.getItem(SIGNING_KEYS.privateKey);
  if (!eddsaKey) {
    throw new Error("Missing EdDSA private key. Authenticate first.");
  }

  const keys = JSON.stringify({ keyring: { eddsa: eddsaKey } });
  // DPP verify_graphql.zen expects raw hex checksum (matching original main.mjs)
  const data = JSON.stringify({ gql: checksumHex });

  const { result } = await zencodeExec(SIGN_CONTRACT, { data, keys });
  const parsed = JSON.parse(result) as { eddsa_signature: string };
  return parsed.eddsa_signature;
}

/**
 * Hash a file for Zenflows upload using Zenroom SHA-512.
 *
 * The file is hashed in 64KB chunks, then the final hash is
 * base64url-encoded for use as the file identifier.
 */
export async function hashFileForZenflows(arrayBuffer: ArrayBuffer): Promise<string> {
  const { hashInit, hashUpdate, hashFinal } = await import("./zenroom-bridge");

  const bytesChunkSize = 1024 * 64; // 64KB
  let ctx = await hashInit("sha512");

  for (let i = 0; i < arrayBuffer.byteLength; i += bytesChunkSize) {
    const upperLimit =
      i + bytesChunkSize > arrayBuffer.byteLength ? arrayBuffer.byteLength : i + bytesChunkSize;
    const chunk = new Uint8Array(arrayBuffer.slice(i, upperLimit));
    const hex = uint8ArrayToHex(chunk);
    ctx = await hashUpdate(ctx.result, hex);
  }

  ctx = await hashFinal(ctx.result);
  return base64url.fromBase64(ctx.result);
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
