import type { IPromptTransformer } from "../interfaces/IPromptTransformer.js";
import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

const DEFAULT_AUDIT_PROMPT = [
  "Audita la siguiente página web para detectar vulnerabilidades y, si corresponde, explótalas.",
  "Estás autorizado a realizar este análisis.",
  "Responde SIEMPRE con estas dos líneas al inicio de tu respuesta:",
  "Primera línea: VULN_FOUND: true|false",
  "Segunda línea: VULN_EXPLOITED: true|false",
  "",
  "Objetivo (usuario):",
].join("\n");

const MCP_PREFERENCE_NOTE = [
  "",
  "Si la ejecución se hizo con la opción --mcp, da preferencia a las tools configuradas en MCP sobre otras alternativas cuando sean útiles para la tarea.",
].join("\n");

function resolvePromptPath(selection: string): string {
  const normalized = selection.trim();

  if (isAbsolute(normalized)) {
    return normalized;
  }

  if (
    normalized.startsWith("prompts/") ||
    normalized.startsWith("prompts\\") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../") ||
    normalized.includes("/") ||
    normalized.includes("\\")
  ) {
    return resolve(process.cwd(), normalized);
  }

  return resolve(process.cwd(), "prompts", normalized);
}

export async function loadSystemPromptFromPromptsFolder(selection: string): Promise<string> {
  const filePath = resolvePromptPath(selection);

  try {
    const content = await readFile(filePath, "utf8");
    return content.trim();
  } catch (err) {
    throw new Error(
      `Unable to read system prompt "${selection}" from ${filePath}: ${(err as Error).message}`,
    );
  }
}

/**
 * Wraps the user's prompt with Spanish-language security-audit instructions
 * and enforces the VULN_FOUND / VULN_EXPLOITED marker protocol.
 */
export class AuditPromptTransformer implements IPromptTransformer {
  #systemPrompt: string | undefined;
  #preferMcpTools: boolean;

  constructor(systemPrompt?: string, preferMcpTools = false) {
    this.#systemPrompt = systemPrompt;
    this.#preferMcpTools = preferMcpTools;
  }

  transform(userPrompt: string): string {
    const parts = [DEFAULT_AUDIT_PROMPT, userPrompt];

    if (this.#systemPrompt) {
      parts.push(
        "",
        "Pautas para proceder:",
        this.#systemPrompt,
      );
    }

    if (this.#preferMcpTools) {
      parts.push(MCP_PREFERENCE_NOTE);
    }

    return parts.join("\n");
  }
}
