#!/usr/bin/env node --experimental-vm-modules

/**
 * Interfacer Init Data — using @interfacer/client SDK.
 *
 * Recreates the full data injection flow using the type-safe SDK
 * instead of raw GraphQL/fetch calls.
 *
 * Usage: node --experimental-vm-modules scripts/init-data.mjs
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// ── Import the built SDK ────────────────────────────────────────────
import { InterfacerClient, createConfig } from "../dist/index.js";

// ── Load env from interfacer-gui ────────────────────────────────────
const guiEnvPath = join(REPO_ROOT, "..", "interfacer-gui", ".env.local");
if (!existsSync(guiEnvPath)) {
  console.error("Missing: interfacer-gui/.env.local");
  process.exit(1);
}
const envContent = readFileSync(guiEnvPath, "utf8");
let BASE_URL = "";
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx).trim();
  let value = trimmed.substring(eqIdx + 1).trim();
  value = value.replace(/\$BASE_URL/g, BASE_URL);
  if (key === "BASE_URL") BASE_URL = value;
  if (!process.env[key]) process.env[key] = value;
}

const DPP_URL = process.env.NEXT_PUBLIC_DPP_URL || `${BASE_URL}/interfacer-dpp`;
const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL || "https://feedback.dpp-dev.ddns.dyne.org";
const STL_FILE_PATH = "/Users/alcibiade/Desktop/incastro_mobile.stl";
const DPP_SIGN_SCRIPT = readFileSync(
  join(REPO_ROOT, "src", "zenflows-crypto", "src", "sign_graphql.zen"),
  "utf8"
);

console.log("═══ Interfacer Init Data (SDK) ═══");
console.log(`  Zenflows:  ${process.env.NEXT_PUBLIC_ZENFLOWS_URL}`);
console.log(`  DPP:       ${DPP_URL}`);
console.log(`  Feedback:  ${FEEDBACK_URL}`);
console.log("");

// ── Create client ───────────────────────────────────────────────────
const client = new InterfacerClient(
  createConfig({
    zenflowsUrl: process.env.NEXT_PUBLIC_ZENFLOWS_URL,
    zenflowsFileUrl: process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL,
    dppUrl: DPP_URL,
    inbox: {
      send: process.env.NEXT_PUBLIC_INBOX_SEND,
      read: process.env.NEXT_PUBLIC_INBOX_READ,
      countUnread: process.env.NEXT_PUBLIC_INBOX_COUNT_UNREAD,
      setRead: process.env.NEXT_PUBLIC_INBOX_SET_READ,
    },
    walletUrl: process.env.NEXT_PUBLIC_WALLET,
    social: {
      personBase: process.env.NEXT_PUBLIC_SOCIAL_PERSON,
      economicResourceBase: process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE,
    },
    oshUrl: process.env.NEXT_PUBLIC_OSH,
    loshId: process.env.NEXT_PUBLIC_LOSH_ID,
    zenflowsAdmin: process.env.NEXT_PUBLIC_ZENFLOWS_ADMIN,
    specs: {
      machine: process.env.NEXT_PUBLIC_SPEC_MACHINE,
      dpp: process.env.NEXT_PUBLIC_SPEC_DPP,
    },
  })
);

const results = { users: [], designs: [], services: [], products: [], dpps: [], feedback: [] };

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(str) {
  return client.tagging.slugifyTagValue(str);
}

async function uploadPicsumImage(seed, privateKey, publicKey) {
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`;
  try {
    const imgRes = await fetch(url);
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const sha256 = createHash("sha256").update(buf).digest("hex");

    const { zencode_exec } = await import("zenroom");
    const zenData = JSON.stringify({ gql: sha256 });
    const zenKeys = JSON.stringify({ keyring: { eddsa: privateKey } });
    const { result } = await zencode_exec(DPP_SIGN_SCRIPT, { data: zenData, keys: zenKeys });
    const signature = JSON.parse(result).eddsa_signature;

    const form = new (await import("form-data")).default();
    form.append("file", buf, { filename: `${seed}.jpg`, contentType: "image/jpeg" });
    const dppRes = await fetch(`${DPP_URL}/upload`, {
      method: "POST",
      headers: { "did-pk": publicKey, "did-sign": signature },
      body: form,
    });
    if (!dppRes.ok) return null;
    const att = await dppRes.json();
    return `${DPP_URL}/file/${encodeURIComponent(att.id)}`;
  } catch {
    return null;
  }
}

async function uploadStlModel(filePath, privateKey, publicKey) {
  if (!existsSync(filePath)) return null;
  const fileBuffer = readFileSync(filePath);
  const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

  const { zencode_exec } = await import("zenroom");
  const zenData = JSON.stringify({ gql: sha256 });
  const zenKeys = JSON.stringify({ keyring: { eddsa: privateKey } });
  const { result } = await zencode_exec(DPP_SIGN_SCRIPT, { data: zenData, keys: zenKeys });
  const signature = JSON.parse(result).eddsa_signature;

  const form = new (await import("form-data")).default();
  form.append("file", fileBuffer, { filename: basename(filePath) });
  const res = await fetch(`${DPP_URL}/upload`, {
    method: "POST",
    headers: { "did-pk": publicKey, "did-sign": signature },
    body: form,
  });
  if (!res.ok) throw new Error(`STL upload failed: ${res.statusText}`);
  const att = await res.json();
  return {
    contentType: att.contentType,
    downloadUrl: `${DPP_URL}/file/${encodeURIComponent(att.id)}`,
    extension: extname(filePath).slice(1),
    fileName: att.fileName,
    id: att.id,
    mimeType: att.contentType,
    name: att.fileName,
    size: att.size,
    storage: "dpp",
    uploadedAt: att.uploadedAt,
    url: `${DPP_URL}/file/${encodeURIComponent(att.id)}`,
    checksum: att.checksum,
  };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  // ── Step 1: Fetch specs ──────────────────────────────────────────
  console.log("── Step 1: Fetching specs ──");
  const instanceVars = await client.graphql.request(`
    query { instanceVariables { specs {
      specProjectDesign { id name }
      specProjectProduct { id name }
      specProjectService { id name }
    } units { unitOne { id } } } }
  `);
  const specs = instanceVars.data?.instanceVariables;
  const unitOne = specs?.units?.unitOne?.id;
  const designSpecId = specs?.specs?.specProjectDesign?.id;
  const productSpecId = specs?.specs?.specProjectProduct?.id;
  const serviceSpecId = specs?.specs?.specProjectService?.id;
  console.log(`  Design:  ${designSpecId}`);
  console.log(`  Product: ${productSpecId}`);
  console.log(`  Service: ${serviceSpecId}`);
  console.log(`  UnitOne: ${unitOne}`);
  console.log("");

  // ── Step 2: Create users ─────────────────────────────────────────
  console.log("── Step 2: Creating 3 users ──");
  const userDefs = [
    { name: "Alice Designer", username: "alice_designer", email: "alice.designer@example.com",
      challenges: { whereParentsMet: "Paris", nameFirstPet: "Rex", nameFirstTeacher: "Smith", whereHomeTown: "Berlin", nameMotherMaid: "Maria" } },
    { name: "Bob Maker", username: "bob_maker", email: "bob.maker@example.com",
      challenges: { whereParentsMet: "London", nameFirstPet: "Max", nameFirstTeacher: "Johnson", whereHomeTown: "Tokyo", nameMotherMaid: "Anna" } },
    { name: "Clara Reviewer", username: "clara_reviewer", email: "clara.reviewer@example.com",
      challenges: { whereParentsMet: "Rome", nameFirstPet: "Luna", nameFirstTeacher: "Brown", whereHomeTown: "Madrid", nameMotherMaid: "Sophia" } },
  ];

  for (const def of userDefs) {
    console.log(`  Creating: ${def.name} (${def.email})`);

    // Get HMAC (handle existing users)
    let hmac;
    try { hmac = await client.auth.requestHmac(def.email, true); console.log("    ✓ HMAC"); }
    catch (e) {
      if (e.message?.includes("email exists")) {
        hmac = await client.auth.requestHmac(def.email, false); console.log("    ✓ HMAC (existing)");
      } else throw e;
    }

    // Derive keys
    await client.auth.deriveKeys(def.challenges, def.email, hmac);
    const privateKey = client.store.getItem("eddsaPrivateKey");
    const publicKey = client.store.getItem("eddsaPublicKey");
    console.log("    ✓ Keys derived");

    // Register user
    try {
      await client.auth.registerUser({ name: def.name, user: def.username, email: def.email });
      console.log("    ✓ Person created");
    } catch (e) {
      if (e.message?.includes("already been taken") || e.message?.includes("exists")) {
        console.log("    ⚠ Person exists, proceeding");
      } else throw e;
    }

    // Login
    const profile = await client.auth.login({ email: def.email });
    console.log(`    ✓ Verified: ${profile.name} (${profile.id})`);

    // Claim DID
    try { await client.auth.claimDid(profile.id); console.log("    ✓ DID claimed"); }
    catch (e) { console.log("    ⚠ DID skipped"); }

    results.users.push({ id: profile.id, name: def.name, username: def.username, email: def.email, privateKey, publicKey });
    client.auth.logout(); // Clear auth for next user (new keypair)
  }
  console.log("");

  const aliceAuth = results.users[0];
  const bobAuth = results.users[1];
  const claraAuth = results.users[2];

  // ── Helper: create project ───────────────────────────────────────
  async function createProject(auth, type, def) {
    // Re-auth as this user
    client.store.setItem("eddsaPrivateKey", auth.privateKey);
    client.store.setItem("eddsaPublicKey", auth.publicKey);
    client.store.setItem("authId", auth.id);
    client.store.setItem("authUsername", auth.username);
    client.store.setItem("authEmail", auth.email);
    client.graphql.setSigningEnabled(true);

    const specId = type === "DESIGN" ? designSpecId : type === "SERVICE" ? serviceSpecId : productSpecId;

    const image = await uploadPicsumImage(def.imageSeed, auth.privateKey, auth.publicKey)
      || await uploadPicsumImage("placeholder", auth.privateKey, auth.publicKey);

    let models = [];
    if (type === "DESIGN") {
      const stlModel = await uploadStlModel(STL_FILE_PATH, auth.privateKey, auth.publicKey);
      if (stlModel) { models = [stlModel]; console.log("    ✓ Model uploaded"); }
    }

    const tags = client.tagging.normalizeUserTags(def.tags || []);

    const metadata = JSON.stringify({
      contributors: [],
      relations: [],
      remote: true,
      models,
      image,
      ...(def.productFilters ? { productFilters: def.productFilters } : {}),
      ...(def.serviceFilters ? { serviceFilters: def.serviceFilters } : {}),
      ...(def.designId ? { design: def.designId } : {}),
    });

    const project = await client.resources.createProject({
      projectType: type,
      name: def.name,
      note: def.description,
      tags,
      repo: def.link,
      license: def.license,
      metadata: JSON.parse(metadata), // createProject stringifies internally
    });

    console.log(`    ✓ ${type} created: ${project.id}`);
    return { id: project.id, name: def.name, models };
  }

  // ── Step 3: Create 5 designs ─────────────────────────────────────
  console.log("── Step 3: Creating 5 designs ──");
  const designDefs = [
    { name: "Modular Gear System", description: "A parametric modular gear system for 3D printing.", link: "https://github.com/example/modular-gear", license: "CC-BY-SA-4.0", tags: ["3d-printing", "mechanical", "parametric"], imageSeed: "modular-gears-3d-printing" },
    { name: "Ergonomic Handle Grip", description: "Ergonomic handle grip with textured surfaces.", link: "https://github.com/example/ergo-handle", license: "GPL-3.0", tags: ["ergonomics", "accessibility", "3d-printing"], imageSeed: "ergonomic-handle-grip-design" },
    { name: "Solar Panel Mount Bracket", description: "Universal solar panel mounting bracket.", link: "https://github.com/example/solar-bracket", license: "CC0-1.0", tags: ["solar", "renewable-energy"], imageSeed: "solar-panel-mounting-bracket" },
    { name: "Bicycle Cargo Rack", description: "Lightweight bicycle cargo rack for most frames.", link: "https://github.com/example/bike-rack", license: "CC-BY-4.0", tags: ["bicycle", "transportation"], imageSeed: "bicycle-cargo-rack-metal" },
    { name: "Desktop Cable Organizer", description: "Modular cable management for desks.", link: "https://github.com/example/cable-organizer", license: "MIT", tags: ["organization", "workspace"], imageSeed: "cable-management-desk-organizer" },
  ];
  for (const def of designDefs) {
    const d = await createProject(aliceAuth, "DESIGN", def);
    results.designs.push({ ...d, processId: null, models: d.models });
  }
  console.log("");

  // ── Step 4: Create 3 services ────────────────────────────────────
  console.log("── Step 4: Creating 3 services ──");
  const serviceDefs = [
    { name: "3D Printing Consultation", description: "Expert 3D printing consultation.", link: "https://example.com/3d-consulting", license: "CC-BY-SA-4.0", tags: ["consulting", "3d-printing"], imageSeed: "3d-printer-filament-colors", serviceFilters: { serviceType: ["Fabrication", "Learning & Education"], availability: ["Booking Required", "Weekends Available"] } },
    { name: "Custom PCB Design Service", description: "Professional PCB design and prototyping.", link: "https://example.com/pcb-design", license: "GPL-3.0", tags: ["electronics", "pcb"], imageSeed: "printed-circuit-board-electronics", serviceFilters: { serviceType: ["Fabrication"], availability: ["Available Now"] } },
    { name: "Sustainable Packaging Consulting", description: "Eco-friendly packaging solutions.", link: "https://example.com/eco-packaging", license: "CC0-1.0", tags: ["sustainability", "packaging"], imageSeed: "sustainable-eco-packaging-nature", serviceFilters: { serviceType: ["Learning & Education"], availability: ["Available Now"] } },
  ];
  for (const def of serviceDefs) {
    const s = await createProject(bobAuth, "SERVICE", def);
    results.services.push({ id: s.id, name: s.name });
  }
  console.log("");

  // ── Step 5: Create 5 products ────────────────────────────────────
  console.log("── Step 5: Creating 5 products ──");
  const productDefs = [
    { name: "Premium Gear Set", description: "High-precision gear set from recycled PLA.", link: "https://github.com/example/premium-gears", license: "CC-BY-SA-4.0", tags: ["gears", "robotics"], designIndex: 0, imageSeed: "precision-gears-mechanical-metal",
      productFilters: { categories: ["Electronics"], powerCompatibility: ["120V AC"], replicability: ["High"], recyclabilityPct: 80, repairability: true, powerRequirementW: 150, energyKwh: 50, co2Kg: 5 } },
    { name: "ErgoGrip Pro Handle", description: "Professional ergonomic handle with dual-material.", link: "https://github.com/example/ergogrip-pro", license: "CC-BY-SA-4.0", tags: ["ergonomics", "tools"], designIndex: 1, imageSeed: "ergonomic-tool-handle-professional",
      productFilters: { categories: ["Tools"], powerCompatibility: ["USB-C"], replicability: ["Medium"], recyclabilityPct: 65, repairability: true, powerRequirementW: 10, energyKwh: 20, co2Kg: 1.5 } },
    { name: "SunMount Universal Bracket", description: "Heavy-duty solar panel bracket.", link: "https://github.com/example/sunmount", license: "CC0-1.0", tags: ["solar", "renewable"], designIndex: 2, imageSeed: "solar-panel-renewable-energy-sun",
      productFilters: { categories: ["Energy"], powerCompatibility: ["220-240V AC"], replicability: ["Low"], recyclabilityPct: 95, repairability: true, powerRequirementW: 500, energyKwh: 200, co2Kg: 10 } },
    { name: "Urban Cargo Rack XL", description: "Extra-large bicycle cargo rack.", link: "https://github.com/example/urban-rack-xl", license: "CC-BY-4.0", tags: ["bicycle", "urban"], designIndex: 3, imageSeed: "bike-cargo-rack-urban-commute",
      productFilters: { categories: ["Furniture"], powerCompatibility: ["USB-C"], replicability: ["Medium"], recyclabilityPct: 90, repairability: true, powerRequirementW: 0, energyKwh: 300, co2Kg: 15 } },
    { name: "DeskMate Cable System", description: "Complete cable management kit.", link: "https://github.com/example/deskmate", license: "MIT", tags: ["desk", "organization"], designIndex: 4, imageSeed: "cable-management-desk-workspace",
      productFilters: { categories: ["Education"], powerCompatibility: ["12V DC"], replicability: ["High"], recyclabilityPct: 70, repairability: true, powerRequirementW: 75, energyKwh: 100, co2Kg: 2.5 } },
  ];
  for (const def of productDefs) {
    const product = await createProject(bobAuth, "PRODUCT", {
      ...def,
      designId: results.designs[def.designIndex].id,
      tags: [...def.tags, ...(def.productFilters?.categories || []).map(c => `category-${slugify(c)}`)],
    });
    results.products.push({ id: product.id, name: product.name, designId: results.designs[def.designIndex].id });
  }
  console.log("");

  // ── Step 6: Create DPPs ──────────────────────────────────────────
  console.log("── Step 6: Creating DPPs ──");
  for (const product of results.products) {
    for (let di = 0; di < 3; di++) {
      const dppName = `DPP #${di + 1} for ${product.name}`;
      try {
        const dpp = await client.dpp.createDpp({
          productId: product.id,
          batchType: di === 0 ? "batch" : "unit",
          productOverview: {
            productName: { type: "Text", value: product.name },
            productDescription: { type: "Text", value: `DPP #${di + 1}` },
          },
        });
        console.log(`    ✓ DPP: ${dpp.insertedID}`);

        await client.resources.createDppResource({ name: dppName, note: `DPP for ${product.name}`, dppUlid: dpp.insertedID });
        results.dpps.push({ dppUlid: dpp.insertedID, productId: product.id });
      } catch (e) { console.log(`    ⚠ DPP failed: ${e.message}`); }
    }
  }
  console.log("");

  // ── Summary ──────────────────────────────────────────────────────
  console.log("═════════════════════════════════════");
  console.log(`  Users:    ${results.users.length}`);
  console.log(`  Designs:  ${results.designs.length}`);
  console.log(`  Services: ${results.services.length}`);
  console.log(`  Products: ${results.products.length}`);
  console.log(`  DPPs:     ${results.dpps.length}`);
  console.log("═════════════════════════════════════");

  writeFileSync(join(__dirname, "results-sdk.json"), JSON.stringify(results, null, 2));
  return results;
}

main()
  .then(() => { console.log("\n✓ Done!"); process.exit(0); })
  .catch(err => { console.error("\n✗ Failed:", err); process.exit(1); });
