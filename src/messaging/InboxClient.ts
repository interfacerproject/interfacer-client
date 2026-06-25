/**
 * Inbox client — messaging and notifications via signed REST API.
 *
 * Ported from interfacer-gui hooks/useInBox.ts
 */
import { InterfacerConfig } from "../config/config";
import { KeyStorage } from "../config/storage";
import { signGraphQLRequest } from "../crypto/sign";

export interface InboxMessage {
  id: number;
  sender: string;
  content: {
    data: string; // ISO date
    message: unknown;
    subject: string;
  };
  read: boolean;
}

export class InboxClient {
  constructor(
    private config: InterfacerConfig,
    private store: KeyStorage
  ) {}

  /** Sign a request body and return headers + body for POST. */
  private async signedPost(url: string, body: unknown): Promise<Response> {
    const json = JSON.stringify(body);
    const headers = await signGraphQLRequest(json, this.store);

    return fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: json,
    });
  }

  /** Send a message to one or more receivers. */
  async sendMessage(message: unknown, receivers: string[], subject = "Subject"): Promise<void> {
    const userId = this.store.getItem("authId");
    if (!userId) throw new Error("Not authenticated");

    const inboxSend = this.config.inbox?.send;
    if (!inboxSend) throw new Error("inbox.send URL not configured");

    const res = await this.signedPost(inboxSend, {
      sender: userId,
      receivers,
      content: {
        message,
        subject,
        data: new Date().toISOString(),
      },
    });

    if (!res.ok) throw new Error(`Inbox send failed: ${res.statusText}`);
  }

  /** Read messages for the current user. */
  async getMessages(onlyUnread = false): Promise<InboxMessage[]> {
    const userId = this.store.getItem("authId");
    if (!userId) throw new Error("Not authenticated");

    const inboxRead = this.config.inbox?.read;
    if (!inboxRead) throw new Error("inbox.read URL not configured");

    const res = await this.signedPost(inboxRead, {
      request_id: 50,
      receiver: userId,
      only_unread: onlyUnread,
    });

    if (!res.ok) throw new Error(`Inbox read failed: ${res.statusText}`);

    const data = await res.json();
    const messages: InboxMessage[] = data.messages || [];

    // Sort by date descending
    return messages.sort((a, b) =>
      new Date(b.content.data).getTime() - new Date(a.content.data).getTime()
    );
  }

  /** Get the count of unread messages. */
  async getUnreadCount(): Promise<number> {
    const userId = this.store.getItem("authId");
    if (!userId) throw new Error("Not authenticated");

    const countUrl = this.config.inbox?.countUnread;
    if (!countUrl) throw new Error("inbox.countUnread URL not configured");

    const res = await this.signedPost(countUrl, { receiver: userId });

    if (!res.ok) throw new Error(`Inbox count failed: ${res.statusText}`);

    const data = await res.json();
    return data.count || 0;
  }

  /** Mark a message as read. */
  async markRead(messageId: number): Promise<void> {
    const userId = this.store.getItem("authId");
    if (!userId) throw new Error("Not authenticated");

    const setReadUrl = this.config.inbox?.setRead;
    if (!setReadUrl) throw new Error("inbox.setRead URL not configured");

    const res = await this.signedPost(setReadUrl, {
      message_id: messageId,
      receiver: userId,
      read: true,
    });

    if (!res.ok) throw new Error(`Inbox setRead failed: ${res.statusText}`);
  }
}
