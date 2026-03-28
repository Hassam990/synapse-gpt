
"use server";

import { synapse, generateAudio, executeCodeInSandbox, generateCodeFromPrompt } from "@/ai/flows/synapse-flow";
import { ai } from "@/ai/genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { Message as GenkitMessage, Part } from "genkit";


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

export async function invokeAI(systemPrompt: string, messages: AiMessage[]): Promise<{ success: boolean; response?: string; error?: string; }> {
  try {
    if (messages.length === 0) {
      throw new Error("Cannot invoke AI with an empty message history.");
    }

    const stream = await synapse(systemPrompt, messages);
    const reader = stream.getReader();
    const decoder = new TextEncoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += new TextDecoder().decode(value);
    }
    
    return { success: true, response: fullResponse };

  } catch (error) {
    console.error("AI invocation failed on the server:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI processing.";
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
        const result = await executeCodeInSandbox(code, language, stdin);
        return { success: true, response: result };
    } catch (error) {
        console.error("Code execution failed:", error);
        const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function generateCode(prompt: string, language: string): Promise<{ success: boolean; response?: { code: string; stdin: string; }; error?: string; }> {
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

export async function generateStudyGuide(slidesContent: string, subject: string = "OOPS"): Promise<{ success: boolean; response?: { test_sheet: any[]; explanations: any[]; }; error?: string; }> {
    try {
        const { generateStudyGuideFromSlides } = await import('@/ai/flows/synapse-flow');
        const result = await generateStudyGuideFromSlides(slidesContent, subject);
        return { success: true, response: result };
    } catch (error) {
        console.error("Study guide generation failed:", error);
        const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
