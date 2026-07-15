/**
 * Configuration for the InterfacerClient.
 *
 * The simplest way to configure is via `proxyUrl` — all service URLs
 * are derived from it using well-known path conventions:
 *
 *   zenflowsUrl       → ${proxyUrl}/zenflows/api
 *   zenflowsFileUrl   → ${proxyUrl}/zenflows/api/file
 *   dppUrl            → ${proxyUrl}/interfacer-dpp
 *   inbox.send        → ${proxyUrl}/inbox/send
 *   inbox.read        → ${proxyUrl}/inbox/read
 *   inbox.countUnread → ${proxyUrl}/inbox/count-unread
 *   inbox.setRead     → ${proxyUrl}/inbox/set-read
 *   walletUrl         → ${proxyUrl}/wallet/token
 *   social.personBase            → ${proxyUrl}/inbox/person
 *   social.economicResourceBase → ${proxyUrl}/inbox/economicresource
 *   oshUrl            → ${proxyUrl}/osh
 *
 * You can override any derived URL by passing it explicitly.
 *
 * Fields that CANNOT be derived from proxyUrl (must be provided
 * separately): loshId, zenflowsAdmin, specs, walletCycle, location.
 */
export interface InterfacerConfig {
  /**
   * Proxy base URL. When provided, all service URLs below are derived
   * automatically using well-known paths. Individual URLs can still be
   * overridden if needed.
   *
   * Example: "https://proxy.dpp-dev.ddns.dyne.org"
   */
  proxyUrl?: string;

  /** Base URL of the Zenflows GraphQL API (e.g. https://proxy.example.com/zenflows/api) */
  zenflowsUrl?: string;

  /** Base URL of the Zenflows file storage endpoint */
  zenflowsFileUrl?: string;

  /** Base URL of the DPP service (e.g. https://proxy.example.com/interfacer-dpp) */
  dppUrl?: string;

  /** Inbox messaging endpoints */
  inbox?: {
    send: string;
    read: string;
    countUnread: string;
    setRead: string;
  };

  /** Wallet token endpoint */
  walletUrl?: string;

  /** Social (ActivityPub) endpoints */
  social?: {
    personBase: string;
    economicResourceBase: string;
  };

  /** Open Source Hardware analysis endpoint */
  oshUrl?: string;

  /** Feedback service base URL (reviews & comments) */
  feedbackUrl?: string;

  /** Location services */
  location?: {
    autocomplete: string;
    lookup: string;
  };

  /** Manual ResourceSpecification IDs for instances that don't expose them via instanceVariables. */
  specs?: {
    /** DPP spec ID (for createDppResource) */
    dpp?: string;
    /** Machine spec ID (for createMachine) */
    machine?: string;
    /** Material spec ID (for material classification) */
    material?: string;
    /** Product spec ID (for createProject with Product type) */
    product?: string;
    /** Service spec ID (for createProject with Service type) */
    service?: string;
  };

  /** Zenflows admin token (needed for sign-up mutations) */
  zenflowsAdmin?: string;

  /** Default "losh" (commons) agent ULID for transfer events */
  loshId?: string;

  /** Wallet cycle configuration */
  walletCycle?: {
    startDate: string; // ISO date string
    cycleLength: number; // days
  };
}

/**
 * Endpoints derived from a proxy URL.
 * Returned by {@link deriveEndpointsFromProxy}.
 */
export interface DerivedEndpoints {
  zenflowsUrl: string;
  zenflowsFileUrl: string;
  dppUrl: string;
  inbox: {
    send: string;
    read: string;
    countUnread: string;
    setRead: string;
  };
  walletUrl: string;
  social: {
    personBase: string;
    economicResourceBase: string;
  };
  oshUrl: string;
}

/**
 * Derive all service endpoints from a proxy base URL using well-known paths.
 *
 * @example
 * const endpoints = deriveEndpointsFromProxy("https://proxy.dpp-dev.ddns.dyne.org");
 * // endpoints.zenflowsUrl === "https://proxy.dpp-dev.ddns.dyne.org/zenflows/api"
 * // endpoints.dppUrl      === "https://proxy.dpp-dev.ddns.dyne.org/interfacer-dpp"
 */
export function deriveEndpointsFromProxy(proxyUrl: string): DerivedEndpoints {
  const base = proxyUrl.replace(/\/$/, "");
  return {
    zenflowsUrl: `${base}/zenflows/api`,
    zenflowsFileUrl: `${base}/zenflows/api/file`,
    dppUrl: `${base}/interfacer-dpp`,
    inbox: {
      send: `${base}/inbox/send`,
      read: `${base}/inbox/read`,
      countUnread: `${base}/inbox/count-unread`,
      setRead: `${base}/inbox/set-read`,
    },
    walletUrl: `${base}/wallet/token`,
    social: {
      personBase: `${base}/inbox/person`,
      economicResourceBase: `${base}/inbox/economicresource`,
    },
    oshUrl: `${base}/osh`,
  };
}

/**
 * Create a resolved config object.
 *
 * If `proxyUrl` is provided, all service URLs that are not explicitly
 * set will be derived from it. Explicit values always take precedence.
 */
export function createConfig(config: InterfacerConfig): InterfacerConfig {
  if (!config.proxyUrl) return config;

  const derived = deriveEndpointsFromProxy(config.proxyUrl);

  return {
    ...config,
    zenflowsUrl: config.zenflowsUrl ?? derived.zenflowsUrl,
    zenflowsFileUrl: config.zenflowsFileUrl ?? derived.zenflowsFileUrl,
    dppUrl: config.dppUrl ?? derived.dppUrl,
    inbox: config.inbox ?? derived.inbox,
    walletUrl: config.walletUrl ?? derived.walletUrl,
    social: config.social ?? derived.social,
    oshUrl: config.oshUrl ?? derived.oshUrl,
  };
}
