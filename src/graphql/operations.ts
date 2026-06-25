/**
 * Zenflows GraphQL operations — all queries and mutations.
 *
 * Ported from interfacer-gui lib/QueryAndMutation.ts.
 * These are raw GQL documents used by the GraphQLClient.
 */

// ─── Instance Variables ────────────────────────────────────────────

export const QUERY_INSTANCE_VARIABLES = `
  query GetInstanceVariables {
    instanceVariables {
      specs {
        specCurrency { id name }
        specProjectDesign { id name }
        specProjectProduct { id name }
        specProjectService { id name }
        specDpp { id name }
        specMachine { id name }
        specMaterial { id name }
      }
      units { unitOne { id } }
    }
  }
`;

// ─── Auth ───────────────────────────────────────────────────────────

export const REGISTER_USER = `
  mutation RegisterUser($firstRegistration: Boolean!, $userData: JSONObject!) {
    keypairoomServer(firstRegistration: $firstRegistration, userData: $userData)
  }
`;

export const SIGN_UP = `
  mutation SignUp(
    $name: String! $user: String! $email: String!
    $eddsaPublicKey: String! $reflowPublicKey: String!
    $ethereumAddress: String! $ecdhPublicKey: String! $bitcoinPublicKey: String!
  ) {
    createPerson(person: {
      name: $name user: $user email: $email
      eddsaPublicKey: $eddsaPublicKey reflowPublicKey: $reflowPublicKey
      ethereumAddress: $ethereumAddress ecdhPublicKey: $ecdhPublicKey
      bitcoinPublicKey: $bitcoinPublicKey
    }) { agent { id name user email } }
  }
`;

export const FETCH_SELF = `
  query FetchSelf($email: String!, $pubkey: String!) {
    personCheck(email: $email, eddsaPublicKey: $pubkey) {
      id name user email isVerified note
      primaryLocation { id name mappableAddress lat long }
      images { bin mimeType }
    }
  }
`;

export const SEND_EMAIL_VERIFICATION = `
  mutation SendEmailVerification($template: EmailTemplate!) {
    personRequestEmailVerification(template: $template)
  }
`;

export const CLAIM_DID = `
  mutation claimDID($id: ID!) {
    claimPerson(id: $id)
  }
`;

// ─── Resources / Projects ───────────────────────────────────────────

export const QUERY_RESOURCE = `
  query getResourceTable($id: ID!) {
    economicResource(id: $id) {
      id name note metadata license repo classifiedAs
      conformsTo { id name }
      onhandQuantity { hasUnit { id symbol label } hasNumericalValue }
      accountingQuantity { hasUnit { label symbol } hasNumericalValue }
      primaryAccountable { id name }
      currentLocation { id name mappableAddress lat long }
      images { hash name mimeType bin }
    }
  }
`;

export const FETCH_RESOURCES = `
  query FetchInventory(
    $first: Int $after: ID $last: Int $before: ID
    $filter: EconomicResourceFilterParams $orderBy: EconomicResourceSortInput
  ) {
    economicResources(first: $first after: $after before: $before last: $last filter: $filter orderBy: $orderBy) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges {
        cursor
        node {
          conformsTo { id name }
          currentLocation { id name mappableAddress lat long }
          id name classifiedAs note metadata okhv repo license version licensor
          images { hash name mimeType }
          primaryAccountable { id name note images { bin mimeType } primaryLocation { name } }
          custodian { id name note }
          accountingQuantity { hasUnit { id label symbol } hasNumericalValue }
          onhandQuantity { hasUnit { id label symbol } hasNumericalValue }
        }
      }
    }
  }
`;

