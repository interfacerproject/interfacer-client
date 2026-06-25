export interface CreateProjectParams {
  name: string;
  note?: string;
  tags?: string[];
  repo?: string;
  license?: string;
  images?: Array<{ name: string; hash: string; mimeType: string; extension: string; size: number }>;
  location?: { name: string; address?: string; lat?: number; lng?: number };
  metadata?: Record<string, unknown>;
}

export interface ProjectFilter {
  conformsTo?: string[];
  classifiedAs?: string[];
  primaryAccountable?: string[];
  search?: string;
}
