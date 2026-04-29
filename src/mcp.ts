import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { MCPLocalServerConfig, MCPRemoteServerConfig, MCPServerConfig } from "@github/copilot-sdk";


interface MCPServerEntry {
  [name: string]: MCPLocalServerConfig | MCPRemoteServerConfig;
}

interface MCPConfig {
  servers: MCPServerEntry;
}

export interface ParsedMCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
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

  for (const [name, server] of Object.entries(config.servers)) {
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

    // Normalize tools: SDK requires string[], "*" or absent defaults to ["*"].
    const normalizedServer = { ...s } as Record<string, unknown>;
    if (normalizedServer["tools"] === "*" || normalizedServer["tools"] === undefined) {
      normalizedServer["tools"] = ["*"];
    } else if (!Array.isArray(normalizedServer["tools"])) {
      normalizedServer["tools"] = [];
    }

    mcpServers[name] = normalizedServer as unknown as MCPServerConfig;
  }

  return { mcpServers };
}
