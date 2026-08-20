import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function hasClaudeKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export const CLAUDE_MODEL = "claude-opus-5";
