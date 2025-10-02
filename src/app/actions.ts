"use server";

import { synapse, generateAudio } from "@/ai/flows/synapse-flow";
import { prompts, type Language } from "./prompts";
export type AiMode =
  | "conversation"
  | "assistance"
  | "information"
  | "gpt";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    media?: string; // data URI for images
    audio?: string; // data URI for audio
}


export async function invokeAI(mode: AiMode, prompt: string, language: Language, media?: string) {
  try {
    const systemPrompt = prompts[mode](language);
    const result = await synapse(systemPrompt, prompt, media);
    return { success: true, response: result };
  } catch (error) {
    console.error("AI invocation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function generateAudioAction(text: string) {
  try {
    const result = await generateAudio(text);
    return { success: true, response: result };
  } catch (error) {
    console.error("Audio generation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
