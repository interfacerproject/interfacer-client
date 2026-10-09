import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { ResourceClient } from "../resources/ResourceClient";
import { AuthClient } from "../auth/AuthClient";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";

vi.mock("../crypto/sign", () => ({ signGraphQLRequest: vi.fn() }));
const config = createConfig({ zenflowsUrl: "https://backend.example.invalid/api" });
const denial = { message: "forbidden", path: ["updateEconomicResource"], locations: [{ line: 2, column: 3 }], extensions: { code: "FORBIDDEN", policyVersion: "test" } };
const mutation = "mutation Edit($id:ID!){updateEconomicResource(resource:{id:$id,name:\"Test\"}){economicResource{id}}}";
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetcher = vi.fn().mockImplementation(async () => Response.json({ data: { ok: true } }));
  vi.stubGlobal("fetch", fetcher);
  vi.mocked(signGraphQLRequest).mockReset();
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("request signing boundary", () => {
  it.each([mutation, "query Private { person(id:\"alice\"){email} }"])("never downgrades a signed operation after signing failure: %s", async operation => {
    vi.mocked(signGraphQLRequest).mockRejectedValue(new Error("TEST-PRIVATE-KEY-SENTINEL"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new GraphQLClient(config, createMemoryStorage(), true);
    await expect(client.request(operation)).rejects.toMatchObject({ name: "GraphQLSigningError", code: "SIGNING_FAILED" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
  it("retains explicitly anonymous public reads and keypairoom bootstrap", async () => {
    const client = new GraphQLClient(config, createMemoryStorage());
    await client.request("{units{edges{node{id}}}}");
    await client.request("mutation Bootstrap {keypairoomServer(firstRegistration:true,userData:\"{}\")}");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(signGraphQLRequest).not.toHaveBeenCalled();
  });
  it("signs exactly the body sent, including variables and operationName", async () => {
    const headers = { "zenflows-user": "alice", "zenflows-sign": "synthetic-signature", "zenflows-hash": "synthetic-hash" };
    vi.mocked(signGraphQLRequest).mockResolvedValue(headers);
    const store = createMemoryStorage();
    const client = new GraphQLClient(config, store, true);
    await client.request(mutation, { id: "alice-resource" });
    const options = fetcher.mock.calls[0][1];
    expect(signGraphQLRequest).toHaveBeenCalledWith(options.body, store);
    expect(JSON.parse(options.body)).toEqual({ query: mutation, variables: { id: "alice-resource" }, operationName: "Edit" });
    expect(options.headers).toMatchObject(headers);
  });
});

describe("structured failures", () => {
  it("preserves every GraphQL error, extensions, paths and partial data at the low-level boundary", async () => {
    const errors = [denial, { message: "unauthenticated", path: ["other"], extensions: { code: "UNAUTHENTICATED" } }];
    fetcher.mockResolvedValue(Response.json({ data: { other: null }, errors }));
    expect(await new GraphQLClient(config, createMemoryStorage()).request(mutation)).toEqual({ data: { other: null }, errors });
  });
  it.each([[401, "UNAUTHENTICATED"], [403, "FORBIDDEN"], [409, "CONFLICT"], [429, "RATE_LIMITED"], [503, "SERVICE_UNAVAILABLE"], [500, "HTTP_ERROR"]])("retains HTTP %i with code %s without upstream bodies", async (status, code) => {
    fetcher.mockResolvedValue(new Response("TEST-UPSTREAM-SECRET", { status: status as number }));
    const result = await new GraphQLClient(config, createMemoryStorage()).request(mutation);
    expect(result.errors?.[0]).toMatchObject({ extensions: { code, httpStatus: status } });
    expect(JSON.stringify(result)).not.toContain("TEST-UPSTREAM-SECRET");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("normalizes network errors without leaking their raw cause or retrying", async () => {
    fetcher.mockRejectedValue(new TypeError("TEST-NETWORK-SECRET"));
    await expect(new GraphQLClient(config, createMemoryStorage()).request(mutation)).rejects.toMatchObject({ name: "GraphQLRequestError", code: "NETWORK_ERROR" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each(["not json", JSON.stringify({ errors: "malformed" }), JSON.stringify({}), JSON.stringify({ errors: [] }), ...[false, 42, [], "unexpected"].map(data => JSON.stringify({ data }))])("rejects an invalid response instead of reporting mutation success: %s", async body => {
    fetcher.mockResolvedValue(new Response(body, { status: 200 }));
    await expect(new GraphQLClient(config, createMemoryStorage()).request(mutation)).rejects.toMatchObject({ name: "GraphQLRequestError", code: "INVALID_RESPONSE" });
  });
  it.each(["getResource", "listResources", "getProjects", "verifyUser"] as const)("does not turn a denied read into an empty result: %s", async method => {
    const graphql = new GraphQLClient(config, createMemoryStorage());
    fetcher.mockResolvedValue(Response.json({ data: null, errors: [denial] }));
    const resources = new ResourceClient(config, createMemoryStorage(), graphql);
    const action = method === "verifyUser" ? new AuthClient(config, createMemoryStorage(), graphql).verifyUser("alice@example.invalid", "synthetic-key") :
      method === "getResource" ? resources.getResource("resource") : method === "listResources" ? resources.listResources() : resources.getProjects();
    await expect(action).rejects.toMatchObject({ name: "GraphQLRequestError", code: "FORBIDDEN", graphQLErrors: [denial] });
  });
  it.each(["createProcess", "rejectProposal", "updateClassifiedAs"] as const)("keeps structured denial through ResourceClient.%s", async method => {
    const graphql = new GraphQLClient(config, createMemoryStorage());
    fetcher.mockResolvedValue(Response.json({ data: null, errors: [denial] }));
    const resources = new ResourceClient(config, createMemoryStorage(), graphql);
    const action = method === "createProcess" ? resources.createProcess("Test") : method === "rejectProposal" ? resources.rejectProposal("cite", "accept", "modify") : resources.updateClassifiedAs("resource", []);
    await expect(action).rejects.toMatchObject({ name: "GraphQLRequestError", code: "FORBIDDEN", graphQLErrors: [denial] });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