export const QUERY_PROJECTS = `
  query GetProjects($first: Int $after: ID $last: Int $before: ID $filter: ProposalFilterParams) {
    proposals(first: $first after: $after before: $before last: $last filter: $filter) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges {
        cursor
        node {
          id name created
          primaryIntents {
            resourceClassifiedAs
            action { id }
            hasPointInTime hasBeginning hasEnd
            resourceInventoriedAs {
              conformsTo { name }
              classifiedAs
              primaryAccountable { name id }
              name id note metadata
              onhandQuantity { hasUnit { label } }
              images { hash name mimeType bin }
            }
          }
          reciprocalIntents {
            resourceQuantity { hasNumericalValue hasUnit { label symbol } }
          }
        }
      }
    }
  }
`;

export const QUERY_MACHINES = `
  query getMachines($resourceSpecId: ID!) {
    economicResources(filter: { conformsTo: [$resourceSpecId] }) {
      edges { node { id name note metadata conformsTo { id name } } }
    }
  }
`;

export const QUERY_CITED_RESOURCES = `
  query getCitedResources($processId: ID!) {
    economicEvents(filter: { inputOf: [$processId], action: [cite] }) {
      edges {
        node {
          id
          action { id label }
          resourceInventoriedAs { id name note metadata conformsTo { id name } }
        }
      }
    }
  }
`;

export const QUERY_PROJECT_FOR_METADATA_UPDATE = `
  query queryProjectForMetadataUpdate($id: ID!) {
    economicResource(id: $id) {
      id name classifiedAs metadata
      onhandQuantity { hasUnit { id symbol label } hasNumericalValue }
      accountingQuantity { hasUnit { id label symbol } hasNumericalValue }
      primaryAccountable { id }
    }
  }
`;

export const ASK_RESOURCE_PRIMARY_ACCOUNTABLE = `
  query askResourcePrimaryAccountable($id: ID!) {
    economicResource(id: $id) {
      id name primaryAccountable { id name images { bin mimeType } }
    }
  }
`;

// ─── Proposals ──────────────────────────────────────────────────────

export const CREATE_PROPOSAL = `
  mutation CreateProposal($name: String!, $note: String!) {
    createProposal(proposal: { name: $name, note: $note }) { proposal { id } }
  }
`;

export const CREATE_INTENT = `
  mutation CreateIntent($agent: ID!, $resource: ID!, $oneUnit: ID!, $currency: ID!, $howMuch: Decimal!) {
    item: createIntent(intent: { name: "project" action: "transfer" provider: $agent
      resourceInventoriedAs: $resource resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit }
    }) { intent { id } }
    payment: createIntent(intent: { name: "payment" action: "transfer" receiver: $agent
      resourceConformsTo: $currency resourceQuantity: { hasNumericalValue: $howMuch hasUnit: $oneUnit }
    }) { intent { id } }
  }
`;

export const LINK_PROPOSAL_AND_INTENT = `
  mutation LinkProposalAndIntent($proposal: ID!, $item: ID!, $payment: ID!) {
    linkItem: proposeIntent(publishedIn: $proposal publishes: $item reciprocal: false) { proposedIntent { id } }
    linkPayment: proposeIntent(publishedIn: $proposal publishes: $payment reciprocal: true) { proposedIntent { id } }
  }
`;

export const PROPOSE_CONTRIBUTION = `
  mutation proposeContribution(
    $process: ID! $owner: ID! $proposer: ID! $creationTime: DateTime!
    $resourceForked: ID! $unitOne: ID! $resourceOrigin: ID!
  ) {
    citeResourceForked: createIntent(intent: {
      action: "cite" inputOf: $process provider: $proposer hasPointInTime: $creationTime
      resourceInventoriedAs: $resourceForked resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { intent { id } }
    acceptResourceOrigin: createIntent(intent: {
      action: "accept" inputOf: $process receiver: $owner hasPointInTime: $creationTime
      resourceInventoriedAs: $resourceOrigin resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { intent { id } }
    modifyResourceOrigin: createIntent(intent: {
      action: "modify" outputOf: $process receiver: $owner hasPointInTime: $creationTime
      resourceInventoriedAs: $resourceOrigin resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { intent { id } }
  }
`;

