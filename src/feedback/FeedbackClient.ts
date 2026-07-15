/**
 * Feedback client — reviews & comments via interfacer-feedback-service REST API.
 *
 * Auth: DID-signed headers (did-sign + did-pk), same pattern as DppClient.
 * Ported from interfacer-gui lib/feedback.ts
 */

import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signDidRequest } from "../crypto/sign";

// ─── Types ───────────────────────────────────────────────────────────

export interface Review {
  id: string;
  project_ulid: string;
  user_ulid: string;
  rating: number; // 1-5
  content?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

export interface Comment {
  id: string;
  project_ulid: string;
  user_ulid: string;
  parent_id?: string | null;
  content: string;
  attachments?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GetReviewsParams {
  limit?: number;
  cursor?: number;
}

export interface GetCommentsParams {
  limit?: number;
  cursor?: number;
  parent_id?: string;
}

// ─── Client ──────────────────────────────────────────────────────────

export class FeedbackClient {
  private baseUrl: string;

  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {
    this.baseUrl = config.feedbackUrl || "";
  }

  private get url(): string {
    if (!this.baseUrl) throw new Error("feedbackUrl not configured");
    return this.baseUrl;
  }

  private get userId(): string | undefined {
    return this.store.getItem("authId") ?? undefined;
  }

  // ─── DID Signing ───────────────────────────────────────────────────

  private async signedHeaders(body?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    const uid = this.userId;
    if (uid) headers["x-user-id"] = uid;

    if (body) {
      const did = await signDidRequest(body, this.store);
      Object.assign(headers, did);
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const json = body != null ? JSON.stringify(body) : undefined;
    const headers = await this.signedHeaders(json ?? undefined);

    const res = await fetch(`${this.url}${path}`, { method, headers, body: json });

    if (!res.ok) {
      let errMsg = res.statusText;
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch { /* ignore */ }
      throw new Error(`Feedback ${method} ${path} failed: ${errMsg}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // ─── Reviews ───────────────────────────────────────────────────────

  /** Create or update a review (1-5 stars + optional text). Auth required. */
  async createReview(projectUlid: string, rating: number, content?: string): Promise<Review> {
    return this.request<Review>(
      "POST",
      `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews`,
      { rating, content: content || null }
    );
  }

  /** Fetch paginated reviews for a project. Public. */
  async getReviews(projectUlid: string, params?: GetReviewsParams): Promise<{ reviews: Review[] }> {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.cursor != null) qs.set("cursor", String(params.cursor));

    const query = qs.toString();
    const path = `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews${query ? `?${query}` : ""}`;
    return this.request<{ reviews: Review[] }>("GET", path);
  }

  /** Fetch aggregated review stats for a project. Public. */
  async getReviewSummary(projectUlid: string): Promise<ReviewSummary> {
    return this.request<ReviewSummary>(
      "GET",
      `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews/summary`
    );
  }

  /** Fetch the current user's review for a project, or null. */
  async getUserReview(projectUlid: string): Promise<{ review: Review | null }> {
    return this.request<{ review: Review | null }>(
      "GET",
      `/api/v1/projects/${encodeURIComponent(projectUlid)}/reviews/mine`
    );
  }

  /** Delete a review by ID. Only the author can delete. Auth required. */
  async deleteReview(reviewId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(
      "DELETE",
      `/api/v1/reviews/${encodeURIComponent(reviewId)}`,
      {}
    );
  }

  // ─── Comments ──────────────────────────────────────────────────────

  /** Post a comment (optionally as a reply to parent_id). Auth required. */
  async createComment(
    projectUlid: string,
    content: string,
    parentId?: string,
    attachments?: string
  ): Promise<Comment> {
    return this.request<Comment>(
      "POST",
      `/api/v1/projects/${encodeURIComponent(projectUlid)}/comments`,
      {
        content,
        parent_id: parentId || null,
        attachments: attachments || null,
      }
    );
  }

  /** Fetch paginated comments for a project. Public. */
  async getComments(projectUlid: string, params?: GetCommentsParams): Promise<{ comments: Comment[] }> {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.cursor != null) qs.set("cursor", String(params.cursor));
    if (params?.parent_id) qs.set("parent_id", params.parent_id);

    const query = qs.toString();
    const path = `/api/v1/projects/${encodeURIComponent(projectUlid)}/comments${query ? `?${query}` : ""}`;
    return this.request<{ comments: Comment[] }>("GET", path);
  }

  /** Soft-delete a comment. Only the author can delete. Auth required. */
  async deleteComment(commentId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(
      "DELETE",
      `/api/v1/comments/${encodeURIComponent(commentId)}`,
      {}
    );
  }
}
