/**
 * Minimal gql tagged template literal for GraphQL codegen detection.
 *
 * This is a pass-through — at runtime it returns the string as-is.
 * GraphQL Codegen detects `gql` tagged templates and generates types from them.
 *
 * We deliberately do NOT depend on @apollo/client or graphql-tag.
 */
export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}
