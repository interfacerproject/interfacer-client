/**
 * Zenflows GraphQL operations — all queries and mutations.
 *
 * Ported from interfacer-gui lib/QueryAndMutation.ts.
 * These are raw GQL documents used by the GraphQLClient.
 */

import { gql } from "./gql";

// ─── Instance Variables ────────────────────────────────────────────

export const QUERY_VARIABLES = gql`
  query GetVariables {
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

export const QUERY_PROJECT_TYPES = gql`
  query GetProjectTypes {
    instanceVariables {
      specs {
        specProjectDesign { id name }
        specProjectProduct { id name }
        specProjectService { id name }
        specDpp { id name }
        specMachine { id name }
        specMaterial { id name }
      }
    }
  }
`;

export const QUERY_UNIT_AND_CURRENCY = gql`
  query GetUnitAndCurrency {
    instanceVariables {
      units { unitOne { id } }
      specs { specCurrency { id } }
    }
  }
`;

// ─── Auth ───────────────────────────────────────────────────────────

export const REGISTER_USER = gql`
  mutation RegisterUser($firstRegistration: Boolean!, $userData: JSONObject!) {
    keypairoomServer(firstRegistration: $firstRegistration, userData: $userData)
  }
`;

export const SIGN_UP = gql`
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

export const FETCH_SELF = gql`
  query FetchSelf($email: String!, $pubkey: String!) {
    personCheck(email: $email, eddsaPublicKey: $pubkey) {
      id name user email isVerified note
      primaryLocation { id name mappableAddress lat long }
      images { bin mimeType }
    }
  }
`;

export const SEND_EMAIL_VERIFICATION = gql`
  mutation SendEmailVerification($template: EmailTemplate!) {
    personRequestEmailVerification(template: $template)
  }
`;

export const CLAIM_DID = gql`
  mutation claimDID($id: ID!) {
    claimPerson(id: $id)
  }
`;

export const PERSON_EXISTS = gql`
  query PersonExists($email: String, $user: String) {
    personExists(email: $email, user: $user)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    personVerifyEmailVerification(token: $token)
  }
`;

// ─── Resources / Projects ───────────────────────────────────────────

export const QUERY_RESOURCE = gql`
  query getResourceTable($id: ID!) {
    economicResource(id: $id) {
      id name note metadata license repo classifiedAs
      conformsTo { id name }
      onhandQuantity { hasUnit { id symbol label } hasNumericalValue }
      accountingQuantity { hasUnit { label symbol } hasNumericalValue }
      primaryAccountable { id name }
      currentLocation { id name mappableAddress lat long }
      images { hash name mimeType }
    }
  }
`;

export const FETCH_RESOURCES = gql`
  query FetchInventory(
    $first: Int $after: ID $last: Int $before: ID
    $filter: EconomicResourceFilterParams
  ) {
    economicResources(first: $first after: $after before: $before last: $last filter: $filter) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit distinctPrimaryAccountableCount }
      edges {
        cursor
        node {
          conformsTo { id name }
          currentLocation { id name mappableAddress lat long }
          id name classifiedAs note metadata
          images { hash name mimeType }
          license
          primaryAccountable { id name images { mimeType } }
        }
      }
    }
  }
`;

export const QUERY_PROJECTS = gql`
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
              images { hash name mimeType }
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

export const QUERY_MACHINES = gql`
  query getMachines($resourceSpecId: ID!) {
    economicResources(filter: { conformsTo: [$resourceSpecId] }) {
      edges { node { id name note metadata conformsTo { id name } } }
    }
  }
