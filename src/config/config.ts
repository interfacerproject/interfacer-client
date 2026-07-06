/**
 * Configuration for the InterfacerClient.
 *
 * All service URLs are explicit — no process.env dependency.
 * Apps consuming the SDK provide URLs from their own environment.
 */
export interface InterfacerConfig {
  /** Base URL of the Zenflows GraphQL API (e.g. https://proxy.example.com/zenflows/api) */
  zenflowsUrl: string;

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
 * Create a config object with defaults.
 * All URLs are required; there are no defaults.
 */
export function createConfig(config: InterfacerConfig): InterfacerConfig {
  return config;
}
