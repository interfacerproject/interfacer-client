/**
 * Tagging client — classification, normalization, and filter derivation.
 *
 * All tag operations work on the `classifiedAs` array of EconomicResources.
 * The system uses prefixed tags to distinguish user-entered tags from
 * system-derived metadata tags (categories, numeric ranges, etc.).
 *
 * Ported from interfacer-gui lib/tagging.ts
 */

import {
  AVAILABILITY_OPTIONS,
  CO2_THRESHOLDS_KG,
  ENERGY_THRESHOLDS_KWH,
  LEGACY_SYSTEM_TAG_PATTERNS,
  MANUFACTURABLE_TRUE_TAG,
  POWER_COMPATIBILITY_OPTIONS,
  POWER_REQUIREMENT_THRESHOLDS_W,
  PRODUCT_CATEGORY_OPTIONS,
  RECYCLABILITY_THRESHOLDS_PCT,
  REPAIRABILITY_AVAILABLE_TAG,
  REPLICABILITY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  SYSTEM_TAG_PREFIXES,
  TAG_PREFIX,
} from "./constants";

// ─── Product / Service Filter Input Types ────────────────────────────

export interface ProductFilterMetadata {
  categories?: string[];
  powerCompatibility?: string[];
  replicability?: string[];
  recyclabilityPct?: number;
  repairability?: boolean;
  powerRequirementW?: number;
  energyKwh?: number;
  co2Kg?: number;
}

export interface ServiceFilterMetadata {
  serviceType?: string[];
  availability?: string[];
}

// ─── Slug / Tag Helpers ──────────────────────────────────────────────

export function slugifyTagValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function prefixedTag(prefix: string, value: string): string | undefined {
  const slug = slugifyTagValue(value);
  if (!slug) return undefined;
  return `${prefix}-${slug}`;
}

// ─── User Tag Helpers ────────────────────────────────────────────────

export function userTag(raw: string): string | undefined {
  const slug = slugifyTagValue(raw);
  if (!slug) return undefined;
  return `${TAG_PREFIX.USER}-${slug}`;
}

export function isUserTag(tag: string): boolean {
  return tag.startsWith(`${TAG_PREFIX.USER}-`);
}

export function stripUserTagPrefix(tag: string): string {
  return isUserTag(tag) ? tag.substring(TAG_PREFIX.USER.length + 1) : tag;
}

/**
 * Check if a tag is a system tag (has a known system prefix, current or legacy).
 */
export function isSystemTag(tag: string): boolean {
  if (isUserTag(tag)) return false;
  if (SYSTEM_TAG_PREFIXES.some(p => tag.startsWith(`${p}-`))) return true;
  if (LEGACY_SYSTEM_TAG_PATTERNS.some(p => tag.startsWith(p))) return true;
  return false;
}

/**
 * Extract user-visible tag values from a classifiedAs array.
 * System-prefixed tags are filtered out. User tags are stripped of their prefix.
 * Legacy un-prefixed tags are preserved for backwards compatibility.
 */
export function extractUserTagValues(tags: ReadonlyArray<string> | null | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!tag) continue;
    let value: string | undefined;
    if (isUserTag(tag)) {
      value = decodeURIComponent(stripUserTagPrefix(tag));
    } else if (!isSystemTag(tag)) {
      value = decodeURIComponent(tag);
    }
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

/**
 * Normalize raw user tag inputs into canonical `tag-<slug>` form.
 * System-prefixed entries are dropped.
 */
export function normalizeUserTagsForSave(tags: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    if (isSystemTag(trimmed)) continue;
    const canonical = isUserTag(trimmed) ? trimmed : userTag(trimmed);
    if (!canonical) continue;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
  }
  return out;
}

// ─── Numeric Range Tag Helpers ───────────────────────────────────────

function formatNumericTagValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  const normalized = Number.isInteger(value) ? String(value) : String(value).replace(/\./g, "p");
  return normalized.replace(/[^0-9p-]/g, "");
}

function asSortedNumericThresholds(thresholds: ReadonlyArray<number>): number[] {
  return Array.from(new Set(thresholds.filter(n => Number.isFinite(n)))).sort((a, b) => a - b);
}

export function isPrefixedTag(tag: string, prefixes: ReadonlyArray<string>): boolean {
  return prefixes.some(prefix => tag.startsWith(`${prefix}-`));
}

/**
 * Generate monotonic range tags for a numeric value.
 * Produces both "greater-or-equal" (ge-) and "less-or-equal" (le-) tags
 * for each threshold boundary.
 */
export function monotonicRangeTags(
  prefix: string,
  value: number,
  thresholds: ReadonlyArray<number>
): string[] {
  if (!Number.isFinite(value)) return [];
  const sorted = asSortedNumericThresholds(thresholds);
  const ge = sorted.filter(t => t <= value).map(t => `${prefix}-ge-${formatNumericTagValue(t)}`);
  const le = sorted.filter(t => t >= value).map(t => `${prefix}-le-${formatNumericTagValue(t)}`);
  return mergeTags(ge, le);
}

/**
 * Generate range filter tags from min/max filter values.
 */
export function rangeFilterTags(
  prefix: string,
  minValue: number | undefined,
  maxValue: number | undefined,
  thresholds: ReadonlyArray<number>
): string[] {
  const sorted = asSortedNumericThresholds(thresholds);
  const tags: string[] = [];

  if (typeof minValue === "number" && Number.isFinite(minValue)) {
    const lower = sorted.reduce<number | undefined>((acc, t) => (t <= minValue ? t : acc), undefined);
    if (typeof lower === "number") tags.push(`${prefix}-ge-${formatNumericTagValue(lower)}`);
  }

  if (typeof maxValue === "number" && Number.isFinite(maxValue)) {
    const upper = sorted.find(t => t >= maxValue);
    if (typeof upper === "number") tags.push(`${prefix}-le-${formatNumericTagValue(upper)}`);
  }

  return mergeTags(tags);
}

