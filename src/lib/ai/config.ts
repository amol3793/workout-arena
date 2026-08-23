import { createOpenAI } from "@ai-sdk/openai";

/**
 * AI provider configuration. Uses OpenAI-compatible API.
 * Set OPENAI_API_KEY in .env. Works with OpenAI, Azure OpenAI, or any
 * compatible provider by also setting OPENAI_BASE_URL.
 */
export function getAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return createOpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL,
  });
}

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