`;

export const QUERY_CITED_RESOURCES = gql`
  query getCitedResources($processId: ID!) {
    economicEvents {
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

export const QUERY_PROJECT_FOR_METADATA_UPDATE = gql`
  query queryProjectForMetadataUpdate($id: ID!) {
    economicResource(id: $id) {
      id name classifiedAs metadata
      onhandQuantity { hasUnit { id symbol label } hasNumericalValue }
      accountingQuantity { hasUnit { id label symbol } hasNumericalValue }
      primaryAccountable { id }
    }
  }
`;

export const ASK_RESOURCE_PRIMARY_ACCOUNTABLE = gql`
  query askResourcePrimaryAccountable($id: ID!) {
    economicResource(id: $id) {
      id name primaryAccountable { id name }
    }
  }
`;

export const GET_PROJECT_LAYOUT = gql`
  query getProjectLayout($id: ID!) {
    economicResource(id: $id) {
      id name note metadata license licensor repo classifiedAs
      accountingQuantity { hasNumericalValue }
      onhandQuantity { hasUnit { id } hasNumericalValue }
      conformsTo { id name }
      primaryAccountable {
        id name
        primaryLocation { name mappableAddress lat long }
      }
      currentLocation { id name mappableAddress lat long }
      images { hash name mimeType date description extension size }
    }
  }
`;

export const SEARCH_PROJECT = gql`
  query SearchProject($id: ID!) {
    economicResource(id: $id) {
      id name metadata
      images { hash mimeType }
      conformsTo { name id }
      primaryAccountable { name }
    }
  }
`;

export const SEARCH_PROJECTS = gql`
  query SearchProjects(
    $last: Int $IDs: [ID!] $name: String
    $conformsTo: [ID!] $primaryAccountable: [ID!]
  ) {
    economicResources(
      last: $last
      filter: { id: $IDs, name: $name, conformsTo: $conformsTo, primaryAccountable: $primaryAccountable }
    ) {
      edges {
        node {
          id name metadata
          conformsTo { id name }
          primaryAccountable { id name }
          images { hash name mimeType }
        }
      }
    }
  }
`;

export const SELECT_RESOURCES = gql`
  query FetchResources($filter: EconomicResourceFilterParams) {
    economicResources(last: 10, filter: $filter) {
      edges { cursor node { id name } }
    }
  }
`;

export const EDIT_IMAGES = gql`
  mutation EditImages($id: ID!, $images: [IFile!]) {
    updateEconomicResource(resource: { id: $id, images: $images }) {
      economicResource { id }
    }
  }
`;

export const EDIT_MAIN = gql`
  mutation EditMain($id: ID!, $classifiedAs: [URI!], $note: String, $name: String, $repo: String) {
    updateEconomicResource(
      resource: { id: $id, classifiedAs: $classifiedAs, name: $name, note: $note, repo: $repo }
    ) { economicResource { id } }
  }
`;

export const EDIT_SPECS = gql`
  mutation EditSpecs($id: ID!, $classifiedAs: [URI!]) {
    updateEconomicResource(resource: { id: $id, classifiedAs: $classifiedAs }) {
      economicResource { id }
    }
  }
`;

// ─── Proposals ──────────────────────────────────────────────────────

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($name: String!, $note: String!) {
    createProposal(proposal: { name: $name, note: $note }) { proposal { id } }
  }
`;

export const CREATE_INTENT = gql`
  mutation CreateIntent($agent: ID!, $resource: ID!, $oneUnit: ID!, $currency: ID!, $howMuch: Decimal!) {
    item: createIntent(intent: { name: "project" action: "transfer" provider: $agent
      resourceInventoriedAs: $resource resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit }
    }) { intent { id } }
    payment: createIntent(intent: { name: "payment" action: "transfer" receiver: $agent
      resourceConformsTo: $currency resourceQuantity: { hasNumericalValue: $howMuch hasUnit: $oneUnit }
    }) { intent { id } }
  }
`;

export const LINK_PROPOSAL_AND_INTENT = gql`
  mutation LinkProposalAndIntent($proposal: ID!, $item: ID!, $payment: ID!) {
    linkItem: proposeIntent(publishedIn: $proposal publishes: $item reciprocal: false) { proposedIntent { id } }
    linkPayment: proposeIntent(publishedIn: $proposal publishes: $payment reciprocal: true) { proposedIntent { id } }
  }
`;

export const PROPOSE_CONTRIBUTION = gql`
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

export const LINK_CONTRIBUTION_PROPOSAL_INTENT = gql`
  mutation LinkContributionAndProposalAndIntent(
    $proposal: ID! $citeIntent: ID! $acceptIntent: ID! $modifyIntent: ID!
  ) {
    proposeCite: proposeIntent(publishedIn: $proposal publishes: $citeIntent) { proposedIntent { id } }
    proposeAccept: proposeIntent(publishedIn: $proposal publishes: $acceptIntent) { proposedIntent { id } }
    proposeModify: proposeIntent(publishedIn: $proposal publishes: $modifyIntent) { proposedIntent { id } }
  }
`;

export const QUERY_PROPOSAL = gql`
  query QueryProposal($id: ID!) {
    proposal(id: $id) {
      id name note status
      primaryIntents {
        id provider { id name } receiver { id name }
        inputOf { name id } outputOf { id name } hasPointInTime
        resourceInventoriedAs {
          id name repo metadata images { hash name mimeType }
          primaryAccountable { id name } onhandQuantity { hasNumericalValue hasUnit { id } }
        }
        resourceConformsTo { id name }
      }
    }
  }
`;

export const QUERY_RESOURCE_PROPOSALS = gql`
  query resourceProposals($id: ID!) {
    proposals(filter: { primaryIntentsResourceInventoriedAsId: [$id] }) {
      edges {
        node { id status note created primaryIntents { provider { id name images { bin mimeType } } } }
      }
    }
  }
`;

export const ACCEPT_PROPOSAL = gql`
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

export const SATISFY_INTENTS = gql`
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

export const REJECT_PROPOSAL = gql`
  mutation rejectProposal($intentCite: ID!, $intentAccept: ID!, $intentModify: ID!) {
    cite: updateIntent(intent: { id: $intentCite finished: true }) { intent { id } }
    accept: updateIntent(intent: { id: $intentAccept finished: true }) { intent { id } }
    modify: updateIntent(intent: { id: $intentModify finished: true }) { intent { id } }
  }
`;

// ─── Resource Mutations ─────────────────────────────────────────────

export const CREATE_PROJECT = gql`
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

export const CREATE_MACHINE_RESOURCE = gql`
  mutation createMachineResource(
    $agent: ID! $creationTime: DateTime! $process: ID! $resourceSpec: ID!
    $unitOne: ID! $name: String! $note: String $metadata: JSONObject $tags: [URI!]
  ) {
    createEconomicEvent(
      event: {
        action: "produce" outputOf: $process provider: $agent receiver: $agent
        hasPointInTime: $creationTime resourceConformsTo: $resourceSpec
        resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne } resourceMetadata: $metadata
        resourceClassifiedAs: $tags
      }
      newInventoriedResource: { name: $name note: $note }
    ) {
      economicEvent { id resourceInventoriedAs { id name note metadata conformsTo { id name } } }
    }
  }