// ─── Derived Filter Tags ─────────────────────────────────────────────

/**
 * Derive all system tags from product filter metadata.
 */
export function derivedProductFilterTags(filters: ProductFilterMetadata): string[] {
  const categories = (filters.categories || [])
    .map(value => prefixedTag(TAG_PREFIX.CATEGORY, value))
    .filter((t): t is string => Boolean(t));

  const powerCompatibility = (filters.powerCompatibility || [])
    .map(value => prefixedTag(TAG_PREFIX.POWER_COMPAT, value))
    .filter((t): t is string => Boolean(t));

  const replicability = (filters.replicability || [])
    .map(value => prefixedTag(TAG_PREFIX.REPLICABILITY, value))
    .filter((t): t is string => Boolean(t));

  const recyclability =
    typeof filters.recyclabilityPct === "number"
      ? monotonicRangeTags(TAG_PREFIX.RECYCLABILITY, filters.recyclabilityPct, RECYCLABILITY_THRESHOLDS_PCT)
      : [];

  const repairability = filters.repairability ? [REPAIRABILITY_AVAILABLE_TAG] : [];

  const powerReq =
    typeof filters.powerRequirementW === "number"
      ? monotonicRangeTags(TAG_PREFIX.POWER_REQ, filters.powerRequirementW, POWER_REQUIREMENT_THRESHOLDS_W)
      : [];

  const energy =
    typeof filters.energyKwh === "number"
      ? monotonicRangeTags(TAG_PREFIX.ENV_ENERGY, filters.energyKwh, ENERGY_THRESHOLDS_KWH)
      : [];

  const co2 =
    typeof filters.co2Kg === "number"
      ? monotonicRangeTags(TAG_PREFIX.ENV_CO2, filters.co2Kg, CO2_THRESHOLDS_KG)
      : [];

  return mergeTags(
    categories,
    powerCompatibility,
    replicability,
    recyclability,
    repairability,
    powerReq,
    energy,
    co2
  );
}

/**
 * Derive system tags from service filter metadata.
 */
export function derivedServiceFilterTags(filters: ServiceFilterMetadata): string[] {
  const serviceType = (filters.serviceType || [])
    .map(value => prefixedTag(TAG_PREFIX.SERVICE_TYPE, value))
    .filter((t): t is string => Boolean(t));

  const availability = (filters.availability || [])
    .map(value => prefixedTag(TAG_PREFIX.AVAILABILITY, value))
    .filter((t): t is string => Boolean(t));

  return mergeTags(serviceType, availability);
}

// ─── Tag Array Operations ────────────────────────────────────────────

export function removeTagsWithPrefixes(
  tags: ReadonlyArray<string>,
  prefixes: ReadonlyArray<string>
): string[] {
  return tags.filter(tag => !isPrefixedTag(tag, prefixes));
}

export function mergeTags(...tagLists: Array<ReadonlyArray<string> | undefined>): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const list of tagLists) {
    if (!list) continue;
    for (const tag of list) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      merged.push(trimmed);
    }
  }

  return merged;
}

// ─── TaggingClient class ─────────────────────────────────────────────

export class TaggingClient {
  // User tag operations
  normalizeUserTags = normalizeUserTagsForSave;
  extractUserTagValues = extractUserTagValues;
  isSystemTag = isSystemTag;
  isUserTag = isUserTag;
  userTag = userTag;

  // Filter tag derivation
  derivedProductFilterTags = derivedProductFilterTags;
  derivedServiceFilterTags = derivedServiceFilterTags;

  // Numeric range helpers
  monotonicRangeTags = monotonicRangeTags;
  rangeFilterTags = rangeFilterTags;

  // Utilities
  slugifyTagValue = slugifyTagValue;
  prefixedTag = prefixedTag;
  mergeTags = mergeTags;
  removeTagsWithPrefixes = removeTagsWithPrefixes;

  // Constants
  readonly TAG_PREFIX = TAG_PREFIX;
  readonly SYSTEM_TAG_PREFIXES = SYSTEM_TAG_PREFIXES;
  readonly PRODUCT_CATEGORY_OPTIONS = PRODUCT_CATEGORY_OPTIONS;
  readonly POWER_COMPATIBILITY_OPTIONS = POWER_COMPATIBILITY_OPTIONS;
  readonly REPLICABILITY_OPTIONS = REPLICABILITY_OPTIONS;
  readonly SERVICE_TYPE_OPTIONS = SERVICE_TYPE_OPTIONS;
  readonly AVAILABILITY_OPTIONS = AVAILABILITY_OPTIONS;
  readonly RECYCLABILITY_THRESHOLDS_PCT = RECYCLABILITY_THRESHOLDS_PCT;
  readonly POWER_REQUIREMENT_THRESHOLDS_W = POWER_REQUIREMENT_THRESHOLDS_W;
  readonly ENERGY_THRESHOLDS_KWH = ENERGY_THRESHOLDS_KWH;
  readonly CO2_THRESHOLDS_KG = CO2_THRESHOLDS_KG;
  readonly REPAIRABILITY_AVAILABLE_TAG = REPAIRABILITY_AVAILABLE_TAG;
  readonly MANUFACTURABLE_TRUE_TAG = MANUFACTURABLE_TRUE_TAG;
}
