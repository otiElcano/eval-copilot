import type { SessionConfig } from "@github/copilot-sdk";

/** Minimal session surface required by the runner. */
export interface ISession {
  /** Register a named event listener; returns an unsubscribe function. */
  on(event: string, handler: (e: unknown) => void): () => void;
  sendAndWait(
    payload: { prompt: string },
    timeoutMs?: number
  ): Promise<unknown>;
  destroy(): Promise<void>;
}

export interface AuthStatus {
  isAuthenticated: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  capabilities?: { supports?: { reasoningEffort?: boolean } };
  defaultReasoningEffort?: string;
}

/**
 * Subset of SessionConfig that callers supply.
 * SDK-specific housekeeping (onPermissionRequest, workingDirectory) is
 * added by the concrete adapter so business logic stays clean.
 */
export type CreateSessionOptions = Omit<SessionConfig, "onPermissionRequest" | "workingDirectory">;

/** Abstracts the GitHub Copilot SDK client. */
export interface ICopilotClientAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
  getAuthStatus(): Promise<AuthStatus>;
  listModels(): Promise<ModelInfo[]>;
  createSession(config: CreateSessionOptions): Promise<ISession>;
}
