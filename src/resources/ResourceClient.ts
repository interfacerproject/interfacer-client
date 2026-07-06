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
import * as GQL from "../graphql/operations";
import { ProjectType } from "../types/entities";

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
  note?: string;
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
    if (res.errors?.length) throw new Error(`createProcess failed: ${res.errors[0]!.message}`);
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
    if (res.errors?.length) throw new Error(`createLocation failed: ${res.errors[0]!.message}`);
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

    const res = await this.graphql.request<{
      createEconomicEvent: { economicEvent: { id: string; resourceInventoriedAs: { id: string; name: string } } };
    }>(GQL.CREATE_PROJECT, {
      name: params.name,
      note: params.note || "",
      metadata: JSON.stringify(params.metadata || {}),
      agent: this.userId,
      creationTime: new Date().toISOString(),
      location: locationId,
      tags: params.tags || [],
      resourceSpec: specId,
      oneUnit: vars.unitOne,
      images: params.images || [],
      repo: params.repo || "",
      process: processId,
      license: params.license || "",
    });

    if (res.errors?.length) throw new Error(`createProject failed: ${res.errors[0]!.message}`);
    return res.data!.createEconomicEvent.economicEvent.resourceInventoriedAs;
  }

  // ─── Create Machine ────────────────────────────────────────────────

  async createMachine(params: CreateMachineParams): Promise<{ id: string; name: string }> {
    const vars = await this.getInstanceVars();
    const machineSpecId = vars.machine?.id || this.config.specs?.machine;
    if (!machineSpecId) throw new Error("Machine spec ID not found in instance variables or config");

    const processId = await this.createProcess(`creation of machine ${params.name}`);

    const res = await this.graphql.request<{
      createEconomicEvent: { economicEvent: { resourceInventoriedAs: { id: string; name: string } } };
    }>(GQL.CREATE_MACHINE_RESOURCE, {
      agent: this.userId,
      creationTime: new Date().toISOString(),
      process: processId,
      resourceSpec: machineSpecId,
      unitOne: vars.unitOne,
      name: params.name,
      note: params.note || "",
      metadata: JSON.stringify(params.metadata || {}),
    });

    if (res.errors?.length) throw new Error(`createMachine failed: ${res.errors[0]!.message}`);
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

    if (res.errors?.length) throw new Error(`createDppResource failed: ${res.errors[0]!.message}`);
    return res.data!.createEconomicEvent.economicEvent.resourceInventoriedAs;
  }

  // ─── Queries ───────────────────────────────────────────────────────

  async getResource(id: string): Promise<unknown> {
    const res = await this.graphql.request<{ economicResource: Record<string, unknown> | null }>(
      GQL.QUERY_RESOURCE,
      { id }
    );
    return res.data?.economicResource ?? null;
  }

  async listResources(filter?: ResourceFilter, pagination?: PaginationParams): Promise<unknown> {
    const res = await this.graphql.request(GQL.FETCH_RESOURCES, {
      ...pagination,
      filter: filter || {},
    });
    return res.data || {};
  }

  async getProjects(filter?: ProposalFilter, pagination?: PaginationParams): Promise<unknown> {
    const res = await this.graphql.request(GQL.QUERY_PROJECTS, {
      ...pagination,
      filter: filter || {},
    });
    return res.data || {};
  }

  async getMachines(): Promise<unknown> {
    const vars = await this.getInstanceVars();
    const machineSpecId = vars.machine?.id || this.config.specs?.machine;
    if (!machineSpecId) throw new Error("Machine spec ID not found in instance variables or config");
    const res = await this.graphql.request(GQL.QUERY_MACHINES, {
      resourceSpecId: machineSpecId,
    });
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
    if (res.errors?.length) throw new Error(`citeResource failed: ${res.errors[0]!.message}`);
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
    if (res.errors?.length) throw new Error(`consumeResource failed: ${res.errors[0]!.message}`);
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
    if (res.errors?.length) throw new Error(`contribute failed: ${res.errors[0]!.message}`);
  }

  // ─── Metadata ──────────────────────────────────────────────────────

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
    if (res.errors?.length) throw new Error(`updateMetadata failed: ${res.errors[0]!.message}`);
  }

  async updateClassifiedAs(resourceId: string, tags: string[]): Promise<void> {
    const res = await this.graphql.request(GQL.UPDATE_RESOURCE_CLASSIFIED_AS, {
      id: resourceId,
      classifiedAs: tags,
    });
    if (res.errors?.length) throw new Error(`updateClassifiedAs failed: ${res.errors[0]!.message}`);
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
    if (res.errors?.length) throw new Error(`relocate failed: ${res.errors[0]!.message}`);
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
    if (intentsRes.errors?.length) throw new Error(`proposeContribution intents failed: ${intentsRes.errors[0]!.message}`);

    // Create proposal
    const proposalRes = await this.graphql.request<{
      createProposal: { proposal: { id: string } };
    }>(GQL.CREATE_PROPOSAL, {
      name: `Contribution to resource`,
      note: params.note,
    });
    if (proposalRes.errors?.length) throw new Error(`createProposal failed: ${proposalRes.errors[0]!.message}`);

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
    if (linkRes.errors?.length) throw new Error(`linkIntents failed: ${linkRes.errors[0]!.message}`);

    return { proposalId, citeIntentId, acceptIntentId, modifyIntentId };
  }

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
    if (eventsRes.errors?.length) throw new Error(`acceptProposal events failed: ${eventsRes.errors[0]!.message}`);

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
    if (satRes.errors?.length) throw new Error(`satisfyIntents failed: ${satRes.errors[0]!.message}`);
  }

  async rejectProposal(intentCite: string, intentAccept: string, intentModify: string): Promise<void> {
    const res = await this.graphql.request(GQL.REJECT_PROPOSAL, {
      intentCite, intentAccept, intentModify,
    });
    if (res.errors?.length) throw new Error(`rejectProposal failed: ${res.errors[0]!.message}`);
  }
}
