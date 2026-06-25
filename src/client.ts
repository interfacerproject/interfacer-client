/**
 * Main entry point — InterfacerClient facade.
 *
 * Wires together all sub-clients with shared configuration and signing.
 * This is the primary API surface most consumers will use.
 */
import { AuthClient } from "./auth/AuthClient";
import { InterfacerConfig } from "./config/config";
import { KeyStorage, createLocalStorageAdapter, createMemoryStorage } from "./config/storage";
import { DppClient } from "./dpp/DppClient";
import { FileClient } from "./files/FileClient";
import { GraphQLClient } from "./graphql/GraphQLClient";
import { ImportClient } from "./import/ImportClient";
import { InboxClient } from "./messaging/InboxClient";
import { ResourceClient } from "./resources/ResourceClient";
import { SocialClient } from "./social/SocialClient";
import { TaggingClient } from "./tagging/TaggingClient";
import { WalletClient } from "./wallet/WalletClient";

export class InterfacerClient {
  readonly config: InterfacerConfig;
  readonly store: KeyStorage;

  // Sub-clients (lazily initialized)
  private _graphql?: GraphQLClient;
  private _auth?: AuthClient;
  private _resources?: ResourceClient;
  private _files?: FileClient;
  private _dpp?: DppClient;
  private _inbox?: InboxClient;
  private _wallet?: WalletClient;
  private _social?: SocialClient;
  private _tagging?: TaggingClient;
  private _import?: ImportClient;

  constructor(config: InterfacerConfig, store?: KeyStorage) {
    this.config = config;
    this.store = store ?? createLocalStorageAdapter() ?? createMemoryStorage();
  }

  // ─── Lazy accessors ───────────────────────────────────────────────

  get graphql(): GraphQLClient {
    return (this._graphql ??= new GraphQLClient(this.config, this.store));
  }

  get auth(): AuthClient {
    return (this._auth ??= new AuthClient(this.config, this.store, this.graphql));
  }

  get resources(): ResourceClient {
    return (this._resources ??= new ResourceClient(this.config, this.store, this.graphql));
  }

  get files(): FileClient {
    return (this._files ??= new FileClient(this.config, this.store));
  }

  get dpp(): DppClient {
    return (this._dpp ??= new DppClient(this.config, this.store));
  }

  get inbox(): InboxClient {
    return (this._inbox ??= new InboxClient(this.config, this.store));
  }

  get wallet(): WalletClient {
    return (this._wallet ??= new WalletClient(this.config, this.store));
  }

  get social(): SocialClient {
    return (this._social ??= new SocialClient(this.config, this.store));
  }

  get tagging(): TaggingClient {
    return (this._tagging ??= new TaggingClient());
  }

  get import(): ImportClient {
    return (this._import ??= new ImportClient(this.config));
  }

  // ─── High-level composite operations ───────────────────────────────

  /**
   * Full registration flow:
   * 1. Request HMAC from server
   * 2. Derive keys from challenges
   * 3. Register user on Zenflows
   * 4. Login (verify)
   */
  async register(params: {
    name: string;
    username: string;
    email: string;
    challenges: {
      whereParentsMet: string;
      nameFirstPet: string;
      nameFirstTeacher: string;
      whereHomeTown: string;
      nameMotherMaid: string;
    };
  }): Promise<void> {
    const hmac = await this.auth.requestHmac(params.email, true);
    await this.auth.deriveKeys(params.challenges, params.email, hmac);
    await this.auth.registerUser({
      name: params.name,
      user: params.username,
      email: params.email,
    });
    await this.auth.login({ email: params.email });
  }

  /**
   * Check if a user is currently authenticated (has keys in storage).
   */
  isAuthenticated(): boolean {
    const pk = this.store.getItem("eddsaPrivateKey");
    const email = this.store.getItem("authEmail");
    return Boolean(pk) && Boolean(email);
  }

  /**
   * Get the currently stored EdDSA public key.
   */
  getPublicKey(): string | null {
    return this.store.getItem("eddsaPublicKey") ?? null;
  }
}
