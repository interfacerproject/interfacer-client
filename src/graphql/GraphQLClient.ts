import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";
import { GraphQLRequestError, GraphQLSigningError, GraphQLResult } from "./errors";

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
  ): Promise<GraphQLResult<TData>> {
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
      } catch {
        // Do not downgrade authenticated reads or writes to anonymous calls.
        // Bootstrap/public requests still work with signing explicitly disabled.
        throw new GraphQLSigningError();
      }
    }

    const url = this.config.zenflowsUrl;
    if (!url) throw new Error("zenflowsUrl not configured. Provide zenflowsUrl or proxyUrl in config.");

    let res: Response;
    try {
      res = await fetch(url, { method: "POST", headers, body });
    } catch {
      // A failed response does not prove the write was not committed. No retry.
      throw new GraphQLRequestError([{
        message: "Unable to reach the service. Check the operation's status before retrying.",
        extensions: { code: "NETWORK_ERROR" },
      }]);
    }

    if (!res.ok) {
      const codes: Record<number, string> = {
        401: "UNAUTHENTICATED", 403: "FORBIDDEN", 409: "CONFLICT",
        429: "RATE_LIMITED", 503: "SERVICE_UNAVAILABLE",
      };
      // Never reflect an upstream error body or arbitrary status text.
      return { errors: [{
        message: `HTTP ${res.status}`,
        extensions: { code: codes[res.status] || "HTTP_ERROR", httpStatus: res.status },
      }] };
    }

    let result: unknown;
    try {
      result = await res.json();
    } catch {
      throw invalidResponse();
    }
    if (!isGraphQLResult(result)) throw invalidResponse();
    return result as GraphQLResult<TData>;
  }
}

function invalidResponse(): GraphQLRequestError {
  return new GraphQLRequestError([{
    message: "The service returned an invalid response. Check the operation's status before retrying.",
    extensions: { code: "INVALID_RESPONSE" },
  }]);
}

function isGraphQLResult(value: unknown): value is GraphQLResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  if (result.data != null && (typeof result.data !== "object" || Array.isArray(result.data))) return false;
  if (result.errors !== undefined && (
    !Array.isArray(result.errors) ||
    result.errors.some(error => !error || typeof error !== "object" || typeof error.message !== "string")
  )) return false;
  return Object.hasOwn(result, "data") || (Array.isArray(result.errors) && result.errors.length > 0);
}

/** Extract the operation name from a GraphQL document string. */
function extractOperationName(operation: string): string | null {
  const match = operation.match(/(?:query|mutation)\s+(\w+)/);
  return match ? match[1]! : null;
}
