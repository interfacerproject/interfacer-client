/** DPP document types — matching the interfacer-dpp Go backend model. */

export type DppStatus = "active" | "draft" | "archived";

export interface TransformedValue<T = unknown> {
  type: string;
  value: T;
  units?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  size: number;
  checksum: string;
  uploadedAt: string;
}

export interface DppDocument {
  id: string;
  productId?: string;
  batchType?: "batch" | "unit";
  batchId?: string;
  createdBy?: string;
  status?: DppStatus;
  createdAt?: string;
  updatedAt?: string;
  productOverview?: Record<string, TransformedValue>;
  reparability?: Record<string, TransformedValue>;
  environmentalImpact?: Record<string, TransformedValue>;
  complianceAndStandards?: Record<string, TransformedValue>;
  certificates?: Record<string, TransformedValue>;
  recyclability?: Record<string, TransformedValue>;
  energyUseAndEfficiency?: Record<string, TransformedValue>;
  components?: Array<Record<string, TransformedValue>>;
  economicOperator?: Record<string, TransformedValue>;
  repairInformation?: Record<string, TransformedValue>;
  refurbishmentInformation?: Record<string, TransformedValue>;
  recyclingInformation?: Record<string, TransformedValue>;
}

export interface CreateDppResponse {
  insertedID: string;
}

export interface UpdateDppResponse {
  matchedCount: number;
  modifiedCount: number;
}

export interface DeleteDppResponse {
  deletedCount: number;
}

export interface ListDppsFilters {
  productId?: string;
  createdBy?: string;
  status?: DppStatus;
  q?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ListDppsResponse {
  dpps: DppDocument[];
  total: number;
}
