/**
 * DPP client — Digital Product Passport REST API operations.
 *
 * All DPP endpoints are authenticated with did-sign + did-pk headers.
 * Ported from interfacer-gui lib/dpp.ts
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signDidRequest } from "../crypto/sign";
import { hashFileSHA256 } from "../files/hashing";
import type { Attachment, CreateDppResponse, DppDocument, DppStatus, ListDppsFilters, ListDppsResponse, UpdateDppResponse } from "./types";

export class DppClient {
  private baseUrl: string;

  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {
    this.baseUrl = config.dppUrl || "";
  }

  private get dppUrl(): string {
    if (!this.baseUrl) throw new Error("dppUrl not configured");
    return this.baseUrl;
  }

  /** Sign a request body and return DID headers + x-user-id. */
  private async signedRequest(body?: unknown): Promise<Record<string, string>> {
    const json = body != null ? JSON.stringify(body) : "";
    const didHeaders = json ? await signDidRequest(json, this.store) : {} as Record<string, string>;

    const headers: Record<string, string> = { ...didHeaders };
    const userId = this.store.getItem("authId");
    if (userId) headers["x-user-id"] = userId;
    if (json) headers["Content-Type"] = "application/json";

    return headers;
  }

  /**
   * Sign a body-less request (DELETE) by signing the object id string. The
   * DPP service reconstructs the signed bytes from the path id, so the
   * signature is bound to exactly this object (cross-service authz contract
   * §2). Returns DID headers plus x-user-id as a logged hint the server does
   * not trust for the principal.
   */
  private async signedIdRequest(id: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...(await signDidRequest(id, this.store)) };
    const userId = this.store.getItem("authId");
    if (userId) headers["x-user-id"] = userId;
    return headers;
  }

  /** Throw a uniform error for a non-ok DPP response. */
  private async ensureOk(res: Response, method: string, path: string): Promise<void> {
    if (res.ok) return;
    let errMsg = res.statusText;
    try {
      const err = await res.json();
      errMsg = err.error || errMsg;
    } catch { /* ignore */ }
    throw new Error(`DPP ${method} ${path} failed: ${errMsg}`);
  }

  /** Generic request helper. */
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.dppUrl}${path}`;
    const headers = await this.signedRequest(body);
    const jsonBody = body != null ? JSON.stringify(body) : undefined;

    const res = await fetch(url, { method, headers, body: jsonBody });
    await this.ensureOk(res, method, path);

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  /** DELETE a body-less resource, signing the given object id. */
  private async deleteSigned(path: string, signId: string): Promise<void> {
    const res = await fetch(`${this.dppUrl}${path}`, {
      method: "DELETE",
      headers: await this.signedIdRequest(signId),
    });
    await this.ensureOk(res, "DELETE", path);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────

  async createDpp(data: Omit<DppDocument, "id">): Promise<CreateDppResponse> {
    return this.request("POST", "/dpp", data);
  }

  async getDpp(id: string): Promise<DppDocument> {
    return this.request("GET", `/dpp/${encodeURIComponent(id)}`);
  }

  async updateDpp(id: string, data: Partial<DppDocument>): Promise<UpdateDppResponse> {
    return this.request("PUT", `/dpp/${encodeURIComponent(id)}`, data);
  }

  async deleteDpp(id: string): Promise<void> {
    return this.deleteSigned(`/dpp/${encodeURIComponent(id)}`, id);
  }

  // ─── List / Query ──────────────────────────────────────────────────

  async listDpps(filters?: ListDppsFilters): Promise<ListDppsResponse> {
    const params = new URLSearchParams();
    if (filters?.productId) params.set("productId", filters.productId);
    if (filters?.createdBy) params.set("createdBy", filters.createdBy);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.q) params.set("q", filters.q);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters?.limit != null) params.set("limit", String(filters.limit));
    if (filters?.offset != null) params.set("offset", String(filters.offset));

    const qs = params.toString();
    return this.request("GET", qs ? `/dpps?${qs}` : "/dpps");
  }

  async updateDppStatus(id: string, status: DppStatus): Promise<UpdateDppResponse> {
    return this.request("PUT", `/dpp/${encodeURIComponent(id)}/status`, { status });
  }

  // ─── QR Code ───────────────────────────────────────────────────────

  getQrCodeUrl(dppId: string, size?: number): string {
    const params = size ? `?size=${size}` : "";
    return `${this.dppUrl}/dpp/${encodeURIComponent(dppId)}/qr${params}`;
  }

  // ─── Attachments ───────────────────────────────────────────────────

  async addAttachment(dppId: string, section: string, file: File): Promise<Attachment> {
    const checksum = await hashFileSHA256(file);
    const signHeaders = await signDidRequest(checksum, this.store);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${this.dppUrl}/dpp/${encodeURIComponent(dppId)}/attachments?section=${encodeURIComponent(section)}`,
      {
        method: "POST",
        headers: {
          "did-pk": signHeaders["did-pk"],
          "did-sign": signHeaders["did-sign"],
        },
        body: formData,
      }
    );

    if (!res.ok) {
      let errMsg = res.statusText;
      try { const err = await res.json(); errMsg = err.error || errMsg; } catch { /* ignore */ }
      throw new Error(`DPP attachment upload failed: ${errMsg}`);
    }

    return res.json();
  }

  async deleteAttachment(dppId: string, attachmentId: string): Promise<void> {
    // The DPP service binds the signature to the DPP object id (the :id path
    // param), so sign dppId, not attachmentId.
    return this.deleteSigned(
      `/dpp/${encodeURIComponent(dppId)}/attachments/${encodeURIComponent(attachmentId)}`,
      dppId
    );
  }

  /** Get the file download URL for an attachment. */
  getFileUrl(fileId: string): string {
    return `${this.dppUrl}/file/${encodeURIComponent(fileId)}`;
  }
}
