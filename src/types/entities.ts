/**
 * Domain entity types for the Interfacer client SDK.
 *
 * These are the "clean" types that consumers work with.
 * They are derived from Zenflows ValueFlows vocabulary but
 * hide the complexity of EconomicResources, EconomicEvents, etc.
 */

// ─── Enums ───────────────────────────────────────────────────────────

export enum ProjectType {
  DESIGN = "DESIGN",
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
  MACHINE = "MACHINE",
  DPP = "DPP",
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export enum ProposalStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REFUSED = "REFUSED",
}

export enum DppStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

// ─── Shared value types ──────────────────────────────────────────────

export interface Location {
  id?: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface ImageRef {
  hash: string;
  name: string;
  mimeType: string;
  /** Base64-encoded binary data (if fetched inline) */
  bin?: string;
}

export interface ModelFile {
  id?: string;
  fileName: string;
  contentType: string;
  url: string;
  size: number;
  extension: string;
  checksum?: string;
  uploadedAt?: string;
  storage: "dpp";
}

export interface License {
  scope: string; // "Hardware", "Software", "Documentation"
  licenseId: string; // SPDX identifier, e.g. "CERN-OHL-S-2.0"
}

export interface Contributor {
  id: string;
  name: string;
  image?: string;
}

export interface Declaration {
  ce?: boolean;
  rohs?: boolean;
  [key: string]: boolean | undefined;
}

// ─── Product / Service filter types ──────────────────────────────────

export interface ProductFilters {
  categories: string[];
  powerCompatibility: string[];
  replicability: string;
  recyclabilityPct?: number;
  repairability: boolean;
  powerRequirementW?: number;
  energyKwh?: number;
  co2Kg?: number;
}

export interface ServiceFilters {
  serviceType: string[];
  availability: string[];
}

// ─── Machine / Material references (used in product creation) ────────

export interface MachineRef {
  id: string;
  name: string;
}

export interface MaterialRef {
  id: string;
  name: string;
}

// ─── Main Project entity ─────────────────────────────────────────────

export interface Project {
  /** ULID of the EconomicResource in Zenflows */
  id: string;

  name: string;
  description: string;
  type: ProjectType;
  createdAt: string;

  /** External repository URL (e.g. GitHub) */
  repo?: string;

  /** SPDX license ID of the primary license */
  primaryLicense?: string;

  /** The user who created/owns the resource */
  owner: {
    id: string;
    name: string;
    image?: string;
  };

  /** Physical or remote location */
  location?: Location;
  isRemote: boolean;

  /** User-visible tags (stripped of system prefixes) */
  tags: string[];

  /** All licenses applied to the project */
  licenses: License[];

  /** Contributors to the project */
  contributors: Contributor[];

  /** Related projects (cited resources) */
  relations: Array<{ id: string; name: string }>;

  /** Compliance declarations */
  declarations: Declaration;

  /** For PRODUCT type: product filter metadata */
  productFilters?: ProductFilters;

  /** For SERVICE type: service filter metadata */
  serviceFilters?: ServiceFilters;

  /** For PRODUCT type: linked design resource */
  linkedDesign?: { id: string; name: string };

  /** For DESIGN type: products derived from this design */
  derivedProducts?: Array<{ id: string; name: string }>;

  /** Linked DPP (Digital Product Passport) resource */
  dpp?: { id: string; status: DppStatus };

  /** Images associated with the project */
  images: ImageRef[];

  /** 3D model files (DPP-uploaded) */
  models: ModelFile[];

  /** For PRODUCT type: machines used */
  machines: MachineRef[];

  /** For PRODUCT type: materials consumed */
  materials: MaterialRef[];

  /** Social counts (if fetched) */
  likes?: number;
  followers?: number;
  isLiked?: boolean;
  isFollowed?: boolean;
}

// ─── Proposal / Contribution types ───────────────────────────────────

export interface Proposal {
  id: string;
  name: string;
  note: string;
  status: ProposalStatus;
  created: string;

  /** The proposed (forked) resource */
  proposedResource: {
    id: string;
    name: string;
  };

  /** The original resource being contributed to */
  originalResource: {
    id: string;
    name: string;
    primaryAccountable: {
      id: string;
      name: string;
    };
  };

  proposer: {
    id: string;
    name: string;
  };
}

// ─── Pagination ──────────────────────────────────────────────────────

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  pageLimit: number;
}

export interface PaginatedResult<T> {
  edges: Array<{ cursor: string; node: T }>;
  pageInfo: PageInfo;
}

// ─── Auth types ──────────────────────────────────────────────────────

/** User challenge questions for key derivation. */
export interface UserChallenges {
  whereParentsMet: string;
  nameFirstPet: string;
  nameFirstTeacher: string;
  whereHomeTown: string;
  nameMotherMaid: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  isVerified: boolean;
  note?: string;
  image?: string;
  location?: Location;
  didId?: string;
}

export interface Keyring {
  eddsa: string;
  ethereum: string;
  reflow: string;
  bitcoin: string;
  ecdh: string;
  seed: string;
  eddsa_public_key: string;
  ethereum_address: string;
  reflow_public_key: string;
  bitcoin_public_key: string;
  ecdh_public_key: string;
}
