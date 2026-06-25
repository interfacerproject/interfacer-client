export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Base64: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  JSON: { input: any; output: any; }
  JSONArray: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  URI: { input: any; output: any; }
  Url64: { input: any; output: any; }
};

/**
 * An action verb defining the kind of event, commitment, or intent.
 * It is recommended that the lowercase action verb should be used as the
 * record ID in order that references to `Action`s elsewhere in the system
 * are easily readable.
 */
export type Action = {
  id: Scalars['String']['output'];
  /** Denotes if a process input or output, or not related to a process. */
  inputOutput: Maybe<Scalars['String']['output']>;
  /** A unique verb which defines the action. */
  label: Scalars['String']['output'];
  /**
   * The onhand effect of an economic event on a resource, increment,
   * decrement, no effect, or decrement resource and increment "to"
   * resource.
   */
  onhandEffect: Scalars['String']['output'];
  /**
   * The action that should be included on the other direction of
   * the process, for example accept with modify.
   */
  pairsWith: Maybe<Scalars['String']['output']>;
  /**
   * The accounting effect of an economic event on a resource,
   * increment, decrement, no effect, or decrement resource and
   * increment "to" resource.
   */
  resourceEffect: Scalars['String']['output'];
};

/** A person or group or organization with economic agency. */
export type Agent = {
  id: Scalars['ID']['output'];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for an agent.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.  This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: Maybe<SpatialThing>;
};

export type AgentConnection = {
  edges: Array<AgentEdge>;
  pageInfo: PageInfo;
};

export type AgentEdge = {
  cursor: Scalars['ID']['output'];
  node: Agent;
};

export type AgentFilterParams = {
  name: InputMaybe<Scalars['String']['input']>;
};

/**
 * The role of an economic relationship that exists between 2 agents,
 * such as member, trading partner.
 */
export type AgentRelationship = {
  id: Scalars['ID']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object: Agent;
  /** A kind of relationship that exists between two agents. */
  relationship: AgentRelationshipRole;
  /**
   * The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject: Agent;
};

export type AgentRelationshipConnection = {
  edges: Array<AgentRelationshipEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipCreateParams = {
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`Agent`) The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object: Scalars['ID']['input'];
  /** (`AgentRelationshipRole`) A kind of relationship that exists between two agents. */
  relationship: Scalars['ID']['input'];
  /**
   * (`Agent`) The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject: Scalars['ID']['input'];
};

export type AgentRelationshipEdge = {
  cursor: Scalars['ID']['output'];
  node: AgentRelationship;
};

export type AgentRelationshipResponse = {
  agentRelationship: AgentRelationship;
};

export type AgentRelationshipRole = {
  id: Scalars['ID']['output'];
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel: Maybe<Scalars['String']['output']>;
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** The general shape or behavior grouping of an agent relationship role. */
  roleBehavior: Maybe<RoleBehavior>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: Scalars['String']['output'];
};

export type AgentRelationshipRoleConnection = {
  edges: Array<AgentRelationshipRoleEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipRoleCreateParams = {
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`RoleBehavior`) The general shape or behavior grouping of an agent relationship role. */
  roleBehavior: InputMaybe<Scalars['ID']['input']>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: Scalars['String']['input'];
};

export type AgentRelationshipRoleEdge = {
  cursor: Scalars['ID']['output'];
  node: AgentRelationshipRole;
};

export type AgentRelationshipRoleResponse = {
  agentRelationshipRole: AgentRelationshipRole;
};

export type AgentRelationshipRoleUpdateParams = {
  id: Scalars['ID']['input'];
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`RoleBehavior`) The general shape or behavior grouping of an agent relationship role. */
  roleBehavior: InputMaybe<Scalars['ID']['input']>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: InputMaybe<Scalars['String']['input']>;
};

export type AgentRelationshipUpdateParams = {
  id: Scalars['ID']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`Agent`) The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object: InputMaybe<Scalars['ID']['input']>;
  /** (`AgentRelationshipRole`) A kind of relationship that exists between two agents. */
  relationship: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`Agent`) The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject: InputMaybe<Scalars['ID']['input']>;
};

