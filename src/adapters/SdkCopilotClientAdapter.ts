import { CopilotClient } from "@github/copilot-sdk";
import type { PermissionRequest, PermissionRequestResult } from "@github/copilot-sdk";
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
  private readonly traceEvents: boolean;

  constructor(token?: string, traceEvents = false) {
    const opts = token ? { githubToken: token } : {};
    this.client = new CopilotClient({
      ...opts,
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
      },
    });
    this.traceEvents = traceEvents;
  }

  private getNegotiatedProtocolVersion(): number | undefined {
    type ClientWithProtocolVersion = {
      negotiatedProtocolVersion?: number;
    };

    return (this.client as unknown as ClientWithProtocolVersion).negotiatedProtocolVersion;
  }

  private buildPermissionDecision(_request: PermissionRequest): PermissionRequestResult {
    // The copilot CLI (≥1.0.21) expects "approve-once" (or "approve-for-session").
    // "approved" was the old kind used with CLI <1.0.21 and triggers
    // "unexpected user permission response" in newer CLI versions.
    // The SDK type definition still lists only "approved"; cast via unknown to
    // send the wire value the current CLI actually accepts.
    return { kind: "approve-once" } as unknown as PermissionRequestResult;
  }

  private async handlePermissionRequest(
    request: PermissionRequest,
    invocation: { sessionId: string },
  ): Promise<PermissionRequestResult> {
    const decision = this.buildPermissionDecision(request);

    if (this.traceEvents) {
      const command = typeof request["fullCommandText"] === "string" ? request["fullCommandText"] : undefined;
      const toolName = typeof request["toolName"] === "string" ? request["toolName"] : undefined;
      console.error(
        `[trace permission] ${new Date().toISOString()} ` +
        `kind=${request.kind} tool=${toolName ?? ""} toolCallId=${request.toolCallId ?? ""} ` +
        `session=${invocation.sessionId} protocol=${this.getNegotiatedProtocolVersion() ?? "unknown"} decision=${decision.kind}` +
        `${command ? ` command=${JSON.stringify(command)}` : ""}`
      );
    }

    return decision;
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

  private async enableApproveAll(session: unknown): Promise<void> {
    type SessionWithPermissionsRpc = {
      rpc?: {
        permissions?: {
          setApproveAll?: (params: { enabled: boolean }) => Promise<unknown>;
        };
      };
    };

    const rpcSession = session as SessionWithPermissionsRpc;
    const setApproveAll = rpcSession.rpc?.permissions?.setApproveAll;

    if (!setApproveAll) return;

    await setApproveAll({ enabled: true });
  }

  async createSession(config: CreateSessionOptions): Promise<ISession> {
    // Always route through our handler so we return { kind: "approve-once" }.
    // SDK's built-in approveAll returns { kind: "approved" } which is rejected
    // by copilot CLI ≥1.0.21 with "unexpected user permission response".
    const permissionHandler = (request: PermissionRequest, invocation: { sessionId: string }) =>
      this.handlePermissionRequest(request, invocation);

    const session = await this.client.createSession({
      ...config,
      onPermissionRequest: permissionHandler,
      workingDirectory:    process.cwd(),
    });

    await this.enableApproveAll(session);

    // The SDK session uses a string-overloaded `on()` that TypeScript cannot
    // resolve in generic contexts. We normalise it here to the ISession shape.
    type LooseSession = {
      on(event: string, handler: (e: unknown) => void): () => void;
      on(handler: (e: unknown) => void): () => void;
    };
    const loose = session as unknown as LooseSession;

    return {
      on: (eventOrHandler: string | ((e: unknown) => void), handler?: (e: unknown) => void) =>
        typeof eventOrHandler === "string"
          ? loose.on(eventOrHandler, handler ?? (() => { /* noop */ }))
          : loose.on(eventOrHandler),
      sendAndWait: (payload, timeoutMs) =>
        session.sendAndWait(payload, timeoutMs),
      abort: () => session.abort(),
      destroy: () => session.destroy(),
    };
  }
}
