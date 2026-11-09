/**
 * Resource client — Project/Resource CRUD operations.
 *
 * Wraps the GraphQL operations into clean method calls.
 * Manages Process creation, location, resource creation, relations, and metadata.
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { getInstanceVariables } from "../graphql/instance-variables";
import { GraphQLClient } from "../graphql/GraphQLClient";
import { GraphQLRequestError } from "../graphql/errors";
import * as GQL from "../graphql/operations";
import { prefixedTag } from "../tagging/TaggingClient";
import { TAG_PREFIX } from "../tagging/constants";
import { ProjectType } from "../types/entities";

export interface MetadataPatchOptions {
  /** Compare with a fingerprint from economicResource.metadataHash; not a control epoch. */
  expectedMetadataHash?: string;
}
export interface MetadataPatchResult {
  id: string;
  metadata: Record<string, unknown> | null;
  metadataHash: string;
}

function isMetadataMap(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function metadataError(code: "BAD_USER_INPUT" | "INVALID_RESPONSE"): GraphQLRequestError {
  return new GraphQLRequestError([{message: code === "BAD_USER_INPUT" ? "Invalid metadata fields or precondition." : "Invalid metadata patch response.", extensions: {code}}]);
}

export interface AcceptContributionResult {
  proposalId: string;
  status: "ACCEPTED";
  citeEventId: string;
  acceptEventId: string;
  modifyEventId: string;
}
function contributionError(code: "BAD_USER_INPUT" | "INVALID_RESPONSE"): GraphQLRequestError {
  return new GraphQLRequestError([{message: code === "BAD_USER_INPUT" ? "Invalid proposal id." : "Invalid acceptContribution response.", extensions: {code}}]);
}
function eventId(value: unknown): string | undefined {
  const id = isMetadataMap(value) ? value.id : undefined;
  return typeof id === "string" && id ? id : undefined;
}

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateProjectParams {
  name: string;
  note?: string;
  tags?: string[];
  repo?: string;
  license?: string;
  images?: Array<{ name: string; hash: string; mimeType: string; extension: string; size: number }>;
  location?: { name: string; address?: string; lat?: number; lng?: number };
  /** Pre-created location ID (avoids duplicate location creation) */
  locationId?: string;
  /** Pre-created process ID (avoids duplicate process creation) */
  processId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMachineParams {
  name: string;
  /** Machine type, e.g. "3D Printer". Stored as a machine-<slug> tag + metadata. */
  type?: string;
  /** Optional location label (stored in metadata). */
  location?: string;
  /** Short description. */
  note?: string;
  /** Optional image URL (stored in metadata). */
  image?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateDppParams {
  name: string;
  note?: string;
  dppUlid: string;
}

export interface PaginationParams {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export type TraceDppNodeType = "EconomicResource" | "EconomicEvent" | "Process" | string;

/** Recursive node returned by Zenflows' traceDpp resolver. */
export interface TraceDppNode {
  type: TraceDppNodeType;
  node: {
    id?: string;
    name?: string;
    note?: string | null;
    action?: { id?: string; label?: string } | null;
    metadata?: Record<string, unknown> | null;
    [key: string]: unknown;
  };
  children?: TraceDppNode[];
}

export type ResourceFilter = Record<string, unknown>;
export type ProposalFilter = Record<string, unknown>;

// ─── Client ──────────────────────────────────────────────────────────

export class ResourceClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage,
    private graphql: GraphQLClient
  ) {}

  private get userId(): string {
    const id = this.store.getItem("authId");
    if (!id) throw new Error("Not authenticated");
    return id;
  }

  private async getInstanceVars() {
    return getInstanceVariables(this.graphql);
  }

  // ─── Helpers ───────────────────────────────────────────────────────

  private specIdForType(vars: Awaited<ReturnType<typeof getInstanceVariables>>, type: ProjectType): string {
    switch (type) {
      case ProjectType.DESIGN: return vars.projectDesign.id;
      case ProjectType.PRODUCT: return vars.projectProduct?.id || this.config.specs?.product || "";
      case ProjectType.SERVICE: return vars.projectService?.id || this.config.specs?.service || "";
      case ProjectType.MACHINE: return vars.machine?.id || this.config.specs?.machine || "";
      case ProjectType.DPP: return vars.dpp?.id || this.config.specs?.dpp || "";
    }
  }

  // ─── Process ───────────────────────────────────────────────────────

  async createProcess(name: string): Promise<string> {
    const res = await this.graphql.request<{ createProcess: { process: { id: string } } }>(
      GQL.CREATE_PROCESS,
      { name }
    );
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "createProcess failed");
    return res.data!.createProcess.process.id;
  }

  // ─── Location ──────────────────────────────────────────────────────

  async createLocation(params: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
  }): Promise<{ id: string; lat: number; long: number }> {
    const res = await this.graphql.request<{
      createSpatialThing: { spatialThing: { id: string; lat: number; long: number } };
    }>(GQL.CREATE_LOCATION, {
      name: params.name,
      addr: params.address || "",
      lat: params.lat || 0,
      lng: params.lng || 0,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "createLocation failed");
    return res.data!.createSpatialThing.spatialThing;
  }

  // ─── Create Project (Design, Product, Service) ─────────────────────

  async createProject(params: CreateProjectParams & { projectType: ProjectType }): Promise<{ id: string; name: string }> {
    const vars = await this.getInstanceVars();
    const specId = this.specIdForType(vars, params.projectType);
    if (!specId) throw new Error(`${params.projectType} spec ID not found in instance variables or config`);
    const processId = params.processId || await this.createProcess(`creation of ${params.name} by owner`);

    let locationId: string | undefined = params.locationId;
    if (!locationId && params.location) {
      const loc = await this.createLocation(params.location);
      locationId = loc.id;
    }

    const variables: Record<string, unknown> = {
      name: params.name,
      note: params.note || "",
      metadata: JSON.stringify(params.metadata || {}),
      agent: this.userId,
      creationTime: new Date().toISOString(),
      location: locationId,
      resourceSpec: specId,
      oneUnit: vars.unitOne,
      images: params.images || [],
      repo: params.repo || "",
      process: processId,
      license: params.license || "",
    };

    // Only pass tags if non-empty — empty [] causes backend errors for resourceClassifiedAs
    if (params.tags && params.tags.length > 0) {
      variables.tags = params.tags;
    }

    const res = await this.graphql.request<{
      createEconomicEvent: { economicEvent: { id: string; resourceInventoriedAs: { id: string; name: string } } };
    }>(GQL.CREATE_PROJECT, variables);

    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "createProject failed");
    return res.data!.createEconomicEvent.economicEvent.resourceInventoriedAs;
  }

  // ─── Create Machine ────────────────────────────────────────────────

  async createMachine(params: CreateMachineParams): Promise<{ id: string; name: string }> {
    const vars = await this.getInstanceVars();
    const machineSpecId = vars.machine?.id || this.config.specs?.machine;
    if (!machineSpecId) throw new Error("Machine spec ID not found in instance variables or config");

    const processId = await this.createProcess(`creation of machine ${params.name}`);

    // Merge prototype fields (type / location / image) into metadata.
    const metadata: Record<string, unknown> = {
      ...(params.type && { machineType: params.type }),
      ...(params.location && { location: params.location }),
      ...(params.image && { image: params.image }),
      ...(params.metadata || {}),
    };

    // Machine type tag enables filtering by machine.
    const tags: string[] = [...(params.tags || [])];
    if (params.type) {
      const typeTag = prefixedTag(TAG_PREFIX.MACHINE, params.type);
      if (typeTag) tags.push(typeTag);
    }

    const variables: Record<string, unknown> = {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      process: processId,
      resourceSpec: machineSpecId,
      unitOne: vars.unitOne,
      name: params.name,
      note: params.note || "",
      metadata: JSON.stringify(metadata),
    };
    if (tags.length > 0) variables.tags = tags;

    const res = await this.graphql.request<{
      createEconomicEvent: { economicEvent: { resourceInventoriedAs: { id: string; name: string } } };
    }>(GQL.CREATE_MACHINE_RESOURCE, variables);

    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "createMachine failed");
    return res.data!.createEconomicEvent.economicEvent.resourceInventoriedAs;
  }

  // ─── Create DPP Resource ───────────────────────────────────────────

  async createDppResource(params: CreateDppParams): Promise<{ id: string; name: string }> {
    const vars = await this.getInstanceVars();
    const dppSpecId = vars.dpp?.id || this.config.specs?.dpp;
    if (!dppSpecId) throw new Error("DPP spec ID not found in instance variables or config");

    const processId = await this.createProcess(`DPP creation for ${params.name}`);

    const res = await this.graphql.request<{
      createEconomicEvent: { economicEvent: { resourceInventoriedAs: { id: string; name: string } } };
    }>(GQL.CREATE_DPP_RESOURCE, {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      process: processId,
      resourceSpec: dppSpecId,
      unitOne: vars.unitOne,
      dppUlid: JSON.stringify({ dppServiceUlid: params.dppUlid }),
      name: params.name,
      note: params.note || "",
    });

    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "createDppResource failed");
    return res.data!.createEconomicEvent.economicEvent.resourceInventoriedAs;
  }

  // ─── Queries ───────────────────────────────────────────────────────

  async getResource(id: string): Promise<unknown> {
    const res = await this.graphql.request<{ economicResource: Record<string, unknown> | null }>(
      GQL.QUERY_RESOURCE,
      { id }
    );
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "getResource failed");
    return res.data?.economicResource ?? null;
  }

  async listResources(filter?: ResourceFilter, pagination?: PaginationParams): Promise<unknown> {
    const res = await this.graphql.request(GQL.FETCH_RESOURCES, {
      ...pagination,
      filter: filter || {},
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "listResources failed");
    return res.data || {};
  }

  async getProjects(filter?: ProposalFilter, pagination?: PaginationParams): Promise<unknown> {
    const res = await this.graphql.request(GQL.QUERY_PROJECTS, {
      ...pagination,
      filter: filter || {},
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "getProjects failed");
    return res.data || {};
  }

  async getMachines(): Promise<unknown> {
    const vars = await this.getInstanceVars();
    const machineSpecId = vars.machine?.id || this.config.specs?.machine;
    if (!machineSpecId) throw new Error("Machine spec ID not found in instance variables or config");
    const res = await this.graphql.request(GQL.QUERY_MACHINES, {
      resourceSpecId: machineSpecId,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "getMachines failed");
    return res.data || {};
  }

  // ─── Relations ─────────────────────────────────────────────────────

  async citeResource(resourceId: string, processId: string): Promise<void> {
    const vars = await this.getInstanceVars();
    const res = await this.graphql.request(GQL.CITE_PROJECT, {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      resource: resourceId,
      process: processId,
      unitOne: vars.unitOne,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "citeResource failed");
  }

  async consumeResource(resourceId: string, processId: string): Promise<void> {
    const vars = await this.getInstanceVars();
    const res = await this.graphql.request(GQL.CONSUME_RESOURCE, {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      resource: resourceId,
      process: processId,
      unitOne: vars.unitOne,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "consumeResource failed");
  }

  async contributeToResource(processId: string, contributionTypeSpecId: string): Promise<void> {
    const vars = await this.getInstanceVars();
    const res = await this.graphql.request(GQL.CONTRIBUTE_TO_PROJECT, {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      process: processId,
      unitOne: vars.unitOne,
      conformsTo: contributionTypeSpecId,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "contribute failed");
  }

  // ─── Metadata ──────────────────────────────────────────────────────

  /**
   * One signed metadata-only mutation: shallow field replacement under the
   * backend row lock, with optional content CAS. No processes/economic events,
   * quantity changes, preflight or retry. Arrays/nested objects replace a field;
   * null is a value, not deletion. Without CAS, overlapping fields are last-write-wins.
   * The token detects differing current content, not ABA or every historical revision.
   */
  async patchMetadata(resourceId: string, fields: Record<string, unknown>, options: MetadataPatchOptions = {}): Promise<MetadataPatchResult> {
    if (typeof resourceId !== "string" || !resourceId.trim() || !isMetadataMap(fields) || !isMetadataMap(options)) throw metadataError("BAD_USER_INPUT");
    const hasExpected = Object.prototype.hasOwnProperty.call(options, "expectedMetadataHash");
    if (hasExpected && (typeof options.expectedMetadataHash !== "string" || !/^[0-9a-f]{64}$/.test(options.expectedMetadataHash))) throw metadataError("BAD_USER_INPUT");
    let serialized: string;
    try {
      serialized = JSON.stringify(fields, (_key, value) => {
        if (value === undefined || ["function", "symbol", "bigint"].includes(typeof value) || (typeof value === "number" && !Number.isFinite(value))) throw metadataError("BAD_USER_INPUT");
        return value;
      });
      if (!isMetadataMap(JSON.parse(serialized))) throw metadataError("BAD_USER_INPUT");
    } catch {
      throw metadataError("BAD_USER_INPUT");
    }
    const result = await this.graphql.request<{patchEconomicResourceMetadata: {economicResource: MetadataPatchResult} | null}>(GQL.PATCH_RESOURCE_METADATA, {
      id: resourceId, fields: serialized, ...(hasExpected ? {expectedMetadataHash: options.expectedMetadataHash} : {}),
    });
    if (result.errors?.length) throw new GraphQLRequestError(result.errors, "patchMetadata failed");
    const resource = result.data?.patchEconomicResourceMetadata?.economicResource;
    if (!resource || resource.id !== resourceId || (resource.metadata !== null && !isMetadataMap(resource.metadata)) || typeof resource.metadataHash !== "string" || !/^[0-9a-f]{64}$/.test(resource.metadataHash)) throw metadataError("INVALID_RESPONSE");
    return resource;
  }


  /** Legacy full replacement through economic events; not an atomic field patch. */
  async updateMetadata(
    resourceId: string,
    metadata: Record<string, unknown>,
    quantity?: { hasNumericalValue: number; hasUnit: string }
  ): Promise<void> {
    const res = await this.graphql.request(GQL.UPDATE_METADATA, {
      process: await this.createProcess(`metadata update`),
      agent: this.userId,
      resource: resourceId,
      quantity: quantity || { hasNumericalValue: 1, hasUnit: (await this.getInstanceVars()).unitOne },
      now: new Date().toISOString(),
      metadata: JSON.stringify(metadata),
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "updateMetadata failed");
  }

  async updateClassifiedAs(resourceId: string, tags: string[]): Promise<void> {
    const res = await this.graphql.request(GQL.UPDATE_RESOURCE_CLASSIFIED_AS, {
      id: resourceId,
      classifiedAs: tags,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "updateClassifiedAs failed");
  }

  async relocateResource(resourceId: string, locationId: string): Promise<void> {
    const vars = await this.getInstanceVars();
    const res = await this.graphql.request(GQL.RELOCATE_PROJECT, {
      process: await this.createProcess(`relocate`),
      agent: this.userId,
      resource: resourceId,
      quantity: { hasNumericalValue: 1, hasUnit: vars.unitOne },
      now: new Date().toISOString(),
      location: locationId,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "relocate failed");
  }

  // ─── Proposals ─────────────────────────────────────────────────────

  async proposeContribution(params: {
    resourceForkedId: string;
    resourceOriginId: string;
    ownerId: string;
    note: string;
  }): Promise<{ proposalId: string; citeIntentId: string; acceptIntentId: string; modifyIntentId: string }> {
    const vars = await this.getInstanceVars();
    const processId = await this.createProcess("contribution proposal");
    const creationTime = new Date().toISOString();

    // Create intents
    const intentsRes = await this.graphql.request<{
      citeResourceForked: { intent: { id: string } };
      acceptResourceOrigin: { intent: { id: string } };
      modifyResourceOrigin: { intent: { id: string } };
    }>(GQL.PROPOSE_CONTRIBUTION, {
      process: processId,
      owner: params.ownerId,
      proposer: this.userId,
      creationTime,
      resourceForked: params.resourceForkedId,
      unitOne: vars.unitOne,
      resourceOrigin: params.resourceOriginId,
    });
    if (intentsRes.errors?.length) throw new GraphQLRequestError(intentsRes.errors, "proposeContribution intents failed");

    // Create proposal
    const proposalRes = await this.graphql.request<{
      createProposal: { proposal: { id: string } };
    }>(GQL.CREATE_PROPOSAL, {
      name: `Contribution to resource`,
      note: params.note,
    });
    if (proposalRes.errors?.length) throw new GraphQLRequestError(proposalRes.errors, "createProposal failed");

    const proposalId = proposalRes.data!.createProposal.proposal.id;
    const citeIntentId = intentsRes.data!.citeResourceForked.intent.id;
    const acceptIntentId = intentsRes.data!.acceptResourceOrigin.intent.id;
    const modifyIntentId = intentsRes.data!.modifyResourceOrigin.intent.id;

    // Link intents to proposal
    const linkRes = await this.graphql.request(GQL.LINK_CONTRIBUTION_PROPOSAL_INTENT, {
      proposal: proposalId,
      citeIntent: citeIntentId,
      acceptIntent: acceptIntentId,
      modifyIntent: modifyIntentId,
    });
    if (linkRes.errors?.length) throw new GraphQLRequestError(linkRes.errors, "linkIntents failed");

    return { proposalId, citeIntentId, acceptIntentId, modifyIntentId };
  }

  /**
   * Accept a contribution proposal with one signed mutation: the backend writes
   * the events, satisfactions and the origin's new relation in one transaction.
   * Accepting an accepted proposal returns the same events, so a caller may
   * retry after an uncertain outcome; the SDK itself never retries. A rejected
   * or half-accepted proposal fails with CONFLICT. Requires zenflows#76.
   */
  async acceptContribution(proposalId: string): Promise<AcceptContributionResult> {
    if (typeof proposalId !== "string" || !proposalId.trim()) throw contributionError("BAD_USER_INPUT");
    const result = await this.graphql.request<{acceptContribution: unknown}>(GQL.ACCEPT_CONTRIBUTION, {proposalId});
    if (result.errors?.length) throw new GraphQLRequestError(result.errors, "acceptContribution failed");
    const payload = result.data?.acceptContribution;
    const proposal = isMetadataMap(payload) && isMetadataMap(payload.proposal) ? payload.proposal : undefined;
    const citeEventId = isMetadataMap(payload) ? eventId(payload.citeEvent) : undefined;
    const acceptEventId = isMetadataMap(payload) ? eventId(payload.acceptEvent) : undefined;
    const modifyEventId = isMetadataMap(payload) ? eventId(payload.modifyEvent) : undefined;
    if (!proposal || proposal.id !== proposalId || proposal.status !== "ACCEPTED" || !citeEventId || !acceptEventId || !modifyEventId) {
      throw contributionError("INVALID_RESPONSE");
    }
    return {proposalId, status: "ACCEPTED", citeEventId, acceptEventId, modifyEventId};
  }

  /**
   * @deprecated Two non-transactional requests: a failure between them leaves
   * committed events and a retry duplicates them. Use acceptContribution.
   */
  async acceptProposal(params: {
    proposalId: string;
    citeIntentId: string;
    acceptIntentId: string;
    modifyIntentId: string;
    resourceForkedId: string;
    resourceOriginId: string;
    ownerId: string;
    proposerId: string;
    newMetadata: Record<string, unknown>;
  }): Promise<void> {
    const vars = await this.getInstanceVars();
    const processId = await this.createProcess("accept contribution");

    // Execute events
    const eventsRes = await this.graphql.request<{
      cite: { economicEvent: { id: string } };
      accept: { economicEvent: { id: string } };
      modify: { economicEvent: { id: string } };
    }>(GQL.ACCEPT_PROPOSAL, {
      process: processId,
      owner: params.ownerId,
      proposer: params.proposerId,
      unitOne: vars.unitOne,
      resourceForked: params.resourceForkedId,
      resourceOrigin: params.resourceOriginId,
      creationTime: new Date().toISOString(),
      metadata: JSON.stringify(params.newMetadata),
    });
    if (eventsRes.errors?.length) throw new GraphQLRequestError(eventsRes.errors, "acceptProposal events failed");

    // Satisfy intents
    const satRes = await this.graphql.request(GQL.SATISFY_INTENTS, {
      unitOne: vars.unitOne,
      intentCited: params.citeIntentId,
      intentAccepted: params.acceptIntentId,
      intentModify: params.modifyIntentId,
      eventCite: eventsRes.data!.cite.economicEvent.id,
      eventAccept: eventsRes.data!.accept.economicEvent.id,
      eventModify: eventsRes.data!.modify.economicEvent.id,
    });
    if (satRes.errors?.length) throw new GraphQLRequestError(satRes.errors, "satisfyIntents failed");
  }

  async getTraceDpp(id: string): Promise<TraceDppNode[]> {
    const res = await this.graphql.request<{
      economicResource: { traceDpp?: unknown } | null;
    }>(GQL.QUERY_RESOURCE_TRACE_DPP, { id });

    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "getTraceDpp failed");

    const traceDpp = res.data?.economicResource?.traceDpp;
    return Array.isArray(traceDpp) ? (traceDpp as TraceDppNode[]) : [];
  }

  async rejectProposal(intentCite: string, intentAccept: string, intentModify: string): Promise<void> {
    const res = await this.graphql.request(GQL.REJECT_PROPOSAL, {
      intentCite, intentAccept, intentModify,
    });
    if (res.errors?.length) throw new GraphQLRequestError(res.errors, "rejectProposal failed");
  }
}
