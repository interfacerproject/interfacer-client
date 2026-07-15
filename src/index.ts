// @dyne/interfacer-client — TypeScript SDK for the Interfacer ecosystem

export { InterfacerClient } from "./client";

// Auth
export { AuthClient } from "./auth/AuthClient";
export type { UserChallenges } from "./auth/types";
export type { Keyring } from "./types/entities";

// Resources
export { ResourceClient } from "./resources/ResourceClient";
export type { CreateProjectParams, ProjectFilter } from "./resources/types";

// Files
export { FileClient } from "./files/FileClient";
export { prepFileForZenflows, prepFilesForZenflows, formatImageSrc, getResourceImage } from "./files/hashing";
export type { ZenflowsFile, GqlFile, DppAttachment, ProjectModelMetadata } from "./files/hashing";

// DPP
export { DppClient } from "./dpp/DppClient";
export type { DppDocument, DppStatus } from "./dpp/types";

// Feedback
export { FeedbackClient } from "./feedback/FeedbackClient";
export type {
  Review, ReviewSummary, Comment,
  GetReviewsParams, GetCommentsParams,
} from "./feedback/FeedbackClient";

// Messaging
export { InboxClient } from "./messaging/InboxClient";

// Wallet
export { WalletClient } from "./wallet/WalletClient";

// Social
export { SocialClient } from "./social/SocialClient";

// Tagging
export { TaggingClient } from "./tagging/TaggingClient";
export {
  slugifyTagValue, prefixedTag, userTag, isUserTag, stripUserTagPrefix,
  isSystemTag, extractUserTagValues, normalizeUserTagsForSave,
  monotonicRangeTags, rangeFilterTags, derivedProductFilterTags,
  mergeTags, removeTagsWithPrefixes,
} from "./tagging/TaggingClient";
export {
  TAG_PREFIX, SYSTEM_TAG_PREFIXES, MANUFACTURABLE_TRUE_TAG,
  REPAIRABILITY_AVAILABLE_TAG, PRODUCT_CATEGORY_OPTIONS,
  POWER_COMPATIBILITY_OPTIONS, REPLICABILITY_OPTIONS,
  SERVICE_TYPE_OPTIONS, AVAILABILITY_OPTIONS,
  RECYCLABILITY_THRESHOLDS_PCT, POWER_REQUIREMENT_THRESHOLDS_W,
  ENERGY_THRESHOLDS_KWH, CO2_THRESHOLDS_KG,
} from "./tagging/constants";

// Import
export { ImportClient } from "./import/ImportClient";

// Domain types
export type {
  Project, ProjectType, ProductFilters, ServiceFilters, License,
  Contributor, Proposal, MachineRef, MaterialRef, ImageRef, ModelFile, Location,
} from "./types/entities";

// Config
export { createConfig, deriveEndpointsFromProxy } from "./config/config";
export type { InterfacerConfig, DerivedEndpoints } from "./config/config";
export { createMemoryStorage } from "./config/storage";
export type { KeyStorage } from "./config/storage";

// GraphQL
export { GraphQLClient } from "./graphql/GraphQLClient";
export { clearInstanceVariablesCache, getInstanceVariables } from "./graphql/instance-variables";
export type { InstanceVariables } from "./graphql/instance-variables";

// Crypto
export { signGraphQLRequest, signDidRequest, signFileUpload } from "./crypto/sign";