export const LINK_CONTRIBUTION_PROPOSAL_INTENT = `
  mutation LinkContributionAndProposalAndIntent(
    $proposal: ID! $citeIntent: ID! $acceptIntent: ID! $modifyIntent: ID!
  ) {
    proposeCite: proposeIntent(publishedIn: $proposal publishes: $citeIntent) { proposedIntent { id } }
    proposeAccept: proposeIntent(publishedIn: $proposal publishes: $acceptIntent) { proposedIntent { id } }
    proposeModify: proposeIntent(publishedIn: $proposal publishes: $modifyIntent) { proposedIntent { id } }
  }
`;

export const QUERY_PROPOSAL = `
  query QueryProposal($id: ID!) {
    proposal(id: $id) {
      id name note status
      primaryIntents {
        id provider { id name } receiver { id name }
        inputOf { name id } outputOf { id name } hasPointInTime
        resourceInventoriedAs {
          id name repo metadata images { hash name mimeType bin }
          primaryAccountable { id name } onhandQuantity { hasNumericalValue hasUnit { id } }
        }
        resourceConformsTo { id name }
      }
    }
  }
`;

export const QUERY_RESOURCE_PROPOSALS = `
  query resourceProposals($id: ID!) {
    proposals(filter: { primaryIntentsResourceInventoriedAsId: [$id] }) {
      edges {
        node { id status note created primaryIntents { provider { id name images { bin mimeType } } } }
      }
    }
  }
`;

export const ACCEPT_PROPOSAL = `
  mutation acceptProposal(
    $process: ID! $owner: ID! $proposer: ID! $unitOne: ID!
    $resourceForked: ID! $resourceOrigin: ID! $creationTime: DateTime! $metadata: JSONObject
  ) {
    cite: createEconomicEvent(event: {
      action: "cite" inputOf: $process provider: $proposer receiver: $owner
      resourceInventoriedAs: $resourceForked resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
      hasPointInTime: $creationTime
    }) { economicEvent { id } }
    accept: createEconomicEvent(event: {
      action: "accept" inputOf: $process provider: $owner receiver: $owner
      resourceInventoriedAs: $resourceOrigin resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
      hasPointInTime: $creationTime
    }) { economicEvent { id } }
    modify: createEconomicEvent(event: {
      action: "modify" outputOf: $process provider: $owner receiver: $owner
      resourceInventoriedAs: $resourceOrigin resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
      hasPointInTime: $creationTime resourceMetadata: $metadata
    }) { economicEvent { id } }
  }
`;

export const SATISFY_INTENTS = `
  mutation satisfyIntents(
    $unitOne: ID! $intentCited: ID! $intentAccepted: ID! $intentModify: ID!
    $eventCite: ID! $eventAccept: ID! $eventModify: ID!
  ) {
    cite: createSatisfaction(satisfaction: {
      satisfies: $intentCited satisfiedByEvent: $eventCite resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { satisfaction { id } }
    accept: createSatisfaction(satisfaction: {
      satisfies: $intentAccepted satisfiedByEvent: $eventAccept resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { satisfaction { id } }
    modify: createSatisfaction(satisfaction: {
      satisfies: $intentModify satisfiedByEvent: $eventModify resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { satisfaction { id } }
  }
`;

export const REJECT_PROPOSAL = `
  mutation rejectProposal($intentCite: ID!, $intentAccept: ID!, $intentModify: ID!) {
    cite: updateIntent(intent: { id: $intentCite finished: true }) { intent { id } }
    accept: updateIntent(intent: { id: $intentAccept finished: true }) { intent { id } }
    modify: updateIntent(intent: { id: $intentModify finished: true }) { intent { id } }
  }
`;

// ─── Resource Mutations ─────────────────────────────────────────────

