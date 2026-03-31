import type { IPromptTransformer } from "../interfaces/IPromptTransformer.js";

/**
 * No-op transformer — passes the prompt through unchanged.
 * Use this for generic (non-audit) eval runs.
 */
export class IdentityPromptTransformer implements IPromptTransformer {
  transform(userPrompt: string): string {
    return userPrompt;
  }
}
