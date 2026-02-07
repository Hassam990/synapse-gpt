"use server";

import { synapse, generateAudio, runCode as runCodeFlow } from "@/ai/flows/synapse-flow";
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
    timestamp?: any;
}


export async function invokeAI(systemPrompt: string, messages: Message[]) {
  try {
    const result = await synapse(systemPrompt, messages);
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

export async function executeCode(code: string, language: string, stdin: string) {
    try {
        const result = await runCodeFlow(code, language, stdin);
        return { success: true, response: result };
    } catch (error) {
        console.error("Code execution failed:", error);
        const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
