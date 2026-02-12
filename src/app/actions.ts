
"use server";

import { synapse, generateAudio, executeCodeInSandbox, generateCodeFromPrompt } from "@/ai/flows/synapse-flow";
import { ai } from "@/ai/genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { Message as GenkitMessage, part, Part } from "genkit";


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

    const latestMessage = messages[messages.length - 1];
    const hasMedia = !!latestMessage?.media;

    const modelRef = hasMedia
      ? googleAI.model('gemini-2.5-pro')
      : googleAI.model('gemini-2.5-flash');

    const toGenkitMessages = (msgs: AiMessage[]): GenkitMessage[] => {
      return msgs.map((message) => {
        const parts: Part[] = [];
        parts.push(part.text(message.content || ''));
        if (message.media) {
            parts.push(part.media(message.media));
        }
        return {
          role: message.role === 'user' ? 'user' : 'model',
          parts: parts,
        };
      });
    };

    const genkitMessages = toGenkitMessages(messages);
    const modelHistory = genkitMessages.slice(0, -1);
    const lastMessageParts = genkitMessages[genkitMessages.length - 1].parts;
    
    const result = await ai.generate({
      model: modelRef,
      prompt: lastMessageParts,
      history: modelHistory,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
      system: systemPrompt,
    });

    const textResponse = result?.text;

    if (typeof textResponse !== 'string') {
        throw new Error("AI generation failed. This might be due to a missing API key or a network issue.");
    }
    
    return { success: true, response: textResponse };

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
