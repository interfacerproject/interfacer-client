import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceClient } from "../resources/ResourceClient";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { GraphQLRequestError } from "../graphql/errors";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";

let request: ReturnType<typeof vi.spyOn>, resources: ResourceClient;
const response = () => ({
  data: {
    acceptContribution: {
      proposal: { id: "proposal", status: "ACCEPTED" },
      citeEvent: { id: "cite" },
      acceptEvent: { id: "accept" },
      modifyEvent: { id: "modify" },
    },
  },
});
beforeEach(() => {
  const config = createConfig({ zenflowsUrl: "https://sandbox.example.invalid/api" });
  const graphql = new GraphQLClient(config, createMemoryStorage(), true);
  request = vi.spyOn(graphql, "request").mockResolvedValue(response());
  resources = new ResourceClient(config, createMemoryStorage(), graphql);
});

describe("atomic contribution acceptance", () => {
  it("makes one mutation: no process, event, satisfaction or unit requests", async () => {
    const result = await resources.acceptContribution("proposal");
    expect(result).toEqual({
      proposalId: "proposal",
      status: "ACCEPTED",
      citeEventId: "cite",
      acceptEventId: "accept",
      modifyEventId: "modify",
    });
    expect(request).toHaveBeenCalledTimes(1);
    const [document, variables] = request.mock.calls[0];
    expect(document).toContain("acceptContribution(proposalId: $proposalId)");
    expect(document).not.toMatch(/createProcess|createEconomicEvent|createSatisfaction|instanceVariables/);
    expect(variables).toEqual({ proposalId: "proposal" });
  });

  it.each(["FORBIDDEN", "UNAUTHENTICATED", "CONFLICT", "BAD_USER_INPUT"])(
    "preserves %s with its extensions and path",
    async code => {
      const errors = [{ message: "opaque", extensions: { code }, path: ["acceptContribution"] }];
      request.mockResolvedValue({ data: null, errors });
      await expect(resources.acceptContribution("proposal")).rejects.toMatchObject({
        code,
        graphQLErrors: errors,
      });
      expect(request).toHaveBeenCalledTimes(1);
    }
  );

  it("does not retry a transport failure: delivery is uncertain, the caller decides", async () => {
    request.mockRejectedValue(new TypeError("network down"));
    await expect(resources.acceptContribution("proposal")).rejects.toThrow("network down");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, null, "", "   ", 42])("rejects proposal id %j before any request", async id => {
    await expect(resources.acceptContribution(id as unknown as string)).rejects.toMatchObject({
      code: "BAD_USER_INPUT",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ["no payload", { data: { acceptContribution: null } }],
    [
      "another proposal",
      {
        data: {
          acceptContribution: {
            ...response().data.acceptContribution,
            proposal: { id: "other", status: "ACCEPTED" },
          },
        },
      },
    ],
    [
      "a missing event",
      { data: { acceptContribution: { ...response().data.acceptContribution, modifyEvent: null } } },
    ],
    [
      "not accepted",
      {
        data: {
          acceptContribution: {
            ...response().data.acceptContribution,
            proposal: { id: "proposal", status: "PENDING" },
          },
        },
      },
    ],
  ])("treats %s as an invalid response, not success", async (_name, value) => {
    request.mockResolvedValue(value);
    const error = await resources.acceptContribution("proposal").catch(e => e);
    expect(error).toBeInstanceOf(GraphQLRequestError);
    expect(error.code).toBe("INVALID_RESPONSE");
  });
});
