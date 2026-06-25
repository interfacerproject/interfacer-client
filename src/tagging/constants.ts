/**
 * Tagging constants — prefixes, thresholds, and option lists.
 *
 * Ported from interfacer-gui lib/tagging.ts
 */

// ─── Tag Prefixes ───────────────────────────────────────────────────

export const TAG_PREFIX = {
  USER: "tag",
  CATEGORY: "category",
  MACHINE: "machine",
  MATERIAL: "material",
  POWER_COMPAT: "powercompat",
  POWER_REQ: "powerreq",
  REPLICABILITY: "replicability",
  RECYCLABILITY: "recyclability",
  REPAIRABILITY: "repairability",
  ENV_ENERGY: "env-energy",
  ENV_CO2: "env-co2",
  SERVICE_TYPE: "servicetype",
  AVAILABILITY: "availability",
  LICENSE: "license",
  MANUFACTURABLE: "manufacturable",
} as const;

export type TagPrefix = (typeof TAG_PREFIX)[keyof typeof TAG_PREFIX];

// All known system prefixes (everything except USER)
export const SYSTEM_TAG_PREFIXES: ReadonlyArray<string> = [
  TAG_PREFIX.CATEGORY,
  TAG_PREFIX.MACHINE,
  TAG_PREFIX.MATERIAL,
  TAG_PREFIX.POWER_COMPAT,
  TAG_PREFIX.POWER_REQ,
  TAG_PREFIX.REPLICABILITY,
  TAG_PREFIX.RECYCLABILITY,
  TAG_PREFIX.REPAIRABILITY,
  TAG_PREFIX.ENV_ENERGY,
  TAG_PREFIX.ENV_CO2,
  TAG_PREFIX.SERVICE_TYPE,
  TAG_PREFIX.AVAILABILITY,
  TAG_PREFIX.LICENSE,
  TAG_PREFIX.MANUFACTURABLE,
];

// Legacy/stale system prefixes still appearing in historical data
export const LEGACY_SYSTEM_TAG_PATTERNS: ReadonlyArray<string> = [
  "power_compat-",
  "power_",
  "env_",
  "mat:",
  "c:",
  "pc:",
  "env:",
  "pwr:",
  "rep:",
  "m:",
];

// ─── Option Lists ────────────────────────────────────────────────────

export const PRODUCT_CATEGORY_OPTIONS = [
  "Electronics",
  "Tools",
  "Furniture",
  "Home renovation",
  "Energy",
  "Wearables",
  "Medical",
  "Sustainability",
  "Education",
] as const;

export const POWER_COMPATIBILITY_OPTIONS = [
  "120V AC",
  "220-240V AC",
  "12V DC",
  "24V DC",
  "Battery Powered",
  "USB-C",
] as const;

export const REPLICABILITY_OPTIONS = ["High", "Medium", "Low"] as const;

export const SERVICE_TYPE_OPTIONS = ["Fabrication", "Learning & Education", "Space Access"] as const;

export const AVAILABILITY_OPTIONS = [
  "Available Now",
  "Booking Required",
  "Weekdays Only",
  "Weekends Available",
] as const;

// ─── Numeric Thresholds ─────────────────────────────────────────────

export const RECYCLABILITY_THRESHOLDS_PCT = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export const POWER_REQUIREMENT_THRESHOLDS_W = [
  0, 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000,
] as const;

export const ENERGY_THRESHOLDS_KWH = [
  0, 10, 20, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000,
] as const;

export const CO2_THRESHOLDS_KG = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 5, 7.5, 10, 15, 20] as const;

// ─── Special Tag Values ─────────────────────────────────────────────

export const REPAIRABILITY_AVAILABLE_TAG = "repairability-available";
export const MANUFACTURABLE_TRUE_TAG = "manufacturable-true";
