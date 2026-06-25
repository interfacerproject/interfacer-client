/**
 * Key derivation using Keypairoom + Zenroom.
 *
 * Two flows:
 *   1. deriveKeys() — First-time key generation from challenges + HMAC
 *   2. recreateKeys() — Recreate keys from seed mnemonic + HMAC (login)
 *
 * Both flows produce the same keyring structure stored in KeyStorage.
 */

import { KeyStorage } from "../config/storage";
import { Keyring, UserChallenges } from "../types/entities";
import keygenContractSource from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12.zen";
import recreateContractSource from "../zenflows-crypto/src/keypairoomClientRecreateKeys.zen";
import { zencodeExec } from "./zenroom-bridge";

const KEYGEN_CONTRACT = keygenContractSource;
const RECREATE_CONTRACT = recreateContractSource;

/**
 * Storage keys written by deriveKeys() / recreateKeys().
 */
export const KEYPAIR_STORAGE_KEYS = {
  eddsaPrivateKey: "eddsaPrivateKey",
  eddsaPublicKey: "eddsaPublicKey",
  ethereumPrivateKey: "ethereumPrivateKey",
  ethereumAddress: "ethereumAddress",
  reflowPrivateKey: "reflowPrivateKey",
  reflowPublicKey: "reflowPublicKey",
  bitcoinPrivateKey: "bitcoinPrivateKey",
  bitcoinPublicKey: "bitcoinPublicKey",
  ecdhPrivateKey: "ecdhPrivateKey",
  ecdhPublicKey: "ecdhPublicKey",
  seed: "seed",
} as const;

/**
 * Derive all keypairs from user challenges + server HMAC.
 * This is the first-time key generation flow (registration).
 *
 * @param challenges - The 5 security question answers
 * @param email - User's email (used as username in the contract)
 * @param hmac - Server-side HMAC shard (base64)
 * @param store - KeyStorage to persist the resulting keys
 * @returns The derived Keyring
 */
export async function deriveKeys(
  challenges: UserChallenges,
  email: string,
  hmac: string,
  store: KeyStorage
): Promise<Keyring> {
  const data = JSON.stringify({
    userChallenges: {
      whereParentsMet: challenges.whereParentsMet,
      nameFirstPet: challenges.nameFirstPet,
      nameFirstTeacher: challenges.nameFirstTeacher,
      whereHomeTown: challenges.whereHomeTown,
      nameMotherMaid: challenges.nameMotherMaid,
    },
    username: email,
    "seedServerSideShard.HMAC": hmac,
  });

  const { result } = await zencodeExec(KEYGEN_CONTRACT, { data });
  const keyring = parseKeyringResult(result);
  persistKeyring(keyring, store);
  return keyring;
}

/**
 * Recreate all keypairs from a seed mnemonic + server HMAC.
 * This is the login flow (returns the same keys as deriveKeys).
 *
 * @param seed - The seed mnemonic phrase
 * @param hmac - Server-side HMAC shard (base64)
 * @param store - KeyStorage to persist the resulting keys
 * @returns The derived Keyring
 */
export async function recreateKeys(
  seed: string,
  hmac: string,
  store: KeyStorage
): Promise<Keyring> {
  const data = JSON.stringify({
    seed: seed,
    "seedServerSideShard.HMAC": hmac,
  });

  const { result } = await zencodeExec(RECREATE_CONTRACT, { data });
  const keyring = parseKeyringResult(result);
  persistKeyring(keyring, store);
  return keyring;
}

/**
 * Parse the Zenroom JSON output into a Keyring.
 */
function parseKeyringResult(result: string): Keyring {
  const parsed = JSON.parse(result) as {
    keyring: {
      eddsa: string;
      ethereum: string;
      reflow: string;
      bitcoin: string;
      ecdh: string;
    };
    seed: string;
    eddsa_public_key: string;
    ethereum_address: string;
    reflow_public_key: string;
    bitcoin_public_key: string;
    ecdh_public_key: string;
  };

  return {
    eddsa: parsed.keyring.eddsa,
    ethereum: parsed.keyring.ethereum,
    reflow: parsed.keyring.reflow,
    bitcoin: parsed.keyring.bitcoin,
    ecdh: parsed.keyring.ecdh,
    seed: parsed.seed,
    eddsa_public_key: parsed.eddsa_public_key,
    ethereum_address: parsed.ethereum_address,
    reflow_public_key: parsed.reflow_public_key,
    bitcoin_public_key: parsed.bitcoin_public_key,
    ecdh_public_key: parsed.ecdh_public_key,
  };
}

/**
 * Write all derived keys to the KeyStorage.
 */
function persistKeyring(keyring: Keyring, store: KeyStorage): void {
  const K = KEYPAIR_STORAGE_KEYS;
  store.setItem(K.eddsaPrivateKey, keyring.eddsa);
  store.setItem(K.eddsaPublicKey, keyring.eddsa_public_key);
  store.setItem(K.ethereumPrivateKey, keyring.ethereum);
  store.setItem(K.ethereumAddress, keyring.ethereum_address);
  store.setItem(K.reflowPrivateKey, keyring.reflow);
  store.setItem(K.reflowPublicKey, keyring.reflow_public_key);
  store.setItem(K.bitcoinPrivateKey, keyring.bitcoin);
  store.setItem(K.bitcoinPublicKey, keyring.bitcoin_public_key);
  store.setItem(K.ecdhPrivateKey, keyring.ecdh);
  store.setItem(K.ecdhPublicKey, keyring.ecdh_public_key);
  store.setItem(K.seed, keyring.seed);
}