`;

export const CREATE_DPP_RESOURCE = gql`
  mutation createDppResource(
    $agent: ID! $creationTime: DateTime! $process: ID! $resourceSpec: ID!
    $unitOne: ID! $dppUlid: JSONObject! $name: String! $note: String
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

export const CREATE_LOCATION = gql`
  mutation CreateLocation($name: String!, $addr: String!, $lat: Decimal!, $lng: Decimal!) {
    createSpatialThing(spatialThing: { name: $name mappableAddress: $addr lat: $lat long: $lng }) {
      spatialThing { id lat long }
    }
  }
`;

export const CREATE_PROCESS = gql`
  mutation CreateProcess($name: String!) {
    createProcess(process: { name: $name }) { process { id } }
  }
`;

export const CITE_PROJECT = gql`
  mutation citeProject($agent: ID! $creationTime: DateTime! $resource: ID! $process: ID! $unitOne: ID!) {
    createEconomicEvent(event: {
      action: "cite" inputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceInventoriedAs: $resource
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const CONSUME_RESOURCE = gql`
  mutation consumeResource($agent: ID! $creationTime: DateTime! $resource: ID! $process: ID! $unitOne: ID!) {
    createEconomicEvent(event: {
      action: "consume" inputOf: $process provider: $agent receiver: $agent
      hasPointInTime: $creationTime resourceInventoriedAs: $resource
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const CONTRIBUTE_TO_PROJECT = gql`
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

export const FORK_PROJECT = gql`
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

export const TRANSFER_PROJECT = gql`
  mutation TransferProject(
    $resource: ID! $name: String! $note: String! $metadata: JSONObject
    $agent: ID! $creationTime: DateTime! $tags: [URI!] $oneUnit: ID!
    $loshId: ID!
  ) {
    createEconomicEvent(event: {
      resourceInventoriedAs: $resource action: "transfer"
      provider: $loshId receiver: $agent
      hasPointInTime: $creationTime resourceClassifiedAs: $tags
      resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit } resourceMetadata: $metadata
    } newInventoriedResource: { name: $name note: $note }) {
      economicEvent { id toResourceInventoriedAs { id name } }
    }
  }
`;

export const UPDATE_METADATA = gql`
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

export const UPDATE_RESOURCE_CLASSIFIED_AS = gql`
  mutation updateResourceClassifiedAs($id: ID!, $classifiedAs: [URI!]) {
    updateEconomicResource(resource: { id: $id classifiedAs: $classifiedAs }) { economicResource { id } }
  }
`;

export const UPDATE_CONTRIBUTION = gql`
  mutation updateContribution(
    $process: ID! $agent: ID! $resource: ID! $quantity: IMeasure!
    $now: DateTime! $metadata: JSONObject! $conformsTo: ID! $unitOne: ID!
  ) {
    contribute: createEconomicEvent(event: {
      action: "work" inputOf: $process provider: $agent receiver: $agent
      resourceConformsTo: $conformsTo hasPointInTime: $now
      effortQuantity: { hasNumericalValue: 1 hasUnit: $unitOne }
    }) { economicEvent { id } }
  }
`;

export const RELOCATE_PROJECT = gql`
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

export const QUERY_AGENTS = gql`
  query getAgent($first: Int, $id: ID) {
    agents(first: $first after: $id) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges { cursor node { id name } }
    }
  }
`;

export const FETCH_AGENTS = gql`
  query getAgents($userOrName: String!, $last: Int) {
    people(last: $last filter: { userOrName: $userOrName }) {
      pageInfo { startCursor endCursor hasPreviousPage hasNextPage totalCount pageLimit }
      edges { cursor node { id name note images { bin mimeType } primaryLocation { id name } } }
    }
  }
`;

export const FETCH_USER = gql`
  query GetUser($id: ID!) {
    person(id: $id) {
      id name email user ethereumAddress primaryLocation { name mappableAddress }
    }
  }
`;

export const GET_USER_LAYOUT = gql`
  query GetUserLayout($id: ID!) {
    person(id: $id) {
      id name note email user
      images { hash name mimeType bin size extension description }
      ethereumAddress
      primaryLocation { id name mappableAddress lat long }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser(
    $id: ID! $name: String $note: String $primaryLocation: ID $user: String $images: [IFile!]
  ) {
    updatePerson(
      person: { id: $id name: $name note: $note primaryLocation: $primaryLocation user: $user images: $images }
    ) {
      agent {
        id name note
        images { name }
        primaryLocation { id lat long name }
      }
    }
  }
`;

export const GET_USER_IMAGES = gql`
  query GetUserImages($userId: ID!) {
    person(id: $userId) {
      id name
      images { bin mimeType date description extension hash name size }
    }
  }
`;

export const SEARCH_PERSON = gql`
  query getPerson($id: ID!) {
    person(id: $id) {
      id name user
      images { bin mimeType }
      primaryLocation { id name }
    }
  }
`;

export const SEARCH_PEOPLE = gql`
  query SearchPeople($filter: PersonFilterParams, $last: Int) {
    people(last: $last, filter: $filter) {
      edges {
        node {
          id name user note
          images { bin mimeType }
          primaryLocation { id name }
        }
      }
    }
  }
`;

// ─── Tags ───────────────────────────────────────────────────────────

export const GET_TAGS = gql`
  query GetTags {
    economicResourceClassifications
  }
`;

export const SEARCH_TAGS = gql`
  query SearchTags($text: URI!) {
    economicResourceClassifications(filter: { uri: $text })
  }
`;

// ─── Details ────────────────────────────────────────────────────────

export const GET_RESOURCE_DETAILS = gql`
  query GetResourceDetails($id: ID!) {
    proposal(id: $id) {
      created
      primaryIntents {
        hasPointInTime
        resourceInventoriedAs {
          conformsTo { name id } currentLocation { name } name id note
          classifiedAs metadata primaryAccountable { name id }
          onhandQuantity { hasUnit { label } } images { hash name mimeType }
        }
      }
    }
  }
`;

// ─── Traceability ───────────────────────────────────────────────────

export const QUERY_RESOURCE_TRACE_DPP = gql`
  query GetResourceTraceDpp($id: ID!) {
    economicResource(id: $id) {
      id
      traceDpp
    }
  }
`;
