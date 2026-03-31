import { CopilotClient, approveAll } from "@github/copilot-sdk";
import type {
  ICopilotClientAdapter,
  ISession,
  AuthStatus,
  ModelInfo,
  CreateSessionOptions,
} from "../interfaces/ICopilotClientAdapter.js";

/**
 * Wraps CopilotClient (and its sessions) behind ICopilotClientAdapter.
 * All SDK-specific casts and loose-typed workarounds are confined here.
 */
export class SdkCopilotClientAdapter implements ICopilotClientAdapter {
  private readonly client: CopilotClient;

  constructor(token?: string) {
    const opts = token ? { githubToken: token } : {};
    this.client = new CopilotClient(opts);
  }

  async start(): Promise<void> {
    await this.client.start();
  }

  async stop(): Promise<void> {
    await this.client.stop();
  }

  async getAuthStatus(): Promise<AuthStatus> {
    const status = await this.client.getAuthStatus();
    return { isAuthenticated: status.isAuthenticated };
  }

  async listModels(): Promise<ModelInfo[]> {
    const raw = await this.client.listModels();
    // The SDK type does not expose capabilities; cast via unknown.
    return raw as unknown as ModelInfo[];
  }

  async createSession(config: CreateSessionOptions): Promise<ISession> {
    const session = await this.client.createSession({
      ...config,
      // SDK-specific concerns confined to the adapter (DIP)
      onPermissionRequest: approveAll,
      workingDirectory:    process.cwd(),
    });

    // The SDK session uses a string-overloaded `on()` that TypeScript cannot
    // resolve in generic contexts. We normalise it here to the ISession shape.
    type LooseSession = { on(event: string, handler: (e: unknown) => void): () => void };
    const loose = session as unknown as LooseSession;

    return {
      on: (event, handler) => loose.on(event, handler),
      sendAndWait: (payload, timeoutMs) =>
        session.sendAndWait(payload, timeoutMs),
      destroy: () => session.destroy(),
    };
  }
}