export const CREATE_PROJECT = `
  mutation CreateProject(
    $name: String! $note: String! $metadata: JSONObject $agent: ID!
    $creationTime: DateTime! $location: ID $tags: [URI!] $resourceSpec: ID!
    $oneUnit: ID! $images: [IFile!] $repo: String $process: ID! $license: String!
  ) {
    createEconomicEvent(
      event: {
        action: "produce" provider: $agent receiver: $agent outputOf: $process
        hasPointInTime: $creationTime resourceClassifiedAs: $tags
        resourceConformsTo: $resourceSpec resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit }
        toLocation: $location resourceMetadata: $metadata
      }
      newInventoriedResource: { name: $name note: $note images: $images repo: $repo license: $license }
    ) {
      economicEvent { id resourceInventoriedAs { id name } }
    }
  }
`;

export const CREATE_MACHINE_RESOURCE = `
  mutation createMachineResource(
    $agent: ID! $creationTime: DateTime! $process: ID! $resourceSpec: ID!
    $unitOne: ID! $name: String! $note: String $metadata: String
  ) {
    createEconomicEvent(
      event: {
        action: "produce" outputOf: $process provider: $agent receiver: $agent
        hasPointInTime: $creationTime resourceConformsTo: $resourceSpec
        resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne } resourceMetadata: $metadata
      }
      newInventoriedResource: { name: $name note: $note }
    ) {
      economicEvent { id resourceInventoriedAs { id name note metadata conformsTo { id name } } }
    }
  }
`;

export const CREATE_DPP_RESOURCE = `
  mutation createDppResource(
    $agent: ID! $creationTime: DateTime! $process: ID! $resourceSpec: ID!
    $unitOne: ID! $dppUlid: String! $name: String! $note: String
  ) {
    createEconomicEvent(
      event: {
        action: "produce" outputOf: $process provider: $agent receiver: $agent
        hasPointInTime: $creationTime resourceConformsTo: $resourceSpec
        resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne } resourceMetadata: $dppUlid
      }
      newInventoriedResource: { name: $name note: $note }
    ) {
      economicEvent { id resourceInventoriedAs { id name metadata } }
    }
  }
`;

export const CREATE_LOCATION = `
  mutation CreateLocation($name: String!, $addr: String!, $lat: Decimal!, $lng: Decimal!) {
    createSpatialThing(spatialThing: { name: $name mappableAddress: $addr lat: $lat long: $lng }) {
      spatialThing { id lat long }
    }
  }
`;

export const CREATE_PROCESS = `
  mutation CreateProcess($name: String!) {
    createProcess(process: { name: $name }) { process { id } }
  }
`;

