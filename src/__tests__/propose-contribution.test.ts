import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceClient } from "../resources/ResourceClient";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { GraphQLRequestError } from "../graphql/errors";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";

let request: ReturnType<typeof vi.spyOn>, resources: ResourceClient;
const payload = (created = true) => ({
  proposal: { id: "proposal" },
  process: { id: "process" },
  citeIntent: { id: "cite" },
  acceptIntent: { id: "accept", receiver: { id: "alice" } },
  modifyIntent: { id: "modify" },
  created,
});
beforeEach(() => {
  const config = createConfig({ zenflowsUrl: "https://sandbox.example.invalid/api" });
  const graphql = new GraphQLClient(config, createMemoryStorage(), true);
  request = vi.spyOn(graphql, "request").mockResolvedValue({ data: { proposeContribution: payload() } });
  resources = new ResourceClient(config, createMemoryStorage(), graphql);
});

describe("atomic contribution proposal", () => {
  it("makes one mutation; the server decides owner and proposer", async () => {
    const result = await resources.createContributionProposal({
      resourceForkedId: "fork",
      resourceOriginId: "origin",
      note: "my work",
    });
    expect(result).toEqual({
      proposalId: "proposal",
      processId: "process",
      citeIntentId: "cite",
      acceptIntentId: "accept",
      modifyIntentId: "modify",
      ownerId: "alice",
      created: true,
    });
    expect(request).toHaveBeenCalledTimes(1);
    const [document, variables] = request.mock.calls[0];
    expect(document).toContain("proposeContribution(");
    expect(document).not.toMatch(/createProcess|createIntent|createProposal|proposeIntent|instanceVariables/);
    expect(variables).toEqual({ fork: "fork", origin: "origin", note: "my work" });
    expect(JSON.stringify(variables)).not.toMatch(/owner|proposer/);
  });

  it("reports an existing pending proposal as created: false", async () => {
    request.mockResolvedValue({ data: { proposeContribution: payload(false) } });
    expect(
      (await resources.createContributionProposal({ resourceForkedId: "f", resourceOriginId: "o" })).created
    ).toBe(false);
  });

  it.each(["FORBIDDEN", "UNAUTHENTICATED", "BAD_USER_INPUT"])(
    "preserves %s and does not retry",
    async code => {
      const errors = [{ message: "opaque", extensions: { code }, path: ["proposeContribution"] }];
      request.mockResolvedValue({ data: null, errors });
      await expect(
        resources.createContributionProposal({ resourceForkedId: "f", resourceOriginId: "o" })
      ).rejects.toMatchObject({ code, graphQLErrors: errors });
      expect(request).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    [{ resourceForkedId: "", resourceOriginId: "o" }],
    [{ resourceForkedId: "f", resourceOriginId: " " }],
    [{ resourceForkedId: "same", resourceOriginId: "same" }],
    [{ resourceForkedId: "f", resourceOriginId: "o", note: 3 }],
  ])("rejects %j before any request", async params => {
    await expect(resources.createContributionProposal(params as never)).rejects.toMatchObject({
      code: "BAD_USER_INPUT",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ["no payload", { data: { proposeContribution: null } }],
    ["a missing intent", { data: { proposeContribution: { ...payload(), modifyIntent: null } } }],
    ["no owner", { data: { proposeContribution: { ...payload(), acceptIntent: { id: "accept" } } } }],
    ["no created flag", { data: { proposeContribution: { ...payload(), created: "yes" } } }],
  ])("treats %s as INVALID_RESPONSE", async (_n, value) => {
    request.mockResolvedValue(value);
    const error = await resources
      .createContributionProposal({ resourceForkedId: "f", resourceOriginId: "o" })
      .catch(e => e);
    expect(error).toBeInstanceOf(GraphQLRequestError);
    expect(error.code).toBe("INVALID_RESPONSE");
  });
});
