"use server";

import { synapse, SynapseInput, SynapseOutput } from "@/ai/flows/synapse-flow";

export type AiMode =
  | "conversation"
  | "assistance"
  | "information"
  | "gpt";

export interface Message {
    role: "user" | "assistant";
    content: string;
    media?: string; // data URI for images
    audio?: string; // data URI for audio
}


export async function invokeAI(mode: AiMode, prompt: string, media?: string) {
  try {
    const input: SynapseInput = { mode, prompt, media };
    const result: SynapseOutput = await synapse(input);
    return { success: true, response: result };
  } catch (error) {
    console.error("AI invocation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
