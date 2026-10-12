import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceClient, MetadataPatchOptions } from "../resources/ResourceClient";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { GraphQLRequestError } from "../graphql/errors";
import { createConfig } from "../config/config";
import { createMemoryStorage } from "../config/storage";

const hash = "a".repeat(64),
  fields = { relations: [], nested: null };
let request: ReturnType<typeof vi.spyOn>, resources: ResourceClient;
const response = () => ({
  data: {
    patchEconomicResourceMetadata: {
      economicResource: {
        id: "resource",
        metadata: { ...fields, opaque: { keep: true } },
        metadataHash: hash,
      },
    },
  },
});
beforeEach(() => {
  const config = createConfig({ zenflowsUrl: "https://sandbox.example.invalid/api" });
  const graphql = new GraphQLClient(config, createMemoryStorage(), true);
  request = vi.spyOn(graphql, "request").mockResolvedValue(response());
  resources = new ResourceClient(config, createMemoryStorage(), graphql);
});

describe("atomic metadata boundary", () => {
  it("makes one mutation, no processes/accept/modify/unit lookups", async () => {
    const result = await resources.patchMetadata("resource", fields);
    expect(result).toEqual(response().data.patchEconomicResourceMetadata.economicResource);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toContain("patchEconomicResourceMetadata");
    expect(request.mock.calls[0][1]).toEqual({ id: "resource", fields: JSON.stringify(fields) });
  });
  it("sends the exact optional CAS token; no preflight/reread inside the SDK", async () => {
    await resources.patchMetadata("resource", fields, { expectedMetadataHash: hash });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][1]).toEqual({
      id: "resource",
      fields: JSON.stringify(fields),
      expectedMetadataHash: hash,
    });
  });
  it.each(["FORBIDDEN", "UNAUTHENTICATED", "CONFLICT"])(
    "preserves %s, extensions/path and partial data errors",
    async code => {
      const errors = [
        {
          message: "opaque detail",
          extensions: { code, policyVersion: "test" },
          path: ["patchEconomicResourceMetadata"],
        },
      ];
      request.mockResolvedValue({ ...response(), errors });
      await expect(resources.patchMetadata("resource", fields)).rejects.toMatchObject({
        code,
        graphQLErrors: errors,
      });
      expect(request).toHaveBeenCalledTimes(1);
    }
  );
  it("never retries ambiguous transport failure", async () => {
    const error = new GraphQLRequestError([{ message: "safe", extensions: { code: "NETWORK_ERROR" } }]);
    request.mockRejectedValue(error);
    await expect(resources.patchMetadata("resource", fields)).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    undefined,
    [],
    "{}",
    1,
    { x: undefined },
    { x: NaN },
    { x: Infinity },
    { x: () => 1 },
    { x: Symbol("x") },
    { x: BigInt(1) },
  ])("rejects invalid/losing JSON input before any request: %s", async fields => {
    await expect(
      resources.patchMetadata("resource", fields as unknown as Record<string, unknown>)
    ).rejects.toMatchObject({ code: "BAD_USER_INPUT" });
    expect(request).not.toHaveBeenCalled();
  });
  it.each([{ toJSON: () => [] }, { toJSON: () => null }])(
    "rejects object serializers that change the JSON root",
    async fields => {
      await expect(resources.patchMetadata("resource", fields)).rejects.toMatchObject({
        code: "BAD_USER_INPUT",
      });
      expect(request).not.toHaveBeenCalled();
    }
  );
  it("rejects cycles before any request", async () => {
    const fields: Record<string, unknown> = {};
    fields.self = fields;
    await expect(resources.patchMetadata("resource", fields)).rejects.toMatchObject({
      code: "BAD_USER_INPUT",
    });
    expect(request).not.toHaveBeenCalled();
  });
  it.each([{ expectedMetadataHash: null }, { expectedMetadataHash: "" }, { expectedMetadataHash: 17 }])(
    "rejects accidental invalid/disabled CAS options",
    async options => {
      await expect(
        resources.patchMetadata("resource", fields, options as unknown as MetadataPatchOptions)
      ).rejects.toMatchObject({ code: "BAD_USER_INPUT" });
      expect(request).not.toHaveBeenCalled();
    }
  );
  it("rejects empty IDs", async () => {
    await expect(resources.patchMetadata("", fields)).rejects.toMatchObject({ code: "BAD_USER_INPUT" });
    expect(request).not.toHaveBeenCalled();
  });
  it.each([
    {},
    null,
    { patchEconomicResourceMetadata: null },
    {
      patchEconomicResourceMetadata: { economicResource: { id: "other", metadata: {}, metadataHash: hash } },
    },
    {
      patchEconomicResourceMetadata: {
        economicResource: { id: "resource", metadata: [], metadataHash: hash },
      },
    },
    {
      patchEconomicResourceMetadata: {
        economicResource: { id: "resource", metadata: {}, metadataHash: null },
      },
    },
  ])("malformed success remains ambiguous, never retried", async data => {
    request.mockResolvedValue({ data });
    await expect(resources.patchMetadata("resource", fields)).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
    expect(request).toHaveBeenCalledTimes(1);
  });
});
