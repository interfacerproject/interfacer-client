/**
 * Instance variables resolver.
 *
 * Fetches configuration values from the Zenflows instance:
 * - ResourceSpecification IDs (project types)
 * - Unit IDs and currency spec
 *
 * Note: specDpp, specMachine, specMaterial are NOT available via instanceVariables
 * on all Zenflows instances. Configure them manually via InterfacerConfig.
 */

import { gql } from "./gql";
import { GraphQLClient } from "../graphql/GraphQLClient";

const QUERY_INSTANCE_VARIABLES = gql`
  query GetInstanceVariables {
    instanceVariables {
      specs {
        specCurrency { id name }
        specProjectDesign { id name }
        specProjectProduct { id name }
        specProjectService { id name }
      }
      units {
        unitOne { id }
      }
    }
  }
`;

export interface SpecInfo {
  id: string;
  name: string;
}

export interface InstanceVariables {
  projectDesign: SpecInfo;
  projectProduct: SpecInfo;
  projectService: SpecInfo;
  currency: SpecInfo;
  unitOne: string;
}

let cachedVars: InstanceVariables | null = null;

export async function getInstanceVariables(client: GraphQLClient): Promise<InstanceVariables> {
  if (cachedVars) return cachedVars;

  const res = await client.request<{
    instanceVariables: {
      specs: {
        specCurrency: { id: string; name: string };
        specProjectDesign: { id: string; name: string };
        specProjectProduct: { id: string; name: string };
        specProjectService: { id: string; name: string };
      };
      units: {
        unitOne: { id: string };
      };
    };
  }>(QUERY_INSTANCE_VARIABLES);

  if (res.errors?.length) {
    throw new Error(`Failed to fetch instance variables: ${res.errors[0]!.message}`);
  }

  const d = res.data?.instanceVariables;
  if (!d) throw new Error("No instance variables returned.");

  cachedVars = {
    projectDesign: d.specs.specProjectDesign,
    projectProduct: d.specs.specProjectProduct,
    projectService: d.specs.specProjectService,
    currency: d.specs.specCurrency,
    unitOne: d.units.unitOne.id,
  };

  return cachedVars;
}

export function clearInstanceVariablesCache(): void {
  cachedVars = null;
}
