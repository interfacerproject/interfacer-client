/**
 * Wallet client — idea and strength points via signed REST API.
 *
 * Ported from interfacer-gui hooks/useWallet.ts
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";

export enum Token {
  Idea = "idea",
  Strengths = "strengths",
}

export class WalletClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {}

  /** Get the current balance for a token type. */
  async getBalance(agentId: string, token: Token): Promise<number> {
    const walletUrl = this.config.walletUrl;
    if (!walletUrl) throw new Error("walletUrl not configured");

    const res = await fetch(`${walletUrl}/${token}/${agentId}`);
    const data = await res.json();

    return data.success === true ? Number(data.amount) / 100 : 0;
  }

  /** Get the balance at a specific point in time. */
  async getBalanceAt(agentId: string, token: Token, timestamp: number): Promise<number> {
    const walletUrl = this.config.walletUrl;
    if (!walletUrl) throw new Error("walletUrl not configured");

    const res = await fetch(`${walletUrl}/${token}/${agentId}?until=${timestamp}`);
    const data = await res.json();

    return data.success === true ? Number(data.amount) / 100 : 0;
  }

  /** Add points to an agent. */
  async addPoints(agentId: string, token: Token, amount = 1): Promise<void> {
    const walletUrl = this.config.walletUrl;
    if (!walletUrl) throw new Error("walletUrl not configured");

    const body = JSON.stringify({
      token,
      amount: String(amount),
      owner: agentId,
    });

    const headers = await signGraphQLRequest(body, this.store);

    const res = await fetch(walletUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) throw new Error(`Wallet addPoints failed: ${res.statusText}`);
  }

  /** Get point trend over a period (change since period start). */
  async getTrend(
    agentId: string,
    token: Token,
    periodStartMs: number
  ): Promise<number> {
    const periodStartBalance = await this.getBalanceAt(agentId, token, periodStartMs);
    const currentBalance = await this.getBalance(agentId, token);

    if (periodStartBalance === 0) return 0;
    return ((currentBalance - periodStartBalance) / periodStartBalance) * 100;
  }
}
