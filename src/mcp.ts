import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { MCPServerConfig } from "@github/copilot-sdk";
import type { MCPConfig } from "./types.js";

export interface ParsedMCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
  /** Names of all explicitly-listed tools across all servers.
   *  Empty set means at least one server uses "*" (all tools are MCP tools). */
  toolNames: Set<string>;
  /** True when any server declares tools: "*" */
  hasWildcard: boolean;
}

export async function parseMCPConfig(filePath: string): Promise<ParsedMCPConfig> {
  const absolutePath = resolve(filePath);
  let raw: string;

  try {
    raw = await readFile(absolutePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Cannot read MCP config file at "${absolutePath}": ${(err as Error).message}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `MCP config file at "${absolutePath}" is not valid JSON: ${(err as Error).message}`
    );
  }

  if (typeof parsed !== "object" || parsed === null || !("servers" in parsed)) {
    throw new Error(
      `MCP config file must have a top-level "servers" object. Got: ${JSON.stringify(parsed)}`
    );
  }

  const config = parsed as MCPConfig;

  if (typeof config.servers !== "object" || config.servers === null) {
    throw new Error(`MCP config "servers" must be an object.`);
  }

  const mcpServers: Record<string, MCPServerConfig> = {};
  const toolNames = new Set<string>();
  let hasWildcard = false;

  for (const [name, server] of Object.entries(config.servers)) {
    // Validate required fields depending on type
    const s = server as unknown as Record<string, unknown>;
    const serverType = (s["type"] as string | undefined) ?? "local";

    if (serverType === "local" || serverType === "stdio") {
      if (typeof s["command"] !== "string") {
        throw new Error(`MCP server "${name}" must have a "command" string.`);
      }
      if (!Array.isArray(s["args"])) {
        throw new Error(`MCP server "${name}" must have an "args" array.`);
      }
    } else if (serverType === "http" || serverType === "sse") {
      if (typeof s["url"] !== "string") {
        throw new Error(`MCP server "${name}" (type: ${serverType}) must have a "url" string.`);
      }
    }

    // Collect tool names for the --disable-native-tools hook
    const tools = s["tools"] as string | string[] | undefined;
    if (tools === "*") {
      hasWildcard = true;
    } else if (Array.isArray(tools)) {
      for (const t of tools) {
        if (typeof t === "string") toolNames.add(t);
      }
    }

    mcpServers[name] = server as MCPServerConfig;
  }

  return { mcpServers, toolNames, hasWildcard };
}
