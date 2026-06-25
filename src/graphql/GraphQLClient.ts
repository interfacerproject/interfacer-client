import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";

/**
 * Fetch-based GraphQL client with automatic EdDSA request signing.
 *
 * Replaces Apollo Client used in interfacer-gui.
 * Supports queries and mutations over POST with optional signing.
 */
export class GraphQLClient {
  private signingEnabled: boolean;

  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage,
    signingEnabled = false
  ) {
    this.signingEnabled = signingEnabled;
  }

  /** Enable or disable request signing (use after authentication). */
  setSigningEnabled(enabled: boolean): void {
    this.signingEnabled = enabled;
  }

  /** Execute a GraphQL query or mutation. */
  async request<TData = unknown, TVariables = Record<string, unknown>>(
    operation: string,
    variables?: TVariables
  ): Promise<{ data?: TData; errors?: Array<{ message: string }> }> {
    const body = JSON.stringify({ query: operation, variables });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.signingEnabled) {
      try {
        const signed = await signGraphQLRequest(body, this.store);
        Object.assign(headers, signed);
      } catch (err) {
        // Signing failed — proceed unsigned (useful for public queries)
        console.warn("[interfacer-client] GraphQL signing failed:", err);
      }
    }

    const res = await fetch(this.config.zenflowsUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      return {
        errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
      };
    }

    return res.json() as Promise<{ data?: TData; errors?: Array<{ message: string }> }>;
  }
}
