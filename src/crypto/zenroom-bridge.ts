/**
 * Zenroom WASM bridge — type-safe dynamic import wrapper.
 *
 * Zenroom is a peer dependency. The SDK imports it dynamically to:
 * - Avoid bundling the WASM (consumers bring their own)
 * - Support environments where WASM isn't available
 * - Keep the SDK tree-shakeable
 */

export interface ZenroomResult {
  result: string;
  logs?: string;
}

export interface ZenroomKeys {
  keyring: {
    eddsa: string;
    ethereum?: string;
    reflow?: string;
    bitcoin?: string;
    ecdh?: string;
  };
}

/**
 * Execute a Zenroom contract with data and optional keys.
 *
 * @param contract - The .zen contract source code
 * @param data - JSON string input data
 * @param keys - JSON string input keys (optional)
 * @returns The contract result
 */
export async function zencodeExec(
  contract: string,
  params: { data: string; keys?: string }
): Promise<ZenroomResult> {
  const zenroom = await import("zenroom");
  // Zenroom TS types use Uint8Array but runtime accepts strings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { result, logs } = await (zenroom.zencode_exec as any)(contract, {
    data: params.data,
    keys: params.keys || "",
  });
  return { result, logs };
}

/**
 * Zenroom hash functions (SHA-512) for file hashing.
 */
export async function hashInit(algorithm: "sha512"): Promise<ZenroomResult> {
  const zenroom = await import("zenroom");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { result, logs } = await (zenroom.zenroom_hash_init as any)(algorithm);
  return { result, logs };
}

export async function hashUpdate(ctx: string, hexData: string): Promise<ZenroomResult> {
  const zenroom = await import("zenroom");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { result, logs } = await (zenroom.zenroom_hash_update as any)(ctx, hexData);
  return { result, logs };
}

export async function hashFinal(ctx: string): Promise<ZenroomResult> {
  const zenroom = await import("zenroom");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { result, logs } = await (zenroom.zenroom_hash_final as any)(ctx);
  return { result, logs };
}
