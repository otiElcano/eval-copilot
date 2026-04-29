/** Transforms a raw user prompt before it is sent to the model. */
export interface IPromptTransformer {
  transform(userPrompt: string): string;
}
