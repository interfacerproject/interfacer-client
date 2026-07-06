/**
 * Unit tests for config, storage, tagging, and entity types.
 */
import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "../config/storage";
import {
  derivedProductFilterTags,
  extractUserTagValues,
  isSystemTag,
  isUserTag,
  mergeTags,
  normalizeUserTagsForSave,
  prefixedTag,
  slugifyTagValue,
  userTag,
} from "../tagging/TaggingClient";
import {
  MANUFACTURABLE_TRUE_TAG,
  REPAIRABILITY_AVAILABLE_TAG,
} from "../tagging/constants";
import { ProjectType } from "../types/entities";

// ─── Config & Storage ──────────────────────────────────────────────

describe("KeyStorage", () => {
  it("memory storage sets and gets values", () => {
    const store = createMemoryStorage();
    store.setItem("test", "value");
    expect(store.getItem("test")).toBe("value");
  });

  it("memory storage remove works", () => {
    const store = createMemoryStorage();
    store.setItem("x", "1");
    store.removeItem("x");
    expect(store.getItem("x")).toBeNull();
  });

  it("memory storage clear works", () => {
    const store = createMemoryStorage();
    store.setItem("a", "1");
    store.setItem("b", "2");
    store.clear();
    expect(store.getItem("a")).toBeNull();
    expect(store.getItem("b")).toBeNull();
  });
});

// ─── Tagging ───────────────────────────────────────────────────────

describe("slugifyTagValue", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugifyTagValue("3D Printing")).toBe("3d-printing");
  });

  it("removes accents", () => {
    expect(slugifyTagValue("Électronique")).toBe("electronique");
  });

  it("collapses multiple dashes", () => {
    expect(slugifyTagValue("foo--bar")).toBe("foo-bar");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugifyTagValue("-hello-")).toBe("hello");
  });

  it("returns empty for empty input", () => {
    expect(slugifyTagValue("")).toBe("");
  });
});

describe("prefixedTag", () => {
  it("creates a prefixed tag", () => {
    expect(prefixedTag("machine", "CNC Mill")).toBe("machine-cnc-mill");
  });

  it("returns undefined for empty value", () => {
    expect(prefixedTag("x", "")).toBeUndefined();
  });
});

describe("userTag", () => {
  it("prepends tag- prefix", () => {
    expect(userTag("my tag")).toBe("tag-my-tag");
  });
});

describe("isUserTag / isSystemTag", () => {
  it("detects user tags", () => {
    expect(isUserTag("tag-electronics")).toBe(true);
    expect(isUserTag("category-electronics")).toBe(false);
  });

  it("detects system tags", () => {
    expect(isSystemTag("category-electronics")).toBe(true);
    expect(isSystemTag("machine-cnc")).toBe(true);
    expect(isSystemTag("powercompat-usb-c")).toBe(true);
    expect(isSystemTag("tag-hello")).toBe(false);
  });
});

describe("extractUserTagValues", () => {
  it("extracts only user tags, stripping prefix", () => {
    const tags = ["tag-3d-printing", "category-electronics", "machine-cnc", "tag-handmade"];
    expect(extractUserTagValues(tags)).toEqual(["3d-printing", "handmade"]);
  });

  it("handles legacy un-prefixed tags", () => {
    const tags = ["legacy-tag", "tag-new"];
    expect(extractUserTagValues(tags)).toEqual(["legacy-tag", "new"]);
  });

  it("returns empty for null/undefined", () => {
    expect(extractUserTagValues(null)).toEqual([]);
    expect(extractUserTagValues(undefined)).toEqual([]);
  });
});

describe("normalizeUserTagsForSave", () => {
  it("normalizes raw tags to canonical form", () => {
    expect(normalizeUserTagsForSave(["3D Printing", "  Handmade  "])).toEqual([
      "tag-3d-printing",
      "tag-handmade",
    ]);
  });

  it("drops system tags", () => {
    expect(normalizeUserTagsForSave(["category-tools", "my-tag"])).toEqual(["tag-my-tag"]);
  });

  it("deduplicates", () => {
    expect(normalizeUserTagsForSave(["a", "a", "b"])).toEqual(["tag-a", "tag-b"]);
  });
});

describe("mergeTags", () => {
  it("merges and deduplicates", () => {
    expect(mergeTags(["a", "b"], ["b", "c"], undefined)).toEqual(["a", "b", "c"]);
  });
});

describe("derivedProductFilterTags", () => {
  it("generates category tags", () => {
    const tags = derivedProductFilterTags({ categories: ["Electronics"] });
    expect(tags).toContain("category-electronics");
  });

  it("generates power compatibility tags", () => {
    const tags = derivedProductFilterTags({ powerCompatibility: ["USB-C"] });
    expect(tags).toContain("powercompat-usb-c");
  });

  it("generates replicability tags", () => {
    const tags = derivedProductFilterTags({ replicability: ["High"] });
    expect(tags).toContain("replicability-high");
  });

  it("generates repairability tag", () => {
    const tags = derivedProductFilterTags({ repairability: true });
    expect(tags).toContain(REPAIRABILITY_AVAILABLE_TAG);
  });

  it("generates recyclability range tags", () => {
    const tags = derivedProductFilterTags({ recyclabilityPct: 75 });
    expect(tags).toContain("recyclability-ge-70");
    expect(tags).toContain("recyclability-le-80");
  });

  it("generates power requirement range tags", () => {
    const tags = derivedProductFilterTags({ powerRequirementW: 120 });
    expect(tags).toContain("powerreq-ge-100");
    expect(tags).toContain("powerreq-le-150");
  });

  it("generates energy range tags", () => {
    const tags = derivedProductFilterTags({ energyKwh: 45 });
    expect(tags).toContain("env-energy-ge-30");
    expect(tags).toContain("env-energy-le-50");
  });

  it("generates CO2 range tags with decimal handling", () => {
    const tags = derivedProductFilterTags({ co2Kg: 2.5 });
    expect(tags).toContain("env-co2-ge-2p5");
  });
});

// ─── Entity Types ──────────────────────────────────────────────────

describe("ProjectType enum", () => {
  it("has all expected values", () => {
    expect(ProjectType.DESIGN).toBe("Design");
    expect(ProjectType.PRODUCT).toBe("Product");
    expect(ProjectType.SERVICE).toBe("Service");
    expect(ProjectType.MACHINE).toBe("Machine");
    expect(ProjectType.DPP).toBe("DPP");
  });
});

describe("Tag constants", () => {
  it("MANUFACTURABLE_TRUE_TAG is correct", () => {
    expect(MANUFACTURABLE_TRUE_TAG).toBe("manufacturable-true");
  });

  it("REPAIRABILITY_AVAILABLE_TAG is correct", () => {
    expect(REPAIRABILITY_AVAILABLE_TAG).toBe("repairability-available");
  });
});
