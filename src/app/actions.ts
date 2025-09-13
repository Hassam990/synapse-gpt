"use server";

import { synapse, SynapseInput } from "@/ai/flows/synapse-flow";

export type AiMode =
  | "conversation"
  | "assistance"
  | "information"
  | "gpt";

export async function invokeAI(mode: AiMode, prompt: string) {
  try {
    const input: SynapseInput = { mode, prompt };
    const result = await synapse(input);
    return { success: true, response: result.response };
  } catch (error) {
    console.error("AI invocation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
