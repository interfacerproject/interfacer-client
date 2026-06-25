/**
 * File hashing and preparation for Zenflows and DPP uploads.
 *
 * Two hashing strategies:
 *   Zenflows: SHA-512 via Zenroom, base64url-encoded result (64KB chunks)
 *   DPP: SHA-256 via Web Crypto API, hex-encoded result
 *
 * Ported from interfacer-gui lib/fileUpload.ts
 */

import { hashFileForZenflows, signFileUpload } from "../crypto/sign";
import { KeyStorage } from "../config/storage";

// ─── Zenflows File Types ─────────────────────────────────────────────

/** File descriptor for Zenflows uploads (post-hashing). */
export interface ZenflowsFile {
  name: string;
  description: string;
  extension: string;
  hash: string;
  mimeType: string;
  size: number;
}

/** File object from GraphQL responses. */
export interface GqlFile {
  name: string;
  hash: string;
  mimeType: string;
  bin?: string;
}

// ─── DPP File Types ──────────────────────────────────────────────────

/** Attachment returned by the DPP upload endpoint. */
export interface DppAttachment {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  size: number;
  checksum: string;
  uploadedAt: string;
}

// ─── Hashing ─────────────────────────────────────────────────────────

/**
 * Hash a file for Zenflows upload.
 * Uses Zenroom SHA-512 in 64KB chunks → base64url encoded.
 */
export async function hashFileForZenflowsUpload(file: File): Promise<string> {
  return hashFileForZenflows(await file.arrayBuffer());
}

/**
 * Hash a file using SHA-256 (Web Crypto API) for DPP uploads.
 * Returns hex-encoded checksum.
 */
export async function hashFileSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── File Preparation ────────────────────────────────────────────────

/**
 * Prepare a single file for Zenflows upload.
 * Hashes the file and returns a ZenflowsFile descriptor.
 */
export async function prepFileForZenflows(file: File): Promise<ZenflowsFile> {
  const hash = await hashFileForZenflowsUpload(file);

  return {
    name: file.name,
    description: file.name,
    extension: file.name.split(".").at(-1) || "",
    hash,
    mimeType: file.type,
    size: file.size,
  };
}

/**
 * Prepare multiple files for Zenflows upload.
 */
export async function prepFilesForZenflows(files: File[]): Promise<ZenflowsFile[]> {
  return Promise.all(files.map(prepFileForZenflows));
}

// ─── Image Utilities ─────────────────────────────────────────────────

export function formatImageSrc(mimeType: string, bin: string): string {
  return `data:${mimeType};base64,${bin}`;
}

export function getResourceImage(images: GqlFile[] | null | undefined): string {
  if (images && images.length > 0 && images[0]) {
    return formatImageSrc(images[0].mimeType, images[0].bin || "");
  }
  return "";
}

// ─── DPP Upload ──────────────────────────────────────────────────────

/**
 * Upload a file to the DPP service.
 * Uses did-sign + did-pk headers for authentication.
 */
export async function uploadFileToDpp(
  file: File,
  dppUrl: string,
  store: KeyStorage
): Promise<DppAttachment> {
  const checksum = await hashFileSHA256(file);
  const signature = await signFileUpload(checksum, store);
  const publicKey = store.getItem("eddsaPublicKey") || "";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${dppUrl}/upload`, {
    method: "POST",
    headers: {
      "did-pk": publicKey,
      "did-sign": signature,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`DPP upload failed: ${err.error || response.statusText}`);
  }

  return response.json();
}

// ─── DPP Model Conversion ────────────────────────────────────────────

export interface ProjectModelMetadata {
  contentType?: string;
  downloadUrl: string;
  extension: string;
  fileName?: string;
  id?: string;
  mimeType?: string;
  name: string;
  size?: number;
  storage: "dpp";
  uploadedAt?: string;
  url: string;
  checksum?: string;
}

export function dppAttachmentToProjectModel(
  attachment: DppAttachment,
  dppBaseUrl: string
): ProjectModelMetadata {
  const url = dppBaseUrl ? `${dppBaseUrl}/file/${encodeURIComponent(attachment.id)}` : attachment.url;

  return {
    contentType: attachment.contentType,
    checksum: attachment.checksum,
    downloadUrl: url,
    extension: attachment.fileName.split(".").pop()?.toLowerCase() || "",
    fileName: attachment.fileName,
    id: attachment.id,
    mimeType: attachment.contentType,
    name: attachment.fileName,
    size: attachment.size,
    storage: "dpp",
    uploadedAt: attachment.uploadedAt,
    url,
  };
}

export async function uploadModelFilesToDpp(
  files: File[],
  dppUrl: string,
  store: KeyStorage
): Promise<ProjectModelMetadata[]> {
  const models: ProjectModelMetadata[] = [];

  for (const file of files) {
    const attachment = await uploadFileToDpp(file, dppUrl, store);
    models.push(dppAttachmentToProjectModel(attachment, dppUrl));
  }

  return models;
}
