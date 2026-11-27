import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryStorage } from "../config/storage";
import { WalletClient } from "../wallet/WalletClient";

// Sign is cryptographic (zenroom); stub it to fixed headers.
vi.mock("../crypto/sign", () => ({
  signDidRequest: vi.fn(async () => ({ "did-sign": "SIG", "did-pk": "PK" })),
  signGraphQLRequest: vi.fn(async () => ({ "zenflows-sign": "ZSIG", "zenflows-user": "u", "zenflows-hash": "h" })),
}));

function client() {
  const store = createMemoryStorage();
  store.setItem("authId", "01ACTOR");
  return new WalletClient(
    { walletUrl: "https://wallet.test/token" } as unknown as ConstructorParameters<typeof WalletClient>[0],
    store
  );
}

describe("WalletClient.addPoints", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("signs as the wallet authenticates: did-sign and did-pk, no zenflows-* headers", async () => {
    // zenflows-wallet reads did-sign/did-pk and its CORS allows only those:
    // zenflows-* headers made every browser call fail its preflight.
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({ ok: true, json: async () => ({ success: true }) }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    await client().addPoints("01AGENT", "idea" as never, 2);

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Record<string, string>;
    expect(headers["did-sign"]).toBe("SIG");
    expect(headers["did-pk"]).toBe("PK");
    expect(Object.keys(headers).filter((h) => h.startsWith("zenflows-"))).toEqual([]);
    expect(JSON.parse(String(init.body))).toEqual({ token: "idea", amount: "2", owner: "01AGENT" });
  });

  it("fails when the wallet answers success: false (it answers HTTP 200 either way)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ success: false, error: "Problem fetching DID" }) })) as unknown as typeof fetch);
    await expect(client().addPoints("01AGENT", "idea" as never)).rejects.toThrow(/Problem fetching DID/);
  });
});