export type Agreement = {
  /** The date and time the agreement was created. */
  created: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type AgreementConnection = {
  edges: Array<AgreementEdge>;
  pageInfo: PageInfo;
};

export type AgreementCreateParams = {
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type AgreementEdge = {
  cursor: Scalars['ID']['output'];
  node: Agreement;
};

export type AgreementResponse = {
  agreement: Agreement;
};

export type AgreementUpdateParams = {
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

/** A `Duration` represents an interval between two `DateTime` values. */
export type Duration = {
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars['Decimal']['output'];
  /** A unit of measure. */
  unitType: TimeUnit;
};

/**
 * An observed economic flow, as opposed to a flow planned to happen in
 * the future.  This could reflect a change in the quantity of an economic
 * resource.  It is also defined by its behavior in relation to the economic
 * resource (see `Action`).
 */
export type EconomicEvent = {
  /**
   * Relates an economic event to a verb, such as consume, produce, work,
   * improve, etc.
   */
  action: Action;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn: Maybe<Scalars['String']['output']>;
  /** The place where an economic event occurs.  Usually mappable. */
  atLocation: Maybe<SpatialThing>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity: Maybe<Measure>;
  /** The beginning of the economic event. */
  hasBeginning: Maybe<Scalars['DateTime']['output']>;
  /** The end of the economic event. */
  hasEnd: Maybe<Scalars['DateTime']['output']>;
  /** The date/time at which the economic event occurred.  Can be used instead of beginning and end." */
  hasPointInTime: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Defines the process to which this event is an input. */
  inputOf: Maybe<Process>;
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** Defines the process to which this event is an output. */
  outputOf: Maybe<Process>;
  /** Used to implement the trace algorithm. */
  previous: Maybe<ProductionFlowItem>;
  /**
   * Used to implement the trace algorithm.  It is described in
   * the algorithms section of Valueflow's website.
   */
  previousEvent: Maybe<EconomicEvent>;
  /** The economic agent from whom the actual economic event is initiated. */
  provider: Agent;
  /** This economic event occurs as part of this agreement. */
  realizationOf: Maybe<Agreement>;
  /** The economic agent whom the actual economic event is for. */
  receiver: Agent;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: Maybe<ResourceSpecification>;
  /** Economic resource involved in the economic event. */
  resourceInventoriedAs: Maybe<EconomicResource>;
  /** Metadata of the project. */
  resourceMetadata: Maybe<Scalars['JSONObject']['output']>;
  /**
   * The amount and unit of the economic resource counted or inventoried.
   * This is the quantity that could be used to increment or decrement a
   * resource, depending on the type of resource and resource effect of action.
   */
  resourceQuantity: Maybe<Measure>;
  /** The new location of the receiver resource. */
  toLocation: Maybe<SpatialThing>;
  /**
   * Additional economic resource on the economic event when needed by the
   * receiver.  Used when a transfer or move, or sometimes other actions,
   * requires explicitly identifying an economic resource on the receiving
   * side.
   */
  toResourceInventoriedAs: Maybe<EconomicResource>;
  /** References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy: Maybe<EconomicEvent>;
};

export type EconomicEventConnection = {
  edges: Array<EconomicEventEdge>;
  pageInfo: PageInfo;
};

export type EconomicEventCreateParams = {
  /**
   * Relates an economic event to a verb, such as consume, produce, work,
   * improve, etc.
   */
  action: Scalars['String']['input'];
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn: InputMaybe<Scalars['String']['input']>;
  /** (`SpatialThing`) The place where an economic event occurs.  Usually mappable. */
  atLocation: InputMaybe<Scalars['ID']['input']>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  /** The beginning of the economic event. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The end of the economic event. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /** The date/time at which the economic event occurred.  Can be used instead of beginning and end." */
  hasPointInTime: InputMaybe<Scalars['DateTime']['input']>;
  /** (`Process`) Defines the process to which this event is an input. */
  inputOf: InputMaybe<Scalars['ID']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Process`) Defines the process to which this event is an output. */
  outputOf: InputMaybe<Scalars['ID']['input']>;
  /** (`Agent`) The economic agent from whom the actual economic event is initiated. */
  provider: InputMaybe<Scalars['ID']['input']>;
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf: InputMaybe<Scalars['ID']['input']>;
  /** (`Agent`) The economic agent whom the actual economic event is for. */
  receiver: InputMaybe<Scalars['ID']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: InputMaybe<Scalars['ID']['input']>;
  /** (`EconomicResource`) Economic resource involved in the economic event. */
  resourceInventoriedAs: InputMaybe<Scalars['ID']['input']>;
  /** Metadata of the project. */
  resourceMetadata: InputMaybe<Scalars['JSONObject']['input']>;
  /**
   * The amount and unit of the economic resource counted or inventoried.
   * This is the quantity that could be used to increment or decrement a
   * resource, depending on the type of resource and resource effect of action.
   */
  resourceQuantity: InputMaybe<IMeasure>;
  /** (`SpatialThing`) The new location of the receiver resource. */
  toLocation: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`EconomicResource`) Additional economic resource on the economic event when needed by the
   * receiver.  Used when a transfer or move, or sometimes other actions,
   * requires explicitly identifying an economic resource on the receiving
   * side.
   */
  toResourceInventoriedAs: InputMaybe<Scalars['ID']['input']>;
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy: InputMaybe<Scalars['ID']['input']>;
};

export type EconomicEventEdge = {
  cursor: Scalars['ID']['output'];
  node: EconomicEvent;
};

export type EconomicEventResponse = {
  /** Details of the newly created event. */
  economicEvent: EconomicEvent;
};

export type EconomicEventUpdateParams = {
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf: InputMaybe<Scalars['ID']['input']>;
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy: InputMaybe<Scalars['ID']['input']>;
};

/** A resource which is useful to people or the ecosystem. */
export type EconomicResource = {
  /**
   * The current amount and unit of the economic resource for which the
   * agent has primary rights and responsibilities, sometimes thought of as
   * ownership.  This can be either stored or derived from economic events
   * affecting the resource.
   */
  accountingQuantity: Measure;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  conformsTo: ResourceSpecification;
  /**
   * Used when a stock economic resource contains items also defined as
   * economic resources.
   */
  containedIn: Maybe<EconomicResource>;
  /**
   * The current place an economic resource is located.  Could be at any
   * level of granularity, from a town to an address to a warehouse location.
   * Usually mappable.
   */
  currentLocation: Maybe<SpatialThing>;
  /**
   * The agent who holds the physical custody of this resource.  It is the
   * agent that is associated with the onhandQuantity of the economic resource.
   */
  custodian: Agent;
  id: Scalars['ID']['output'];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: Maybe<Array<File>>;
  /** States the licenses under which the project is made available. */
  license: Maybe<Scalars['String']['output']>;
  /** States who is licensing the project. */
  licensor: Maybe<Scalars['String']['output']>;
  /**
   * Lot or batch of an economic resource, used to track forward or backwards
   * to all occurrences of resources of that lot.  Note more than one resource
   * can be of the same lot.
   */
  lot: Maybe<ProductBatch>;
  /** Metadata of the project. */
  metadata: Maybe<Scalars['JSONObject']['output']>;
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** The okh version of the standard of the manifest. */
  okhv: Maybe<Scalars['String']['output']>;
  /**
   * The current amount and unit of the economic resource which is under
   * direct control of the agent.  It may be more or less than the accounting
   * quantity.  This can be either stored or derived from economic events
   * affecting the resource.
   */
  onhandQuantity: Measure;
  /** Used to implement the trace algorithm. */
  previous: Maybe<Array<EconomicEvent>>;
  /**
   * The agent currently with primary rights and responsibilites for
   * the economic resource.  It is the agent that is associated with the
   * accountingQuantity of the economic resource.
   */
  primaryAccountable: Agent;
  /** A URL to the repository of the project. */
  repo: Maybe<Scalars['String']['output']>;
  /**
   * References the ProcessSpecification of the last process the desired
   * economic resource went through.  Stage is used when the last process
   * is important for finding proper resources, such as where the publishing
   * process wants only documents that have gone through the editing process.
   */
  stage: Maybe<ProcessSpecification>;
  /**
   * The state of the desired economic resource (pass or fail), after coming
   * out of a test or review process.  Can be derived from the last event if
   * a pass or fail event.
   */
  state: Maybe<Action>;
  trace: Maybe<Array<TrackTraceItem>>;
  traceDpp: Scalars['JSONArray']['output'];
  /**
   * Sometimes called serial number, used when each item must have a traceable
   * identifier (like a computer).  Could also be used for other unique
   * tracking identifiers needed for resources.
   */
  trackingIdentifier: Maybe<Scalars['String']['output']>;
  /** The unit used for use or work or cite actions for this resource. */
  unitOfEffort: Maybe<Unit>;
  /** The version of the project. */
  version: Maybe<Scalars['String']['output']>;
};

export type EconomicResourceClassificationsFilterParams = {
  notUri: InputMaybe<Scalars['URI']['input']>;
  orUri: InputMaybe<Scalars['URI']['input']>;
  uri: InputMaybe<Scalars['URI']['input']>;
};

export type EconomicResourceConnection = {
  edges: Array<EconomicResourceEdge>;
  pageInfo: EconomicResourcePageInfo;
};

export type EconomicResourceCreateParams = {
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: InputMaybe<Array<IFile>>;
  /** States the licenses under which the project is made available. */
  license: InputMaybe<Scalars['String']['input']>;
  /** States who is licensing the project. */
  licensor: InputMaybe<Scalars['String']['input']>;
  /**
   * (`ProductBatch`) Lot or batch of an economic resource, used to track forward or backwards
   * to all occurrences of resources of that lot.  Note more than one resource
   * can be of the same lot.
   */
  lot: InputMaybe<Scalars['ID']['input']>;
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** The okh version of the standard of the manifest. */
  okhv: InputMaybe<Scalars['String']['input']>;
  /** A URL to the repository of the project. */
  repo: InputMaybe<Scalars['String']['input']>;
  /**
   * Sometimes called serial number, used when each item must have a traceable
   * identifier (like a computer).  Could also be used for other unique
   * tracking identifiers needed for resources.
   */
  trackingIdentifier: InputMaybe<Scalars['String']['input']>;
  /** The version of the project. */
  version: InputMaybe<Scalars['String']['input']>;
};

export type EconomicResourceEdge = {
  cursor: Scalars['ID']['output'];
  node: EconomicResource;
};

export type EconomicResourceFilterParams = {
  classifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  conformsTo: InputMaybe<Array<Scalars['ID']['input']>>;
  custodian: InputMaybe<Array<Scalars['ID']['input']>>;
  gtOnhandQuantityHasNumericalValue: InputMaybe<Scalars['Decimal']['input']>;
  id: InputMaybe<Array<Scalars['ID']['input']>>;
  name: InputMaybe<Scalars['String']['input']>;
  /** Search radius in kilometers for geo search. */
  nearDistanceKm: InputMaybe<Scalars['Decimal']['input']>;
  /** Latitude of the center point for geo search. */
  nearLat: InputMaybe<Scalars['Decimal']['input']>;
  /** Longitude of the center point for geo search. */
  nearLong: InputMaybe<Scalars['Decimal']['input']>;
  notCustodian: InputMaybe<Array<Scalars['ID']['input']>>;
  notPrimaryAccountable: InputMaybe<Array<Scalars['ID']['input']>>;
  note: InputMaybe<Scalars['String']['input']>;
  orClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  orConformsTo: InputMaybe<Array<Scalars['ID']['input']>>;
  orCustodian: InputMaybe<Array<Scalars['ID']['input']>>;
  orGtOnhandQuantityHasNumericalValue: InputMaybe<Scalars['Decimal']['input']>;
  orId: InputMaybe<Array<Scalars['ID']['input']>>;
  orName: InputMaybe<Scalars['String']['input']>;
  orNote: InputMaybe<Scalars['String']['input']>;
  orPrimaryAccountable: InputMaybe<Array<Scalars['ID']['input']>>;
  orRepo: InputMaybe<Scalars['String']['input']>;
  primaryAccountable: InputMaybe<Array<Scalars['ID']['input']>>;
  repo: InputMaybe<Scalars['String']['input']>;
};

export type EconomicResourcePageInfo = {
  distinctPrimaryAccountableCount: Maybe<Scalars['Int']['output']>;
  endCursor: Maybe<Scalars['ID']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  pageLimit: Maybe<Scalars['Int']['output']>;
  startCursor: Maybe<Scalars['ID']['output']>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type EconomicResourceResponse = {
  economicResource: EconomicResource;
};

export type EconomicResourceSortField =
  | 'CREATED_AT'
  | 'NAME';

export type EconomicResourceSortInput = {
  direction: SortDirection;
  field: EconomicResourceSortField;
};

export type EconomicResourceUpdateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  id: Scalars['ID']['input'];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** A URL to the repository of the project. */
  repo: InputMaybe<Scalars['String']['input']>;
};

export type EmailTemplate =
  | 'INTERFACER_BETA'
  | 'INTERFACER_DEBUGGING'
  | 'INTERFACER_DEPLOYMENT'
  | 'INTERFACER_SELF'
  | 'INTERFACER_STAGING'
  | 'INTERFACER_TESTING';

export type File = {
  bin: Maybe<Scalars['Base64']['output']>;
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  extension: Scalars['String']['output'];
  hash: Scalars['Url64']['output'];
  mimeType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  signature: Maybe<Scalars['String']['output']>;
  size: Scalars['Int']['output'];
};

/** Mutation input structure for defining time durations. */
export type IDuration = {
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars['Decimal']['input'];
  /** A unit of measure. */
  unitType: TimeUnit;
};

export type IFile = {
  description: Scalars['String']['input'];
  extension: Scalars['String']['input'];
  hash: Scalars['Url64']['input'];
  mimeType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};

/**
 * Mutation input structure for defining measurements.  Should be nulled
 * if not present, rather than empty.
 */
export type IMeasure = {
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars['Decimal']['input'];
  /** (`Unit`) A unit of measure. */
  hasUnit: InputMaybe<Scalars['ID']['input']>;
};

export type InstanceSpecs = {
  specCurrency: ResourceSpecification;
  specDpp: ResourceSpecification;
  specMachine: ResourceSpecification;
  specMaterial: ResourceSpecification;
  specProjectDesign: ResourceSpecification;
  specProjectProduct: ResourceSpecification;
  specProjectService: ResourceSpecification;
};

export type InstanceUnits = {
  unitOne: Unit;
};

export type InstanceVariables = {
  specs: InstanceSpecs;
  units: InstanceUnits;
};

/**
 * A planned economic flow which has not been committed to, which can lead
 * to EconomicEvents (sometimes through Commitments).
 */
export type Intent = {
  /** Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn: Maybe<Scalars['URI']['output']>;
  /** The place where an intent would occur.  Usually mappable. */
  atLocation: Maybe<SpatialThing>;
  /** The total quantity of the offered resource available. */
  availableQuantity: Maybe<Measure>;
  /** The intent can be safely deleted, has no dependent information. */
  deletable: Scalars['Boolean']['output'];
  /** The time something is expected to be complete. */
  due: Maybe<Scalars['DateTime']['output']>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity: Maybe<Measure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: Scalars['Boolean']['output'];
  /** The planned beginning of the intent. */
  hasBeginning: Maybe<Scalars['DateTime']['output']>;
  /** The planned end of the intent. */
  hasEnd: Maybe<Scalars['DateTime']['output']>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** The image files relevant to the intent, such as a photo. */
  images: Maybe<Array<File>>;
  /** Defines the process to which this intent is an input. */
  inputOf: Maybe<Process>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name: Maybe<Scalars['String']['output']>;
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** Defines the process to which this intent is an output. */
  outputOf: Maybe<Process>;
  /**
   * The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider: Maybe<Agent>;
  publishedIn: Maybe<Array<ProposedIntent>>;
  /**
   * The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver: Maybe<Agent>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: Maybe<ResourceSpecification>;
  /**
   * When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs: Maybe<EconomicResource>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity: Maybe<Measure>;
};

export type IntentConnection = {
  edges: Array<IntentEdge>;
  pageInfo: PageInfo;
};

export type IntentCreateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars['String']['input'];
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn: InputMaybe<Scalars['URI']['input']>;
  /** (`SpatialThing`) The place where an intent would occur.  Usually mappable. */
  atLocation: InputMaybe<Scalars['ID']['input']>;
  /** The total quantity of the offered resource available. */
  availableQuantity: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: InputMaybe<Scalars['Boolean']['input']>;
  /** The planned beginning of the intent. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The planned end of the intent. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime: InputMaybe<Scalars['DateTime']['input']>;
  /** The image files relevant to the intent, such as a photo. */
  images: InputMaybe<Array<IFile>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf: InputMaybe<Scalars['ID']['input']>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`Agent`) The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`Agent`) The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver: InputMaybe<Scalars['ID']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`EconomicResource`) When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs: InputMaybe<Scalars['ID']['input']>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity: InputMaybe<IMeasure>;
};

export type IntentEdge = {
  cursor: Scalars['ID']['output'];
  node: Intent;
};

export type IntentResponse = {
  intent: Intent;
};

export type IntentUpdateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: InputMaybe<Scalars['String']['input']>;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn: InputMaybe<Scalars['URI']['input']>;
  /** (`SpatialThing`) The place where an intent would occur.  Usually mappable. */
  atLocation: InputMaybe<Scalars['ID']['input']>;
  /** The total quantity of the offered resource available. */
  availableQuantity: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: InputMaybe<Scalars['Boolean']['input']>;
  /** The planned beginning of the intent. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The planned end of the intent. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /** The image files relevant to the intent, such as a photo. */
  images: InputMaybe<Array<IFile>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf: InputMaybe<Scalars['ID']['input']>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`Agent`) The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`Agent`) The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver: InputMaybe<Scalars['ID']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: InputMaybe<Scalars['ID']['input']>;
  /**
   * (`EconomicResource`) When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs: InputMaybe<Scalars['ID']['input']>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity: InputMaybe<IMeasure>;
};

/**
 * Semantic meaning for measurements: binds a quantity to its measurement
 * unit.  See http://www.qudt.org/pages/QUDToverviewPage.html .
 */
export type Measure = {
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars['Decimal']['output'];
  /** A unit of measure. */
  hasUnit: Maybe<Unit>;
};

/** A formal or informal group, or legal organization. */
export type Organization = Agent & {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: Maybe<Array<File>>;
  /** The name that this agent will be referred to by. */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: Maybe<SpatialThing>;
};

export type OrganizationConnection = {
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
};

export type OrganizationCreateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: InputMaybe<Array<Scalars['String']['input']>>;
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: InputMaybe<Array<IFile>>;
  /** The name that this agent will be referred to by. */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: InputMaybe<Scalars['ID']['input']>;
};

export type OrganizationEdge = {
  cursor: Scalars['ID']['output'];
  node: Organization;
};

export type OrganizationFilterParams = {
  name: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationResponse = {
  agent: Organization;
};

export type OrganizationUpdateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
  /** The name that this agent will be referred to by. */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: InputMaybe<Scalars['ID']['input']>;
};

/** Cursors for pagination */
export type PageInfo = {
  /**
   * Cursor pointing to the last of the results returned, to be used
   * with `after` query parameter if the backend supports forward
   * pagination.
   */
  endCursor: Maybe<Scalars['ID']['output']>;
  /**
   * True if there are more results after `endCursor`.  If unable
   * to be determined, implementations should return `true` to allow
   * for requerying.
   */
  hasNextPage: Scalars['Boolean']['output'];
  /**
   * True if there are more results before `startCursor`.  If unable
   * to be determined, implementations should return `true` to allow
   * for requerying.
   */
  hasPreviousPage: Scalars['Boolean']['output'];
  /**
   * The number of items requested per page.  Allows the storage
   * backend to indicate this when it is responsible for setting a
   * default and the client does not provide it.  Note this may be
   * different to the number of items returned, if there is less than
   * 1 page of results.
   */
  pageLimit: Maybe<Scalars['Int']['output']>;
  /**
   * Cursor pointing to the first of the results returned, to be
   * used with `before` query parameter if the backend supports
   * reverse pagination.
   */
  startCursor: Maybe<Scalars['ID']['output']>;
  /** The total result count, if it can be determined. */
  totalCount: Maybe<Scalars['Int']['output']>;
};

/** A natural person. */
export type Person = Agent & {
  /** bitcoin public key, encoded by zenroom */
  bitcoinPublicKey: Maybe<Scalars['String']['output']>;
  /** ecdh public key, encoded by zenroom */
  ecdhPublicKey: Maybe<Scalars['String']['output']>;
  /** eddsa public key, encoded by zenroom */
  eddsaPublicKey: Maybe<Scalars['String']['output']>;
  /** Email address of the agent.  Implies uniqueness. */
  email: Scalars['String']['output'];
  /** ethereum address, encoded by zenroom */
  ethereumAddress: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: Maybe<Array<File>>;
  /** Has the user verified their email address. */
  isVerified: Scalars['Boolean']['output'];
  /** The name that this agent will be referred to by. */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: Maybe<SpatialThing>;
  /** reflow public key, encoded by zenroom */
  reflowPublicKey: Maybe<Scalars['String']['output']>;
  /** Username of the agent.  Implies uniqueness. */
  user: Scalars['String']['output'];
};

export type PersonConnection = {
  edges: Array<PersonEdge>;
  pageInfo: PageInfo;
};

export type PersonCreateParams = {
  /** bitcoin public key, encoded by zenroom */
  bitcoinPublicKey: InputMaybe<Scalars['String']['input']>;
  /** ecdh public key, encoded by zenroom */
  ecdhPublicKey: InputMaybe<Scalars['String']['input']>;
  /** eddsa public key, encoded by zenroom */
  eddsaPublicKey: InputMaybe<Scalars['String']['input']>;
  /** Email address of the agent.  Implies uniqueness. */
  email: Scalars['String']['input'];
  /** ethereum address, encoded by zenroom */
  ethereumAddress: InputMaybe<Scalars['String']['input']>;
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: InputMaybe<Array<IFile>>;
  /** The name that this agent will be referred to by. */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: InputMaybe<Scalars['ID']['input']>;
  /** reflow public key, encoded by zenroom */
  reflowPublicKey: InputMaybe<Scalars['String']['input']>;
  /** Username of the agent.  Implies uniqueness. */
  user: Scalars['String']['input'];
};

export type PersonEdge = {
  cursor: Scalars['ID']['output'];
  node: Person;
};

export type PersonFilterParams = {
  name: InputMaybe<Scalars['String']['input']>;
  user: InputMaybe<Scalars['String']['input']>;
  userOrName: InputMaybe<Scalars['String']['input']>;
};

export type PersonResponse = {
  agent: Person;
};

export type PersonUpdateParams = {
  id: Scalars['ID']['input'];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images: InputMaybe<Array<IFile>>;
  /** The name that this agent will be referred to by. */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation: InputMaybe<Scalars['ID']['input']>;
  /** Username of the agent.  Implies uniqueness. */
  user: InputMaybe<Scalars['String']['input']>;
};

/**
 * A logical collection of processes that constitute a body of planned work
 * with defined deliverable(s).
 */
export type Plan = {
  /** The time the plan was made. */
  created: Scalars['DateTime']['output'];
  /** The plan is able to be deleted or not. */
  deletable: Scalars['Boolean']['output'];
  /** The time the plan is expected to be complete. */
  due: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** This plan refines a scenario, making it operational. */
  refinementOf: Maybe<Scenario>;
};

export type PlanConnection = {
  edges: Array<PlanEdge>;
  pageInfo: PageInfo;
};

export type PlanCreateParams = {
  /** The time the plan is expected to be complete. */
  due: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf: InputMaybe<Scalars['ID']['input']>;
};

export type PlanEdge = {
  cursor: Scalars['ID']['output'];
  node: Plan;
};

export type PlanResponse = {
  plan: Plan;
};

export type PlanUpdateParams = {
  /** The time the plan is expected to be complete. */
  due: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf: InputMaybe<Scalars['ID']['input']>;
};

/**
 * A logical collection of processes that constitute a body of processned work
 * with defined deliverable(s).
 */
export type Process = {
  /** The definition or specification for a process. */
  basedOn: Maybe<ProcessSpecification>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /** The process can be safely deleted, has no dependent information. */
  deletable: Scalars['Boolean']['output'];
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: Scalars['Boolean']['output'];
  /**
   * A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn: Maybe<ProcessGroup>;
  /** The planned beginning of the process. */
  hasBeginning: Maybe<Scalars['DateTime']['output']>;
  /** The planned end of the process. */
  hasEnd: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['output'];
  /** The process with its inputs and outputs is part of the scenario. */
  nestedIn: Maybe<Scenario>;
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** The process with its inputs and outputs is part of the plan. */
  plannedWithin: Maybe<Plan>;
  previous: Maybe<Array<EconomicEvent>>;
};

export type ProcessConnection = {
  edges: Array<ProcessEdge>;
  pageInfo: PageInfo;
};

export type ProcessCreateParams = {
  /** (`ProcesssSpecification`) The definition or specification for a process. */
  basedOn: InputMaybe<Scalars['ID']['input']>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn: InputMaybe<Scalars['ID']['input']>;
  /** The planned beginning of the process. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The planned end of the process. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name: Scalars['String']['input'];
  /** (`Scenario`) The process with its inputs and outputs is part of the scenario. */
  nestedIn: InputMaybe<Scalars['ID']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin: InputMaybe<Scalars['ID']['input']>;
};

export type ProcessEdge = {
  cursor: Scalars['ID']['output'];
  node: Process;
};

/** A filesystem-like structure to hold a group of Processes. */
export type ProcessGroup = {
  /**
   * A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn: Maybe<ProcessGroup>;
  /**
   * The Processes xor ProgessGroups which this ProcessGroup groups
   * (holds/contains).
   *
   * The resolved data can only be Processes XOR ProcessGroups.
   */
  groups: Maybe<ProcessOrProcessGroupConnection>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};


/** A filesystem-like structure to hold a group of Processes. */
export type ProcessGroupGroupsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};

export type ProcessGroupConnection = {
  edges: Array<ProcessGroupEdge>;
  pageInfo: PageInfo;
};

export type ProcessGroupCreateParams = {
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn: InputMaybe<Scalars['ID']['input']>;
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ProcessGroupEdge = {
  cursor: Scalars['ID']['output'];
  node: ProcessGroup;
};

export type ProcessGroupResponse = {
  processGroup: ProcessGroup;
};

export type ProcessGroupUpdateParams = {
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ProcessOrProcessGroup = Process | ProcessGroup;

export type ProcessOrProcessGroupConnection = {
  edges: Array<ProcessOrProcessGroupEdge>;
  pageInfo: PageInfo;
};

export type ProcessOrProcessGroupEdge = {
  cursor: Scalars['ID']['output'];
  node: ProcessOrProcessGroup;
};

export type ProcessResponse = {
  process: Process;
};

/** Specifies the kind of process. */
export type ProcessSpecification = {
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type ProcessSpecificationConnection = {
  edges: Array<ProcessSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ProcessSpecificationCreateParams = {
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ProcessSpecificationEdge = {
  cursor: Scalars['ID']['output'];
  node: ProcessSpecification;
};

export type ProcessSpecificationResponse = {
  processSpecification: ProcessSpecification;
};

export type ProcessSpecificationUpdateParams = {
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ProcessUpdateParams = {
  /** (`ProcesssSpecification`) The definition or specification for a process. */
  basedOn: InputMaybe<Scalars['ID']['input']>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn: InputMaybe<Scalars['ID']['input']>;
  /** The planned beginning of the process. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The planned end of the process. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** (`Scenario`) The process with its inputs and outputs is part of the scenario. */
  nestedIn: InputMaybe<Scalars['ID']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin: InputMaybe<Scalars['ID']['input']>;
};

/**
 * A lot or batch, defining a resource produced at the same
 * time in the same way.  From DataFoodConsortium vocabulary
 * https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatch = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber: Scalars['String']['output'];
  /** A textual description or comment. */
  expiryDate: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  productionDate: Maybe<Scalars['DateTime']['output']>;
};

export type ProductBatchConnection = {
  edges: Array<ProductBatchEdge>;
  pageInfo: PageInfo;
};

export type ProductBatchCreateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber: Scalars['String']['input'];
  /** A textual description or comment. */
  expiryDate: InputMaybe<Scalars['DateTime']['input']>;
  productionDate: InputMaybe<Scalars['DateTime']['input']>;
};

export type ProductBatchEdge = {
  cursor: Scalars['ID']['output'];
  node: ProductBatch;
};

export type ProductBatchResponse = {
  productBatch: ProductBatch;
};

export type ProductBatchUpdateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  expiryDate: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  productionDate: InputMaybe<Scalars['DateTime']['input']>;
};

export type ProductionFlowItem = EconomicEvent | EconomicResource | Process;

/** Published requests or offers, sometimes with what is expected in return. */
export type Proposal = {
  /** The date and time the proposal was created. */
  created: Scalars['DateTime']['output'];
  /** The location at which this proposal is eligible. */
  eligibleLocation: Maybe<SpatialThing>;
  /** The beginning time of proposal publication. */
  hasBeginning: Maybe<Scalars['DateTime']['output']>;
  /** The end time of proposal publication. */
  hasEnd: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name: Maybe<Scalars['String']['output']>;
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  primaryIntents: Maybe<Array<Intent>>;
  publishes: Maybe<Array<ProposedIntent>>;
  reciprocalIntents: Maybe<Array<Intent>>;
  status: ProposedStatus;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased: Maybe<Scalars['Boolean']['output']>;
};

export type ProposalConnection = {
  edges: Array<ProposalEdge>;
  pageInfo: PageInfo;
};

export type ProposalCreateParams = {
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation: InputMaybe<Scalars['ID']['input']>;
  /** The beginning time of proposal publication. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The end time of proposal publication. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProposalEdge = {
  cursor: Scalars['ID']['output'];
  node: Proposal;
};

export type ProposalFilterParams = {
  notStatus: InputMaybe<ProposedStatus>;
  orPrimaryIntentsResourceInventoriedAsClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  orPrimaryIntentsResourceInventoriedAsConformsTo: InputMaybe<Array<Scalars['ID']['input']>>;
  orPrimaryIntentsResourceInventoriedAsId: InputMaybe<Array<Scalars['ID']['input']>>;
  orPrimaryIntentsResourceInventoriedAsName: InputMaybe<Scalars['String']['input']>;
  orPrimaryIntentsResourceInventoriedAsNote: InputMaybe<Scalars['String']['input']>;
  orPrimaryIntentsResourceInventoriedAsPrimaryAccountable: InputMaybe<Array<Scalars['ID']['input']>>;
  orStatus: InputMaybe<ProposedStatus>;
  primaryIntentsResourceInventoriedAsClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  primaryIntentsResourceInventoriedAsConformsTo: InputMaybe<Array<Scalars['ID']['input']>>;
  primaryIntentsResourceInventoriedAsId: InputMaybe<Array<Scalars['ID']['input']>>;
  primaryIntentsResourceInventoriedAsName: InputMaybe<Scalars['String']['input']>;
  primaryIntentsResourceInventoriedAsNote: InputMaybe<Scalars['String']['input']>;
  primaryIntentsResourceInventoriedAsPrimaryAccountable: InputMaybe<Array<Scalars['ID']['input']>>;
  status: InputMaybe<ProposedStatus>;
};

export type ProposalResponse = {
  proposal: Proposal;
};

export type ProposalUpdateParams = {
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation: InputMaybe<Scalars['ID']['input']>;
  /** The beginning time of proposal publication. */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /** The end time of proposal publication. */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Represents many-to-many relationships between Proposals and Intents,
 * supporting including intents in multiple proposals, as well as a proposal
 * including multiple intents.
 */
export type ProposedIntent = {
  id: Scalars['ID']['output'];
  /** The published proposal which this intent is part of. */
  publishedIn: Proposal;
  /** The intent which is part of this published proposal. */
  publishes: Intent;
  /**
   * This is a reciprocal intent of this proposal, not primary.  Not meant
   * to be used for intent matching.
   */
  reciprocal: Scalars['Boolean']['output'];
};

export type ProposedIntentResponse = {
  proposedIntent: ProposedIntent;
};

/** The status of the proposal: pending, accepted, or refused. */
export type ProposedStatus =
  | 'ACCEPTED'
  | 'PENDING'
  | 'REFUSED';

/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchange = {
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type RecipeExchangeConnection = {
  edges: Array<RecipeExchangeEdge>;
  pageInfo: PageInfo;
};

export type RecipeExchangeCreateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type RecipeExchangeEdge = {
  cursor: Scalars['ID']['output'];
  node: RecipeExchange;
};

export type RecipeExchangeResponse = {
  recipeExchange: RecipeExchange;
};

export type RecipeExchangeUpdateParams = {
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

/**
 * The specification of a resource inflow to, or outflow from,
 * a recipe process.
 */
export type RecipeFlow = {
  /**
   * Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action: Action;
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity: Maybe<Measure>;
  id: Scalars['ID']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf: Maybe<RecipeExchange>;
  /** The resource definition referenced by this flow in the recipe. */
  recipeFlowResource: RecipeResource;
  /** Relates an input flow to its process in a recipe. */
  recipeInputOf: Maybe<RecipeProcess>;
  /** Relates an output flow to its process in a recipe. */
  recipeOutputOf: Maybe<RecipeProcess>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: Maybe<Measure>;
};

export type RecipeFlowConnection = {
  edges: Array<RecipeFlowEdge>;
  pageInfo: PageInfo;
};

export type RecipeFlowCreateParams = {
  /**
   * (`Action`) Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action: Scalars['String']['input'];
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf: InputMaybe<Scalars['ID']['input']>;
  /** (`RecipeResource`) The resource definition referenced by this flow in the recipe. */
  recipeFlowResource: Scalars['ID']['input'];
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf: InputMaybe<Scalars['ID']['input']>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf: InputMaybe<Scalars['ID']['input']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: InputMaybe<IMeasure>;
};

export type RecipeFlowEdge = {
  cursor: Scalars['ID']['output'];
  node: RecipeFlow;
};

export type RecipeFlowResponse = {
  recipeFlow: RecipeFlow;
};

export type RecipeFlowUpdateParams = {
  /**
   * (`Action`) Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action: InputMaybe<Scalars['String']['input']>;
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  id: Scalars['ID']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf: InputMaybe<Scalars['ID']['input']>;
  /** (`RecipeResource`) The resource definition referenced by this flow in the recipe. */
  recipeFlowResource: InputMaybe<Scalars['ID']['input']>;
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf: InputMaybe<Scalars['ID']['input']>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf: InputMaybe<Scalars['ID']['input']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: InputMaybe<IMeasure>;
};

/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcess = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: Maybe<Duration>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /** The standard specification or definition of a process. */
  processConformsTo: ProcessSpecification;
};

export type RecipeProcessConnection = {
  edges: Array<RecipeProcessEdge>;
  pageInfo: PageInfo;
};

export type RecipeProcessCreateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: InputMaybe<IDuration>;
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /** (`ProcesssSpecification`) The standard specification or definition of a process. */
  processConformsTo: Scalars['ID']['input'];
};

export type RecipeProcessEdge = {
  cursor: Scalars['ID']['output'];
  node: RecipeProcess;
};

export type RecipeProcessResponse = {
  recipeProcess: RecipeProcess;
};

export type RecipeProcessUpdateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: InputMaybe<IDuration>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /** (`ProcesssSpecification`) The standard specification or definition of a process. */
  processConformsTo: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Specifies the resource as part of a recipe, for use in planning from
 * recipe.
 */
export type RecipeResource = {
  id: Scalars['ID']['output'];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: Maybe<Array<Scalars['URI']['output']>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: Maybe<ResourceSpecification>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable: Scalars['Boolean']['output'];
  /**
   * The unit used for use action on this resource or work action in the
   * recipe.
   */
  unitOfEffort: Maybe<Unit>;
  /** The unit of inventory used for this resource in the recipe. */
  unitOfResource: Maybe<Unit>;
};

export type RecipeResourceConnection = {
  edges: Array<RecipeResourceEdge>;
  pageInfo: PageInfo;
};

export type RecipeResourceCreateParams = {
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: InputMaybe<Scalars['ID']['input']>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable: InputMaybe<Scalars['Boolean']['input']>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfEffort: InputMaybe<Scalars['ID']['input']>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfResource: InputMaybe<Scalars['ID']['input']>;
};

export type RecipeResourceEdge = {
  cursor: Scalars['ID']['output'];
  node: RecipeResource;
};

export type RecipeResourceResponse = {
  recipeResource: RecipeResource;
};

export type RecipeResourceUpdateParams = {
  id: Scalars['ID']['input'];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo: InputMaybe<Scalars['ID']['input']>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable: InputMaybe<Scalars['Boolean']['input']>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfEffort: InputMaybe<Scalars['ID']['input']>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfResource: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Specification of a kind of resource.  Could define a material item,
 * service, digital item, currency account, etc.  Used instead of a
 * classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecification = {
  /** The default unit used for use or work. */
  defaultUnitOfEffort: Maybe<Unit>;
  /** The default unit used for the resource itself. */
  defaultUnitOfResource: Maybe<Unit>;
  id: Scalars['ID']['output'];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: Maybe<Array<Scalars['URI']['output']>>;
};

export type ResourceSpecificationConnection = {
  edges: Array<ResourceSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ResourceSpecificationCreateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort: InputMaybe<Scalars['ID']['input']>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource: InputMaybe<Scalars['ID']['input']>;
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
};

export type ResourceSpecificationEdge = {
  cursor: Scalars['ID']['output'];
  node: ResourceSpecification;
};

export type ResourceSpecificationResponse = {
  resourceSpecification: ResourceSpecification;
};

export type ResourceSpecificationUpdateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort: InputMaybe<Scalars['ID']['input']>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs: InputMaybe<Array<Scalars['URI']['input']>>;
};

/** The general shape or behavior grouping of an agent relationship role. */
export type RoleBehavior = {
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type RoleBehaviorConnection = {
  edges: Array<RoleBehaviorEdge>;
  pageInfo: PageInfo;
};

export type RoleBehaviorCreateParams = {
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type RoleBehaviorEdge = {
  cursor: Scalars['ID']['output'];
  node: RoleBehavior;
};

export type RoleBehaviorResponse = {
  roleBehavior: RoleBehavior;
};

export type RoleBehaviorUpdateParams = {
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type RootMutationType = {
  claimPerson: Scalars['JSON']['output'];
  createAgentRelationship: AgentRelationshipResponse;
  createAgentRelationshipRole: AgentRelationshipRoleResponse;
  createAgreement: AgreementResponse;
  createEconomicEvent: EconomicEventResponse;
  createIntent: IntentResponse;
  /**
   * Registers a new organization (group agent) with the
   * collaboration space.
   */
  createOrganization: OrganizationResponse;
  /** Registers a new (human) person with the collaboration space. */
  createPerson: PersonResponse;
  createPlan: PlanResponse;
  createProcess: ProcessResponse;
  createProcessGroup: ProcessGroupResponse;
  createProcessSpecification: ProcessSpecificationResponse;
  createProductBatch: ProductBatchResponse;
  createProposal: ProposalResponse;
  createRecipeExchange: RecipeExchangeResponse;
  createRecipeFlow: RecipeFlowResponse;
  createRecipeProcess: RecipeProcessResponse;
  createRecipeResource: RecipeResourceResponse;
  createResourceSpecification: ResourceSpecificationResponse;
  /** Creates a role behavior. */
  createRoleBehavior: RoleBehaviorResponse;
  createSatisfaction: SatisfactionResponse;
  createScenario: ScenarioResponse;
  createScenarioDefinition: ScenarioDefinitionResponse;
  createSpatialThing: SpatialThingResponse;
  createUnit: UnitResponse;
  deleteAgentRelationship: Scalars['Boolean']['output'];
  deleteAgentRelationshipRole: Scalars['Boolean']['output'];
  deleteAgreement: Scalars['Boolean']['output'];
  deleteEconomicResource: Scalars['Boolean']['output'];
  deleteIntent: Scalars['Boolean']['output'];
  /**
   * Erase record of an organization and thus remove it from
   * the collaboration space.
   */
  deleteOrganization: Scalars['Boolean']['output'];
  /**
   * Erase record of a person and thus remove them from the
   * collaboration space.
   */
  deletePerson: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deleteProcess: Scalars['Boolean']['output'];
  deleteProcessGroup: Scalars['Boolean']['output'];
  deleteProcessSpecification: Scalars['Boolean']['output'];
  deleteProductBatch: Scalars['Boolean']['output'];
  deleteProposal: Scalars['Boolean']['output'];
  deleteProposedIntent: Scalars['Boolean']['output'];
  deleteRecipeExchange: Scalars['Boolean']['output'];
  deleteRecipeFlow: Scalars['Boolean']['output'];
  deleteRecipeProcess: Scalars['Boolean']['output'];
  deleteRecipeResource: Scalars['Boolean']['output'];
  deleteResourceSpecification: Scalars['Boolean']['output'];
  /** Deletes a role behavior. */
  deleteRoleBehavior: Scalars['Boolean']['output'];
  deleteSatisfaction: Scalars['Boolean']['output'];
  deleteScenario: Scalars['Boolean']['output'];
  deleteScenarioDefinition: Scalars['Boolean']['output'];
  deleteSpatialThing: Scalars['Boolean']['output'];
  deleteUnit: Scalars['Boolean']['output'];
  /** For testing.  Temporary */
  echo: Scalars['String']['output'];
  /** Import repositories from a softwarepassport instance. */
  importRepos: Maybe<Scalars['String']['output']>;
  keypairoomServer: Scalars['String']['output'];
  /**
   * Send an email verification request to the user via email using email address if
   * available, else fails (some users are registered by admin without an email
   * address).
   */
  personRequestEmailVerification: Scalars['Boolean']['output'];
  /**
   * Verify an email verification request of the user using the token provided in
   * the verification request.
   */
  personVerifyEmailVerification: Scalars['Boolean']['output'];
  /**
   * Include an existing intent as part of a proposal.
   * @param publishedIn the (`Proposal`) to include the intent in
   * @param publishes the (`Intent`) to include as part of the proposal
   */
  proposeIntent: ProposedIntentResponse;
  updateAgentRelationship: AgentRelationshipResponse;
  updateAgentRelationshipRole: AgentRelationshipRoleResponse;
  updateAgreement: AgreementResponse;
  updateEconomicEvent: EconomicEventResponse;
  updateEconomicResource: EconomicResourceResponse;
  updateIntent: IntentResponse;
  /** Update organization profile details. */
  updateOrganization: OrganizationResponse;
  /** Update profile details. */
  updatePerson: PersonResponse;
  updatePlan: PlanResponse;
  updateProcess: ProcessResponse;
  updateProcessGroup: ProcessGroupResponse;
  updateProcessSpecification: ProcessSpecificationResponse;
  updateProductBatch: ProductBatchResponse;
  updateProposal: ProposalResponse;
  updateRecipeExchange: RecipeExchangeResponse;
  updateRecipeFlow: RecipeFlowResponse;
  updateRecipeProcess: RecipeProcessResponse;
  updateRecipeResource: RecipeResourceResponse;
  updateResourceSpecification: ResourceSpecificationResponse;
  /** Updates a role behavior. */
  updateRoleBehavior: RoleBehaviorResponse;
  updateSatisfaction: SatisfactionResponse;
  updateScenario: ScenarioResponse;
  updateScenarioDefinition: ScenarioDefinitionResponse;
  updateSpatialThing: SpatialThingResponse;
  updateUnit: UnitResponse;
};


export type RootMutationTypeClaimPersonArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeCreateAgentRelationshipArgs = {
  relationship: AgentRelationshipCreateParams;
};


export type RootMutationTypeCreateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleCreateParams;
};


export type RootMutationTypeCreateAgreementArgs = {
  agreement: AgreementCreateParams;
};


export type RootMutationTypeCreateEconomicEventArgs = {
  event: EconomicEventCreateParams;
  newInventoriedResource: InputMaybe<EconomicResourceCreateParams>;
};


export type RootMutationTypeCreateIntentArgs = {
  intent: IntentCreateParams;
};


export type RootMutationTypeCreateOrganizationArgs = {
  organization: OrganizationCreateParams;
};


export type RootMutationTypeCreatePersonArgs = {
  person: PersonCreateParams;
};


export type RootMutationTypeCreatePlanArgs = {
  plan: PlanCreateParams;
};


export type RootMutationTypeCreateProcessArgs = {
  process: ProcessCreateParams;
};


export type RootMutationTypeCreateProcessGroupArgs = {
  processGroup: ProcessGroupCreateParams;
};


export type RootMutationTypeCreateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationCreateParams;
};


export type RootMutationTypeCreateProductBatchArgs = {
  productBatch: ProductBatchCreateParams;
};


export type RootMutationTypeCreateProposalArgs = {
  proposal: ProposalCreateParams;
};


export type RootMutationTypeCreateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeCreateParams;
};


export type RootMutationTypeCreateRecipeFlowArgs = {
  recipeFlow: RecipeFlowCreateParams;
};


export type RootMutationTypeCreateRecipeProcessArgs = {
  recipeProcess: RecipeProcessCreateParams;
};


export type RootMutationTypeCreateRecipeResourceArgs = {
  recipeResource: RecipeResourceCreateParams;
};


export type RootMutationTypeCreateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationCreateParams;
};


export type RootMutationTypeCreateRoleBehaviorArgs = {
  roleBehavior: RoleBehaviorCreateParams;
};


export type RootMutationTypeCreateSatisfactionArgs = {
  satisfaction: SatisfactionCreateParams;
};


export type RootMutationTypeCreateScenarioArgs = {
  scenario: ScenarioCreateParams;
};


export type RootMutationTypeCreateScenarioDefinitionArgs = {
  scenarioDefinition: ScenarioDefinitionCreateParams;
};


export type RootMutationTypeCreateSpatialThingArgs = {
  spatialThing: SpatialThingCreateParams;
};


export type RootMutationTypeCreateUnitArgs = {
  unit: UnitCreateParams;
};


export type RootMutationTypeDeleteAgentRelationshipArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteAgentRelationshipRoleArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteEconomicResourceArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteIntentArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeletePlanArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProcessArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProcessGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProcessSpecificationArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProductBatchArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProposalArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteProposedIntentArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRecipeExchangeArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRecipeFlowArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRecipeProcessArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRecipeResourceArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteResourceSpecificationArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteRoleBehaviorArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteSatisfactionArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteScenarioArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteScenarioDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteSpatialThingArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeDeleteUnitArgs = {
  id: Scalars['ID']['input'];
};


export type RootMutationTypeEchoArgs = {
  arg: Scalars['String']['input'];
};


export type RootMutationTypeImportReposArgs = {
  url: Scalars['String']['input'];
};


export type RootMutationTypeKeypairoomServerArgs = {
  firstRegistration: Scalars['Boolean']['input'];
  userData: Scalars['JSONObject']['input'];
};


export type RootMutationTypePersonRequestEmailVerificationArgs = {
  template: EmailTemplate;
};


export type RootMutationTypePersonVerifyEmailVerificationArgs = {
  token: Scalars['String']['input'];
};


export type RootMutationTypeProposeIntentArgs = {
  publishedIn: Scalars['ID']['input'];
  publishes: Scalars['ID']['input'];
  reciprocal: InputMaybe<Scalars['Boolean']['input']>;
};


export type RootMutationTypeUpdateAgentRelationshipArgs = {
  relationship: AgentRelationshipUpdateParams;
};


export type RootMutationTypeUpdateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleUpdateParams;
};


export type RootMutationTypeUpdateAgreementArgs = {
  agreement: AgreementUpdateParams;
};


export type RootMutationTypeUpdateEconomicEventArgs = {
  event: EconomicEventUpdateParams;
};


export type RootMutationTypeUpdateEconomicResourceArgs = {
  resource: EconomicResourceUpdateParams;
};


export type RootMutationTypeUpdateIntentArgs = {
  intent: IntentUpdateParams;
};


export type RootMutationTypeUpdateOrganizationArgs = {
  organization: OrganizationUpdateParams;
};


export type RootMutationTypeUpdatePersonArgs = {
  person: PersonUpdateParams;
};


export type RootMutationTypeUpdatePlanArgs = {
  plan: PlanUpdateParams;
};


export type RootMutationTypeUpdateProcessArgs = {
  process: ProcessUpdateParams;
};


export type RootMutationTypeUpdateProcessGroupArgs = {
  processGroup: ProcessGroupUpdateParams;
};


export type RootMutationTypeUpdateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationUpdateParams;
};


export type RootMutationTypeUpdateProductBatchArgs = {
  productBatch: ProductBatchUpdateParams;
};


export type RootMutationTypeUpdateProposalArgs = {
  proposal: ProposalUpdateParams;
};


export type RootMutationTypeUpdateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeUpdateParams;
};


export type RootMutationTypeUpdateRecipeFlowArgs = {
  recipeFlow: RecipeFlowUpdateParams;
};


export type RootMutationTypeUpdateRecipeProcessArgs = {
  recipeProcess: RecipeProcessUpdateParams;
};


export type RootMutationTypeUpdateRecipeResourceArgs = {
  recipeResource: RecipeResourceUpdateParams;
};


export type RootMutationTypeUpdateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationUpdateParams;
};


export type RootMutationTypeUpdateRoleBehaviorArgs = {
  roleBehavior: RoleBehaviorUpdateParams;
};


export type RootMutationTypeUpdateSatisfactionArgs = {
  satisfaction: SatisfactionUpdateParams;
};


export type RootMutationTypeUpdateScenarioArgs = {
  scenario: ScenarioUpdateParams;
};


export type RootMutationTypeUpdateScenarioDefinitionArgs = {
  scenarioDefinition: ScenarioDefinitionUpdateParams;
};


export type RootMutationTypeUpdateSpatialThingArgs = {
  spatialThing: SpatialThingUpdateParams;
};


export type RootMutationTypeUpdateUnitArgs = {
  unit: UnitUpdateParams;
};

export type RootQueryType = {
  /** Find an agent (person or organization) by their ID. */
  agent: Maybe<Agent>;
  /** Retrieve details of an agent relationship by its ID. */
  agentRelationship: Maybe<AgentRelationship>;
  /** Retrieve details of an agent relationship role by its ID. */
  agentRelationshipRole: Maybe<AgentRelationshipRole>;
  /**
   * Retrieve possible kinds of associations that agents may have
   * with one another in this collaboration space.
   */
  agentRelationshipRoles: Maybe<AgentRelationshipRoleConnection>;
  /**
   * Retrieve details of all the relationships between all agents
   * registered in this collaboration space.
   */
  agentRelationships: Maybe<AgentRelationshipConnection>;
  /**
   * Loads all agents publicly registered within this collaboration
   * space.
   */
  agents: Maybe<AgentConnection>;
  agreement: Maybe<Agreement>;
  agreements: Maybe<AgreementConnection>;
  /** For testing.  Temporary */
  echo: Scalars['String']['output'];
  economicEvent: Maybe<EconomicEvent>;
  economicEvents: Maybe<EconomicEventConnection>;
  economicResource: Maybe<EconomicResource>;
  economicResourceClassifications: Maybe<Array<Scalars['URI']['output']>>;
  economicResources: Maybe<EconomicResourceConnection>;
  instanceVariables: InstanceVariables;
  intent: Maybe<Intent>;
  intents: IntentConnection;
  /** Loads details of the currently authenticated agent. */
  myAgent: Maybe<Agent>;
  /** List all proposals that are being listed as offers. */
  offers: ProposalConnection;
  /** Find an organization (group) agent by its ID. */
  organization: Maybe<Organization>;
  /**
   * Loads all organizations publicly registered within this
   * collaboration space.
   */
  organizations: Maybe<OrganizationConnection>;
  /**
   * Loads all people who have publicly registered with this collaboration
   * space.
   */
  people: Maybe<PersonConnection>;
  /** Find a person by their ID. */
  person: Maybe<Person>;
  /** If exists, find a person by email and eddsa-public-key. */
  personCheck: Person;
  /** Check if a person exists by email xor username. */
  personExists: Scalars['Boolean']['output'];
  /** Retrieve a Person's public key by its id. */
  personPubkey: Scalars['String']['output'];
  plan: Maybe<Plan>;
  plans: Maybe<PlanConnection>;
  process: Maybe<Process>;
  processGroup: Maybe<ProcessGroup>;
  processGroups: Maybe<ProcessGroupConnection>;
  processSpecification: Maybe<ProcessSpecification>;
  processSpecifications: ProcessSpecificationConnection;
  processes: Maybe<ProcessConnection>;
  productBatch: Maybe<ProductBatch>;
  productBatches: Maybe<ProductBatchConnection>;
  /** List all the agents associated in a project. */
  projectAgents: Maybe<Array<Maybe<Agent>>>;
  proposal: Maybe<Proposal>;
  proposals: ProposalConnection;
  recipeExchange: Maybe<RecipeExchange>;
  recipeExchanges: Maybe<RecipeExchangeConnection>;
  recipeFlow: Maybe<RecipeFlow>;
  recipeFlows: Maybe<RecipeFlowConnection>;
  recipeProcess: Maybe<RecipeProcess>;
  recipeProcesses: Maybe<RecipeProcessConnection>;
  recipeResource: Maybe<RecipeResource>;
  recipeResources: Maybe<RecipeResourceConnection>;
  /** List all proposals that are being listed as requests. */
  requests: ProposalConnection;
  resourceSpecification: Maybe<ResourceSpecification>;
  resourceSpecifications: Maybe<ResourceSpecificationConnection>;
  roleBehavior: Maybe<RoleBehavior>;
  roleBehaviors: Maybe<RoleBehaviorConnection>;
  satisfaction: Maybe<Satisfaction>;
  satisfactions: SatisfactionConnection;
  scenario: Maybe<Scenario>;
  scenarioDefinition: Maybe<ScenarioDefinition>;
  scenarioDefinitions: Maybe<ScenarioDefinitionConnection>;
  scenarios: Maybe<ScenarioConnection>;
  spatialThing: Maybe<SpatialThing>;
  spatialThings: Maybe<SpatialThingConnection>;
  unit: Maybe<Unit>;
  units: Maybe<UnitConnection>;
};


export type RootQueryTypeAgentArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeAgentRelationshipArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeAgentRelationshipRoleArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeAgentRelationshipRolesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeAgentRelationshipsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeAgentsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<AgentFilterParams>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeAgreementArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeAgreementsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeEchoArgs = {
  arg: Scalars['String']['input'];
};


export type RootQueryTypeEconomicEventArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeEconomicEventsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeEconomicResourceArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeEconomicResourceClassificationsArgs = {
  filter: InputMaybe<EconomicResourceClassificationsFilterParams>;
};


export type RootQueryTypeEconomicResourcesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<EconomicResourceFilterParams>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  orderBy: InputMaybe<EconomicResourceSortInput>;
};


export type RootQueryTypeIntentArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeIntentsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeOffersArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeOrganizationsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<OrganizationFilterParams>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypePeopleArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<PersonFilterParams>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypePersonArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypePersonCheckArgs = {
  eddsaPublicKey: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type RootQueryTypePersonExistsArgs = {
  email: InputMaybe<Scalars['String']['input']>;
  user: InputMaybe<Scalars['String']['input']>;
};


export type RootQueryTypePersonPubkeyArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypePlanArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypePlansArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeProcessArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeProcessGroupArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeProcessGroupsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeProcessSpecificationArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeProcessSpecificationsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeProcessesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeProductBatchArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeProductBatchesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeProjectAgentsArgs = {
  url: Scalars['String']['input'];
};


export type RootQueryTypeProposalArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeProposalsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<ProposalFilterParams>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRecipeExchangeArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRecipeExchangesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRecipeFlowArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRecipeFlowsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRecipeProcessArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRecipeProcessesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRecipeResourceArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRecipeResourcesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRequestsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeResourceSpecificationArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeResourceSpecificationsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeRoleBehaviorArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeRoleBehaviorsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeSatisfactionArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeSatisfactionsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeScenarioArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeScenarioDefinitionArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeScenarioDefinitionsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeScenariosArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeSpatialThingArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeSpatialThingsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};


export type RootQueryTypeUnitArgs = {
  id: Scalars['ID']['input'];
};


export type RootQueryTypeUnitsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Represents many-to-many relationships between intents and commitments
 * or events that partially or full satisfy one or more intents.
 */
export type Satisfaction = {
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity: Maybe<Measure>;
  id: Scalars['ID']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: Maybe<Measure>;
  /**
   * An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent: Maybe<EconomicEvent>;
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Intent;
};

export type SatisfactionConnection = {
  edges: Array<SatisfactionEdge>;
  pageInfo: PageInfo;
};

export type SatisfactionCreateParams = {
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: InputMaybe<IMeasure>;
  /**
   * (`EconomicEvent`) An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent: InputMaybe<Scalars['ID']['input']>;
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Scalars['ID']['input'];
};

export type SatisfactionEdge = {
  cursor: Scalars['ID']['output'];
  node: Satisfaction;
};

export type SatisfactionResponse = {
  satisfaction: Satisfaction;
};

export type SatisfactionUpdateParams = {
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity: InputMaybe<IMeasure>;
  id: Scalars['ID']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity: InputMaybe<IMeasure>;
  /**
   * (`EconomicEvent`) An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent: InputMaybe<Scalars['ID']['input']>;
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: InputMaybe<Scalars['ID']['input']>;
};

/**
 * An estimated or analytical logical collection of higher level processes
 * used for budgeting, analysis, plan refinement, etc."
 */
export type Scenario = {
  /** The scenario definition for this scenario, for example yearly budget. */
  definedAs: Maybe<ScenarioDefinition>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning: Maybe<Scalars['DateTime']['output']>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
  /**
   * This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf: Maybe<Scenario>;
};

export type ScenarioConnection = {
  edges: Array<ScenarioEdge>;
  pageInfo: PageInfo;
};

export type ScenarioCreateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs: InputMaybe<Scalars['ID']['input']>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`Scenario`) This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf: InputMaybe<Scalars['ID']['input']>;
};

/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinition = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: Maybe<Duration>;
  id: Scalars['ID']['output'];
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type ScenarioDefinitionConnection = {
  edges: Array<ScenarioDefinitionEdge>;
  pageInfo: PageInfo;
};

export type ScenarioDefinitionCreateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: InputMaybe<IDuration>;
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ScenarioDefinitionEdge = {
  cursor: Scalars['ID']['output'];
  node: ScenarioDefinition;
};

export type ScenarioDefinitionResponse = {
  scenarioDefinition: ScenarioDefinition;
};

export type ScenarioDefinitionUpdateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration: InputMaybe<IDuration>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type ScenarioEdge = {
  cursor: Scalars['ID']['output'];
  node: Scenario;
};

export type ScenarioResponse = {
  scenario: Scenario;
};

export type ScenarioUpdateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs: InputMaybe<Scalars['ID']['input']>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
  /**
   * (`Scenario`) This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf: InputMaybe<Scalars['ID']['input']>;
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

/** A physical mappable location. */
export type SpatialThing = {
  /** Altitude. */
  alt: Maybe<Scalars['Decimal']['output']>;
  id: Scalars['ID']['output'];
  /** Latitude. */
  lat: Maybe<Scalars['Decimal']['output']>;
  /** Longitude. */
  long: Maybe<Scalars['Decimal']['output']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress: Maybe<Scalars['String']['output']>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['output'];
  /** A textual description or comment. */
  note: Maybe<Scalars['String']['output']>;
};

export type SpatialThingConnection = {
  edges: Array<SpatialThingEdge>;
  pageInfo: PageInfo;
};

export type SpatialThingCreateParams = {
  /** Altitude. */
  alt: InputMaybe<Scalars['Decimal']['input']>;
  /** Latitude. */
  lat: InputMaybe<Scalars['Decimal']['input']>;
  /** Longitude. */
  long: InputMaybe<Scalars['Decimal']['input']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress: InputMaybe<Scalars['String']['input']>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name: Scalars['String']['input'];
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

export type SpatialThingEdge = {
  cursor: Scalars['ID']['output'];
  node: SpatialThing;
};

export type SpatialThingResponse = {
  spatialThing: SpatialThing;
};

export type SpatialThingUpdateParams = {
  /** Altitude. */
  alt: InputMaybe<Scalars['Decimal']['input']>;
  id: Scalars['ID']['input'];
  /** Latitude. */
  lat: InputMaybe<Scalars['Decimal']['input']>;
  /** Longitude. */
  long: InputMaybe<Scalars['Decimal']['input']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress: InputMaybe<Scalars['String']['input']>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name: InputMaybe<Scalars['String']['input']>;
  /** A textual description or comment. */
  note: InputMaybe<Scalars['String']['input']>;
};

/** Defines the unit of time measured in a temporal `Duration`. */
export type TimeUnit =
  | 'day'
  | 'hour'
  | 'minute'
  | 'month'
  | 'second'
  | 'week'
  | 'year';

export type TrackTraceItem = EconomicEvent | EconomicResource | Process;

/**
 * Defines a unit of measurement, along with its display symbol.  From OM2
 * vocabulary.
 */
export type Unit = {
  id: Scalars['ID']['output'];
  /** A human readable label for the unit, can be language specific. */
  label: Scalars['String']['output'];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars['String']['output'];
};

export type UnitConnection = {
  edges: Array<UnitEdge>;
  pageInfo: PageInfo;
};

export type UnitCreateParams = {
  /** A human readable label for the unit, can be language specific. */
  label: Scalars['String']['input'];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars['String']['input'];
};

export type UnitEdge = {
  cursor: Scalars['ID']['output'];
  node: Unit;
};

export type UnitResponse = {
  unit: Unit;
};

export type UnitUpdateParams = {
  id: Scalars['ID']['input'];
  /** A human readable label for the unit, can be language specific. */
  label: InputMaybe<Scalars['String']['input']>;
  /** A standard display symbol for a unit of measure. */
  symbol: InputMaybe<Scalars['String']['input']>;
};

export type GetInstanceVariablesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInstanceVariablesQuery = { instanceVariables: { specs: { specCurrency: { id: string, name: string }, specProjectDesign: { id: string, name: string }, specProjectProduct: { id: string, name: string }, specProjectService: { id: string, name: string } }, units: { unitOne: { id: string } } } };

export type RegisterUserMutationVariables = Exact<{
  firstRegistration: Scalars['Boolean']['input'];
  userData: Scalars['JSONObject']['input'];
}>;


export type RegisterUserMutation = { keypairoomServer: string };

export type SignUpMutationVariables = Exact<{
  name: Scalars['String']['input'];
  user: Scalars['String']['input'];
  email: Scalars['String']['input'];
  eddsaPublicKey: Scalars['String']['input'];
  reflowPublicKey: Scalars['String']['input'];
  ethereumAddress: Scalars['String']['input'];
  ecdhPublicKey: Scalars['String']['input'];
  bitcoinPublicKey: Scalars['String']['input'];
}>;


export type SignUpMutation = { createPerson: { agent: { id: string, name: string, user: string, email: string } } };

export type FetchSelfQueryVariables = Exact<{
  email: Scalars['String']['input'];
  pubkey: Scalars['String']['input'];
}>;


export type FetchSelfQuery = { personCheck: { id: string, name: string, user: string, email: string, isVerified: boolean, note: string | null, primaryLocation: { id: string, name: string, mappableAddress: string | null, lat: any | null, long: any | null } | null, images: Array<{ bin: any | null, mimeType: string }> | null } };

export type SendEmailVerificationMutationVariables = Exact<{
  template: EmailTemplate;
}>;


export type SendEmailVerificationMutation = { personRequestEmailVerification: boolean };

export type ClaimDidMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ClaimDidMutation = { claimPerson: any };

export type GetResourceTableQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetResourceTableQuery = { economicResource: { id: string, name: string, note: string | null, metadata: any | null, license: string | null, repo: string | null, classifiedAs: Array<any> | null, conformsTo: { id: string, name: string }, onhandQuantity: { hasNumericalValue: any, hasUnit: { id: string, symbol: string, label: string } | null }, accountingQuantity: { hasNumericalValue: any, hasUnit: { label: string, symbol: string } | null }, primaryAccountable: { id: string, name: string } | { id: string, name: string }, currentLocation: { id: string, name: string, mappableAddress: string | null, lat: any | null, long: any | null } | null, images: Array<{ hash: any, name: string, mimeType: string, bin: any | null }> | null } | null };

export type FetchInventoryQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['ID']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<EconomicResourceFilterParams>;
}>;


export type FetchInventoryQuery = { economicResources: { pageInfo: { startCursor: string | null, endCursor: string | null, hasPreviousPage: boolean, hasNextPage: boolean, totalCount: number | null, pageLimit: number | null }, edges: Array<{ cursor: string, node: { id: string, name: string, classifiedAs: Array<any> | null, note: string | null, metadata: any | null, okhv: string | null, repo: string | null, license: string | null, version: string | null, licensor: string | null, conformsTo: { id: string, name: string }, currentLocation: { id: string, name: string, mappableAddress: string | null, lat: any | null, long: any | null } | null, images: Array<{ hash: any, name: string, mimeType: string }> | null, primaryAccountable: { id: string, name: string, note: string | null, images: Array<{ bin: any | null, mimeType: string }> | null, primaryLocation: { name: string } | null } | { id: string, name: string, note: string | null, images: Array<{ bin: any | null, mimeType: string }> | null, primaryLocation: { name: string } | null }, custodian: { id: string, name: string, note: string | null } | { id: string, name: string, note: string | null }, accountingQuantity: { hasNumericalValue: any, hasUnit: { id: string, label: string, symbol: string } | null }, onhandQuantity: { hasNumericalValue: any, hasUnit: { id: string, label: string, symbol: string } | null } } }> } | null };

export type GetProjectsQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['ID']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  before: InputMaybe<Scalars['ID']['input']>;
  filter: InputMaybe<ProposalFilterParams>;
}>;


export type GetProjectsQuery = { proposals: { pageInfo: { startCursor: string | null, endCursor: string | null, hasPreviousPage: boolean, hasNextPage: boolean, totalCount: number | null, pageLimit: number | null }, edges: Array<{ cursor: string, node: { id: string, name: string | null, created: any, primaryIntents: Array<{ resourceClassifiedAs: Array<any> | null, hasPointInTime: any | null, hasBeginning: any | null, hasEnd: any | null, action: { id: string }, resourceInventoriedAs: { classifiedAs: Array<any> | null, name: string, id: string, note: string | null, metadata: any | null, conformsTo: { name: string }, primaryAccountable: { name: string, id: string } | { name: string, id: string }, onhandQuantity: { hasUnit: { label: string } | null }, images: Array<{ hash: any, name: string, mimeType: string, bin: any | null }> | null } | null }> | null, reciprocalIntents: Array<{ resourceQuantity: { hasNumericalValue: any, hasUnit: { label: string, symbol: string } | null } | null }> | null } }> } };

export type GetMachinesQueryVariables = Exact<{
  resourceSpecId: Scalars['ID']['input'];
}>;


export type GetMachinesQuery = { economicResources: { edges: Array<{ node: { id: string, name: string, note: string | null, metadata: any | null, conformsTo: { id: string, name: string } } }> } | null };

export type GetCitedResourcesQueryVariables = Exact<{
  processId: Scalars['ID']['input'];
}>;


export type GetCitedResourcesQuery = { economicEvents: { edges: Array<{ node: { id: string, action: { id: string, label: string }, resourceInventoriedAs: { id: string, name: string, note: string | null, metadata: any | null, conformsTo: { id: string, name: string } } | null } }> } | null };

export type QueryProjectForMetadataUpdateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QueryProjectForMetadataUpdateQuery = { economicResource: { id: string, name: string, classifiedAs: Array<any> | null, metadata: any | null, onhandQuantity: { hasNumericalValue: any, hasUnit: { id: string, symbol: string, label: string } | null }, accountingQuantity: { hasNumericalValue: any, hasUnit: { id: string, label: string, symbol: string } | null }, primaryAccountable: { id: string } | { id: string } } | null };

export type AskResourcePrimaryAccountableQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AskResourcePrimaryAccountableQuery = { economicResource: { id: string, name: string, primaryAccountable: { id: string, name: string, images: Array<{ bin: any | null, mimeType: string }> | null } | { id: string, name: string, images: Array<{ bin: any | null, mimeType: string }> | null } } | null };

export type CreateProposalMutationVariables = Exact<{
  name: Scalars['String']['input'];
  note: Scalars['String']['input'];
}>;


export type CreateProposalMutation = { createProposal: { proposal: { id: string } } };

export type CreateIntentMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  resource: Scalars['ID']['input'];
  oneUnit: Scalars['ID']['input'];
  currency: Scalars['ID']['input'];
  howMuch: Scalars['Decimal']['input'];
}>;


export type CreateIntentMutation = { item: { intent: { id: string } }, payment: { intent: { id: string } } };

export type LinkProposalAndIntentMutationVariables = Exact<{
  proposal: Scalars['ID']['input'];
  item: Scalars['ID']['input'];
  payment: Scalars['ID']['input'];
}>;


export type LinkProposalAndIntentMutation = { linkItem: { proposedIntent: { id: string } }, linkPayment: { proposedIntent: { id: string } } };

export type ProposeContributionMutationVariables = Exact<{
  process: Scalars['ID']['input'];
  owner: Scalars['ID']['input'];
  proposer: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  resourceForked: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  resourceOrigin: Scalars['ID']['input'];
}>;


export type ProposeContributionMutation = { citeResourceForked: { intent: { id: string } }, acceptResourceOrigin: { intent: { id: string } }, modifyResourceOrigin: { intent: { id: string } } };

export type LinkContributionAndProposalAndIntentMutationVariables = Exact<{
  proposal: Scalars['ID']['input'];
  citeIntent: Scalars['ID']['input'];
  acceptIntent: Scalars['ID']['input'];
  modifyIntent: Scalars['ID']['input'];
}>;


export type LinkContributionAndProposalAndIntentMutation = { proposeCite: { proposedIntent: { id: string } }, proposeAccept: { proposedIntent: { id: string } }, proposeModify: { proposedIntent: { id: string } } };

export type QueryProposalQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QueryProposalQuery = { proposal: { id: string, name: string | null, note: string | null, status: ProposedStatus, primaryIntents: Array<{ id: string, hasPointInTime: any | null, provider: { id: string, name: string } | { id: string, name: string } | null, receiver: { id: string, name: string } | { id: string, name: string } | null, inputOf: { name: string, id: string } | null, outputOf: { id: string, name: string } | null, resourceInventoriedAs: { id: string, name: string, repo: string | null, metadata: any | null, images: Array<{ hash: any, name: string, mimeType: string, bin: any | null }> | null, primaryAccountable: { id: string, name: string } | { id: string, name: string }, onhandQuantity: { hasNumericalValue: any, hasUnit: { id: string } | null } } | null, resourceConformsTo: { id: string, name: string } | null }> | null } | null };

export type ResourceProposalsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResourceProposalsQuery = { proposals: { edges: Array<{ node: { id: string, status: ProposedStatus, note: string | null, created: any, primaryIntents: Array<{ provider: { id: string, name: string, images: Array<{ bin: any | null, mimeType: string }> | null } | { id: string, name: string, images: Array<{ bin: any | null, mimeType: string }> | null } | null }> | null } }> } };

export type AcceptProposalMutationVariables = Exact<{
  process: Scalars['ID']['input'];
  owner: Scalars['ID']['input'];
  proposer: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  resourceForked: Scalars['ID']['input'];
  resourceOrigin: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  metadata: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type AcceptProposalMutation = { cite: { economicEvent: { id: string } }, accept: { economicEvent: { id: string } }, modify: { economicEvent: { id: string } } };

export type SatisfyIntentsMutationVariables = Exact<{
  unitOne: Scalars['ID']['input'];
  intentCited: Scalars['ID']['input'];
  intentAccepted: Scalars['ID']['input'];
  intentModify: Scalars['ID']['input'];
  eventCite: Scalars['ID']['input'];
  eventAccept: Scalars['ID']['input'];
  eventModify: Scalars['ID']['input'];
}>;


export type SatisfyIntentsMutation = { cite: { satisfaction: { id: string } }, accept: { satisfaction: { id: string } }, modify: { satisfaction: { id: string } } };

export type RejectProposalMutationVariables = Exact<{
  intentCite: Scalars['ID']['input'];
  intentAccept: Scalars['ID']['input'];
  intentModify: Scalars['ID']['input'];
}>;


export type RejectProposalMutation = { cite: { intent: { id: string } }, accept: { intent: { id: string } }, modify: { intent: { id: string } } };

export type CreateProjectMutationVariables = Exact<{
  name: Scalars['String']['input'];
  note: Scalars['String']['input'];
  metadata: InputMaybe<Scalars['JSONObject']['input']>;
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  location: InputMaybe<Scalars['ID']['input']>;
  tags: InputMaybe<Array<Scalars['URI']['input']> | Scalars['URI']['input']>;
  resourceSpec: Scalars['ID']['input'];
  oneUnit: Scalars['ID']['input'];
  images: InputMaybe<Array<IFile> | IFile>;
  repo: InputMaybe<Scalars['String']['input']>;
  process: Scalars['ID']['input'];
  license: Scalars['String']['input'];
}>;


export type CreateProjectMutation = { createEconomicEvent: { economicEvent: { id: string, resourceInventoriedAs: { id: string, name: string } | null } } };

export type CreateMachineResourceMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  process: Scalars['ID']['input'];
  resourceSpec: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  note: InputMaybe<Scalars['String']['input']>;
  metadata: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type CreateMachineResourceMutation = { createEconomicEvent: { economicEvent: { id: string, resourceInventoriedAs: { id: string, name: string, note: string | null, metadata: any | null, conformsTo: { id: string, name: string } } | null } } };

export type CreateDppResourceMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  process: Scalars['ID']['input'];
  resourceSpec: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  dppUlid: Scalars['JSONObject']['input'];
  name: Scalars['String']['input'];
  note: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateDppResourceMutation = { createEconomicEvent: { economicEvent: { id: string, resourceInventoriedAs: { id: string, name: string, metadata: any | null } | null } } };

export type CreateLocationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  addr: Scalars['String']['input'];
  lat: Scalars['Decimal']['input'];
  lng: Scalars['Decimal']['input'];
}>;


export type CreateLocationMutation = { createSpatialThing: { spatialThing: { id: string, lat: any | null, long: any | null } } };

export type CreateProcessMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateProcessMutation = { createProcess: { process: { id: string } } };

export type CiteProjectMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  resource: Scalars['ID']['input'];
  process: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
}>;


export type CiteProjectMutation = { createEconomicEvent: { economicEvent: { id: string } } };

export type ConsumeResourceMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  resource: Scalars['ID']['input'];
  process: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
}>;


export type ConsumeResourceMutation = { createEconomicEvent: { economicEvent: { id: string } } };

export type ContributeToProjectMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  process: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  conformsTo: Scalars['ID']['input'];
}>;


export type ContributeToProjectMutation = { createEconomicEvent: { economicEvent: { id: string } } };

export type ForkProjectMutationVariables = Exact<{
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  resource: Scalars['ID']['input'];
  process: Scalars['ID']['input'];
  unitOne: Scalars['ID']['input'];
  tags: InputMaybe<Array<Scalars['URI']['input']> | Scalars['URI']['input']>;
  location: InputMaybe<Scalars['ID']['input']>;
  spec: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  note: InputMaybe<Scalars['String']['input']>;
  repo: InputMaybe<Scalars['String']['input']>;
  metadata: InputMaybe<Scalars['JSONObject']['input']>;
}>;


export type ForkProjectMutation = { cite: { economicEvent: { id: string } }, produce: { economicEvent: { id: string, resourceInventoriedAs: { id: string, name: string } | null } } };

export type TransferProjectMutationVariables = Exact<{
  resource: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  note: Scalars['String']['input'];
  metadata: InputMaybe<Scalars['JSONObject']['input']>;
  agent: Scalars['ID']['input'];
  creationTime: Scalars['DateTime']['input'];
  tags: InputMaybe<Array<Scalars['URI']['input']> | Scalars['URI']['input']>;
  oneUnit: Scalars['ID']['input'];
  loshId: Scalars['ID']['input'];
}>;


export type TransferProjectMutation = { createEconomicEvent: { economicEvent: { id: string, toResourceInventoriedAs: { id: string, name: string } | null } } };

export type UpdateMetadataMutationVariables = Exact<{
  process: Scalars['ID']['input'];
  agent: Scalars['ID']['input'];
  resource: Scalars['ID']['input'];
  quantity: IMeasure;
  now: Scalars['DateTime']['input'];
  metadata: Scalars['JSONObject']['input'];
}>;


export type UpdateMetadataMutation = { accept: { economicEvent: { id: string } }, modify: { economicEvent: { id: string } } };

export type UpdateResourceClassifiedAsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  classifiedAs: InputMaybe<Array<Scalars['URI']['input']> | Scalars['URI']['input']>;
}>;


export type UpdateResourceClassifiedAsMutation = { updateEconomicResource: { economicResource: { id: string } } };

export type RelocateProjectMutationVariables = Exact<{
  process: Scalars['ID']['input'];
  agent: Scalars['ID']['input'];
  resource: Scalars['ID']['input'];
  quantity: IMeasure;
  now: Scalars['DateTime']['input'];
  location: Scalars['ID']['input'];
}>;


export type RelocateProjectMutation = { pickup: { economicEvent: { id: string } }, dropoff: { economicEvent: { id: string } } };

export type GetAgentQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetAgentQuery = { agents: { pageInfo: { startCursor: string | null, endCursor: string | null, hasPreviousPage: boolean, hasNextPage: boolean, totalCount: number | null, pageLimit: number | null }, edges: Array<{ cursor: string, node: { id: string, name: string } | { id: string, name: string } }> } | null };

export type GetAgentsQueryVariables = Exact<{
  userOrName: Scalars['String']['input'];
  last: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAgentsQuery = { people: { pageInfo: { startCursor: string | null, endCursor: string | null, hasPreviousPage: boolean, hasNextPage: boolean, totalCount: number | null, pageLimit: number | null }, edges: Array<{ cursor: string, node: { id: string, name: string, note: string | null, images: Array<{ bin: any | null, mimeType: string }> | null, primaryLocation: { id: string, name: string } | null } }> } | null };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { person: { id: string, name: string, email: string, user: string, ethereumAddress: string | null, primaryLocation: { name: string, mappableAddress: string | null } | null } | null };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { economicResourceClassifications: Array<any> | null };

export type GetResourceDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetResourceDetailsQuery = { proposal: { created: any, primaryIntents: Array<{ hasPointInTime: any | null, resourceInventoriedAs: { name: string, id: string, note: string | null, classifiedAs: Array<any> | null, metadata: any | null, conformsTo: { name: string, id: string }, currentLocation: { name: string } | null, primaryAccountable: { name: string, id: string } | { name: string, id: string }, onhandQuantity: { hasUnit: { label: string } | null }, images: Array<{ hash: any, name: string, mimeType: string, bin: any | null }> | null } | null }> | null } | null };
