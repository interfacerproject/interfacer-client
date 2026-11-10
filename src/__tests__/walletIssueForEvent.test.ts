import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryStorage } from "../config/storage";
import { WalletClient } from "../wallet/WalletClient";

// Sign is cryptographic (zenroom); stub it to fixed headers.
vi.mock("../crypto/sign", () => ({
  signDidRequest: vi.fn(async () => ({
    "did-sign": "SIG",
    "did-pk": "PK",
  })),
}));

function client() {
  const store = createMemoryStorage();
  store.setItem("authId", "01ACTOR");
  // minimal config with a wallet URL
  return new WalletClient(
    { walletUrl: "https://wallet.test/token" } as unknown as ConstructorParameters<typeof WalletClient>[0],
    store
  );
}

describe("WalletClient.issueForEvent", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("posts an event reference and no owner/amount", async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({
      ok: true,
      json: async () => ({ success: true }),
    }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    await client().issueForEvent({ type: "accept", id: "01EVT" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));
    const headers = init.headers as Record<string, string>;
    expect(body).toEqual({ event: { type: "accept", id: "01EVT" } });
    expect(body.owner).toBeUndefined();
    expect(body.amount).toBeUndefined();
    expect(headers["did-sign"]).toBe("SIG");
    expect(headers["did-pk"]).toBe("PK");
  });

  it("throws when the server denies (success:false), minting nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ success: false, reason: "already_paid" }),
      })) as unknown as typeof fetch
    );
    await expect(client().issueForEvent({ type: "accept", id: "01EVT" })).rejects.toThrow(/already_paid/);
  });

  it("throws on a non-ok HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        statusText: "Bad Gateway",
        json: async () => ({}),
      })) as unknown as typeof fetch
    );
    await expect(client().issueForEvent({ type: "accept", id: "01EVT" })).rejects.toThrow();
  });
});
