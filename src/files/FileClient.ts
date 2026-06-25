/**
 * File client — upload, prepare, and proxy files for Zenflows and DPP.
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import {
  GqlFile,
  ZenflowsFile,
  dppAttachmentToProjectModel,
  prepFilesForZenflows,
  uploadFileToDpp,
  uploadModelFilesToDpp,
} from "./hashing";
import type { DppAttachment, ProjectModelMetadata } from "./hashing";

export class FileClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {}

  // ─── Hashing ───────────────────────────────────────────────────────

  hashFileForZenflows = (file: File) => import("./hashing").then(m => m.hashFileForZenflowsUpload(file));
  hashFileSHA256 = (file: File) => import("./hashing").then(m => m.hashFileSHA256(file));

  // ─── Zenflows Upload ───────────────────────────────────────────────

  /** Prepare files for Zenflows (hash + descriptor). */
  async prepFilesForZenflows(files: File[]): Promise<ZenflowsFile[]> {
    return prepFilesForZenflows(files);
  }

  /** Upload a file to the Zenflows file storage endpoint. */
  async uploadToZenflows(file: File): Promise<void> {
    const hash = await import("./hashing").then(m => m.hashFileForZenflowsUpload(file));

    const formData = new FormData();
    formData.append(hash, file);

    const url = this.config.zenflowsFileUrl;
    if (!url) throw new Error("zenflowsFileUrl not configured");

    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Zenflows upload failed: ${res.statusText}`);
  }

  /** Upload multiple files to Zenflows. */
  async uploadToZenflowsBatch(files: File[]): Promise<void> {
    for (const file of files) {
      await this.uploadToZenflows(file);
    }
  }

  /** Get the proxy URL for a file by its hash. */
  getFileUrl(hash: string): string {
    return `/api/file/${hash}`;
  }

  /** Get a data URL for a file from its GraphQL response. */
  getImageSrc(image: GqlFile): string {
    if (image.bin) {
      return `data:${image.mimeType};base64,${image.bin}`;
    }
    return this.getFileUrl(image.hash);
  }

  // ─── DPP Upload ────────────────────────────────────────────────────

  /** Upload a file to the DPP service. */
  async uploadToDpp(file: File): Promise<DppAttachment> {
    const dppUrl = this.config.dppUrl;
    if (!dppUrl) throw new Error("dppUrl not configured");
    return uploadFileToDpp(file, dppUrl, this.store);
  }

  /** Upload multiple model files to DPP and convert to project model metadata. */
  async uploadModelsToDpp(files: File[]): Promise<ProjectModelMetadata[]> {
    const dppUrl = this.config.dppUrl;
    if (!dppUrl) throw new Error("dppUrl not configured");
    return uploadModelFilesToDpp(files, dppUrl, this.store);
  }

  /** Convert a DPP attachment to project model metadata. */
  dppAttachmentToProjectModel(attachment: DppAttachment): ProjectModelMetadata {
    return dppAttachmentToProjectModel(attachment, this.config.dppUrl || "");
  }
}
