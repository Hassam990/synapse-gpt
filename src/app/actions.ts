
"use server";

import { synapse, generateAudio, executeCodeInSandbox, generateCodeFromPrompt } from "@/ai/flows/synapse-flow";
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

// New type for serializable messages passed to the AI
export interface AiMessage {
    role: "user" | "assistant";
    content: string;
    media?: string;
}


export async function invokeAI(systemPrompt: string, messages: AiMessage[]) {
  try {
    // The synapse function returns an object { content: ReadableStream }
    const result = await synapse(systemPrompt, messages);
    // We return the stream directly. This is the correct way to handle streaming
    // responses from server actions.
    return result.content;
  } catch (error) {
    console.error("AI invocation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    
    // Instead of throwing, return a stream that immediately errors.
    // This avoids Next.js server action's error serialization issues with thrown errors.
    return new ReadableStream({
      start(controller) {
        controller.error(new Error(errorMessage));
        controller.close();
      },
    });
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
        const result = await executeCodeInSandbox(code, language, stdin);
        return { success: true, response: result };
    } catch (error) {
        console.error("Code execution failed:", error);
        const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function generateCode(prompt: string, language: string) {
    try {
        const result = await generateCodeFromPrompt(prompt, language);
        return { success: true, response: result };
    } catch (error) {
        console.error("Code generation failed:", error);
        const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