export const CITE_PROJECT = `
  mutation citeProject($agent: ID! $creationTime: DateTime! $resource: ID! $process: ID! $unitOne: ID!) {
    createEconomicEvent(event: {
      action: "cite" inputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceInventoriedAs: $resource
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const CONSUME_RESOURCE = `
  mutation consumeResource($agent: ID! $creationTime: DateTime! $resource: ID! $process: ID! $unitOne: ID!) {
    createEconomicEvent(event: {
      action: "consume" inputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceInventoriedAs: $resource
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const CONTRIBUTE_TO_PROJECT = `
  mutation contributeToProject(
    $agent: ID! $creationTime: DateTime! $process: ID! $unitOne: ID! $conformsTo: ID!
  ) {
    createEconomicEvent(event: {
      action: "work" inputOf: $process provider: $agent receiver: $agent
      resourceConformsTo: $conformsTo hasPointInTime: $creationTime
      effortQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const FORK_PROJECT = `
  mutation ForkProject(
    $agent: ID! $creationTime: DateTime! $resource: ID! $process: ID!
    $unitOne: ID! $tags: [URI!] $location: ID $spec: ID!
    $name: String! $note: String $repo: String $metadata: JSONObject
  ) {
    cite: createEconomicEvent(event: {
      action: "cite" inputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceInventoriedAs: $resource
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
    produce: createEconomicEvent(event: {
      action: "produce" outputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceClassifiedAs: $tags resourceConformsTo: $spec
      toLocation: $location resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
      resourceMetadata: $metadata
    } newInventoriedResource: { name: $name note: $note repo: $repo }) {
      economicEvent { id resourceInventoriedAs { id name } }
    }
  }
`;

export const TRANSFER_PROJECT = `
  mutation TransferProject(
    $resource: ID! $name: String! $note: String! $metadata: JSONObject
    $agent: ID! $creationTime: DateTime! $tags: [URI!] $oneUnit: ID!
  ) {
    createEconomicEvent(event: {
      resourceInventoriedAs: $resource action: "transfer"
      provider: "${process.env.NEXT_PUBLIC_LOSH_ID || ""}" receiver: $agent
      hasPointInTime: $creationTime resourceClassifiedAs: $tags
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit } resourceMetadata: $metadata
    } newInventoriedResource: { name: $name note: $note }) {
      economicEvent { id toResourceInventoriedAs { id name } }
    }
  }
`;

export const UPDATE_METADATA = `
  mutation updateMetadata(
    $process: ID! $agent: ID! $resource: ID! $quantity: IMeasure! $now: DateTime! $metadata: JSONObject!
  ) {
    accept: createEconomicEvent(event: {
      action: "accept" inputOf: $process provider: $agent receiver: $agent
      resourceInventoriedAs: $resource resourceQuantity: $quantity hasPointInTime: $now
    }) { economicEvent { id } }
    modify: createEconomicEvent(event: {
      action: "modify" outputOf: $process provider: $agent receiver: $agent
      resourceInventoriedAs: $resource resourceQuantity: $quantity
      resourceMetadata: $metadata hasPointInTime: $now
    }) { economicEvent { id } }
  }
`;

export const UPDATE_RESOURCE_CLASSIFIED_AS = `
  mutation updateResourceClassifiedAs($id: ID!, $classifiedAs: [URI!]) {
    updateEconomicResource(resource: { id: $id classifiedAs: $classifiedAs }) { economicResource { id } }
  }
`;

export const RELOCATE_PROJECT = `
  mutation relocateProject(
    $process: ID! $agent: ID! $resource: ID! $quantity: IMeasure! $now: DateTime! $location: ID!
  ) {
    pickup: createEconomicEvent(event: {
      action: "pickup" inputOf: $process provider: $agent receiver: $agent
      resourceInventoriedAs: $resource resourceQuantity: $quantity hasPointInTime: $now
    }) { economicEvent { id } }
    dropoff: createEconomicEvent(event: {
      action: "dropoff" outputOf: $process provider: $agent receiver: $agent
      resourceInventoriedAs: $resource resourceQuantity: $quantity toLocation: $location hasPointInTime: $now
    }) { economicEvent { id } }
  }
`;

// ─── Agent Queries ──────────────────────────────────────────────────

export const QUERY_AGENTS = `
  query getAgent($first: Int, $id: ID) {
    agents(first: $first after: $id) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges { cursor node { id name } }
    }
  }
`;

export const FETCH_AGENTS = `
  query getAgents($userOrName: String!, $last: Int) {
    people(last: $last filter: { userOrName: $userOrName }) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges { cursor node { id name note images { bin mimeType } primaryLocation { id name } } }
    }
  }
`;

export const FETCH_USER = `
  query GetUser($id: ID!) {
    person(id: $id) {
      id name email user ethereumAddress primaryLocation { name mappableAddress }
    }
  }
`;

// ─── Tags ───────────────────────────────────────────────────────────

export const GET_TAGS = `
  query GetTags {
    economicResourceClassifications
  }
`;

export const GET_RESOURCE_DETAILS = `
  query GetResourceDetails($id: ID!) {
    proposal(id: $id) {
      created
      primaryIntents {
        hasPointInTime
        resourceInventoriedAs {
          conformsTo { name id } currentLocation { name } name id note
          classifiedAs metadata primaryAccountable { name id }
          onhandQuantity { hasUnit { label } } images { hash name mimeType bin }
        }
      }
    }
  }
`;
