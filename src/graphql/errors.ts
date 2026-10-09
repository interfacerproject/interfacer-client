/** GraphQL error metadata is part of the SDK contract, not just display text. */
export interface GraphQLError {
  message: string;
  path?: Array<string | number>;
  locations?: Array<{ line: number; column: number }>;
  extensions?: { code?: string; httpStatus?: number; [key: string]: unknown };
}

export interface GraphQLResult<TData = unknown> {
  data?: TData;
  errors?: GraphQLError[];
}

export class GraphQLRequestError extends Error {
  readonly graphQLErrors: GraphQLError[];
  readonly code: string;
  readonly httpStatus?: number;

  constructor(errors: GraphQLError[], context?: string) {
    super([context, errors[0]?.message || "GraphQL request failed"].filter(Boolean).join(": "));
    this.name = "GraphQLRequestError";
    this.graphQLErrors = errors;
    this.code = errors[0]?.extensions?.code || "GRAPHQL_ERROR";
    this.httpStatus = errors[0]?.extensions?.httpStatus;
  }
}

/** Never retain/log the signing exception: it may contain key material. */
export class GraphQLSigningError extends GraphQLRequestError {
  constructor() {
    super([{ message: "Unable to sign the request. Restore your session before trying again.", extensions: { code: "SIGNING_FAILED" } }]);
    this.name = "GraphQLSigningError";
  }
}

export function throwIfGraphQLErrors(result: GraphQLResult, context?: string): void {
  if (result.errors?.length) throw new GraphQLRequestError(result.errors, context);
}
