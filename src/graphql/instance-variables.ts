/**
 * Instance variables resolver.
 *
 * Fetches configuration values from the Zenflows instance:
 * - ResourceSpecification IDs (project types, DPP, machines, materials)
 * - Unit IDs and currency spec
 *
 * These are needed as variables for all project creation mutations.
 */

import { GraphQLClient } from "../graphql/GraphQLClient";

// ─── GraphQL Query ───────────────────────────────────────────────────

const QUERY_INSTANCE_VARIABLES = `
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
      units {
        unitOne { id }
      }
    }
  }
`;

// ─── Types ───────────────────────────────────────────────────────────

export interface SpecInfo {
  id: string;
  name: string;
}

export interface InstanceVariables {
  projectDesign: SpecInfo;
  projectProduct: SpecInfo;
  projectService: SpecInfo;
  dpp: SpecInfo;
  machine: SpecInfo;
  material: SpecInfo;
  currency: SpecInfo;
  unitOne: string;
}

// ─── Resolver ────────────────────────────────────────────────────────

/**
 * Fetch and resolve instance variables from Zenflows.
 * Cached in a module-level variable for the session.
 */
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
        specDpp: { id: string; name: string };
        specMachine: { id: string; name: string };
        specMaterial: { id: string; name: string };
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
    dpp: d.specs.specDpp,
    machine: d.specs.specMachine,
    material: d.specs.specMaterial,
    currency: d.specs.specCurrency,
    unitOne: d.units.unitOne.id,
  };

  return cachedVars;
}

/**
 * Clear the cached instance variables (e.g. after reconnecting).
 */
export function clearInstanceVariablesCache(): void {
  cachedVars = null;
}
