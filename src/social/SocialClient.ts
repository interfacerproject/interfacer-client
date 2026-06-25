/**
 * Social client — ActivityPub-based likes and follows via signed REST API.
 *
 * Ported from interfacer-gui hooks/useSocial.ts
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";

export class SocialClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {}

  private get personBase(): string {
    const base = this.config.social?.personBase;
    if (!base) throw new Error("social.personBase URL not configured");
    return base;
  }

  private get erBase(): string {
    const base = this.config.social?.economicResourceBase;
    if (!base) throw new Error("social.economicResourceBase URL not configured");
    return base;
  }

  private get userId(): string {
    const id = this.store.getItem("authId");
    if (!id) throw new Error("Not authenticated");
    return id;
  }

  /** Post an ActivityStreams activity to the user's outbox. */
  private async postActivity(activity: Record<string, unknown>): Promise<void> {
    const body = JSON.stringify(activity);
    const headers = await signGraphQLRequest(body, this.store);

    const res = await fetch(`${this.personBase}/${this.userId}/outbox`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) throw new Error(`ActivityPub post failed: ${res.statusText}`);
  }

  /** Like a resource. */
  async likeResource(resourceId: string): Promise<void> {
    await this.postActivity({
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Like",
      actor: `${this.personBase}/${this.userId}`,
      object: `${this.erBase}/${resourceId}`,
      published: new Date().toISOString(),
    });
  }

  /** Follow (watch) a resource. */
  async followResource(resourceId: string): Promise<void> {
    await this.postActivity({
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Follow",
      actor: `${this.personBase}/${this.userId}`,
      object: `${this.erBase}/${resourceId}`,
      published: new Date().toISOString(),
    });
  }

  /** Get the list of resource IDs the current user has liked. */
  async getLikes(): Promise<string[]> {
    const res = await fetch(`${this.personBase}/${this.userId}/liked`);
    const data = await res.json();

    const likes: string[] = [];
    for (const item of data.data?.items || []) {
      const likeRes = await fetch(item);
      const likeData = await likeRes.json();
      const object = likeData.data?.object || "";
      likes.push(object.split("economicresource/")[1] || object);
    }

    return likes.filter(Boolean);
  }

  /** Check if the current user liked a resource. */
  async isLiked(resourceId: string): Promise<boolean> {
    const likes = await this.getLikes();
    return likes.includes(resourceId);
  }

  /** Get the list of follower IDs for a resource. */
  async getFollowers(resourceId: string): Promise<string[]> {
    const res = await fetch(`${this.erBase}/${resourceId}/follower`);
    const data = await res.json();

    return (data.data || []).map((f: string) => f.split("person/")[1] || f).filter(Boolean);
  }

  /** Get the list of resources the current user is following. */
  async getFollowing(): Promise<string[]> {
    const res = await fetch(`${this.personBase}/${this.userId}/following`);
    const data = await res.json();

    return (data.data || []).map((f: string) => f.split("economicresource/")[1] || f).filter(Boolean);
  }

  /** Check if the current user is following a resource. */
  async isFollowing(resourceId: string): Promise<boolean> {
    const followers = await this.getFollowers(resourceId);
    return followers.includes(this.userId);
  }
}
