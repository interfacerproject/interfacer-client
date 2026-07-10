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
    variables?: TVariables,
    extraHeaders?: Record<string, string>
  ): Promise<{ data?: TData; errors?: Array<{ message: string }> }> {
    const bodyObj: Record<string, unknown> = { query: operation };
    if (variables) bodyObj.variables = variables;

    // Extract operation name from the document for servers that require it
    const opName = extractOperationName(operation);
    if (opName) bodyObj.operationName = opName;

    const body = JSON.stringify(bodyObj);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Apply extra headers first (e.g. zenflows-admin for signup)
    if (extraHeaders) {
      Object.assign(headers, extraHeaders);
    }

    if (this.signingEnabled) {
      try {
        const signed = await signGraphQLRequest(body, this.store);
        Object.assign(headers, signed);
      } catch (err) {
        // Signing failed — proceed unsigned (useful for public queries)
        console.warn("[interfacer-client] GraphQL signing failed:", err);
      }
    }

    const url = this.config.zenflowsUrl;
    if (!url) throw new Error("zenflowsUrl not configured. Provide zenflowsUrl or proxyUrl in config.");

    const res = await fetch(url, {
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

/** Extract the operation name from a GraphQL document string. */
function extractOperationName(operation: string): string | null {
  const match = operation.match(/(?:query|mutation)\s+(\w+)/);
  return match ? match[1]! : null;
}
