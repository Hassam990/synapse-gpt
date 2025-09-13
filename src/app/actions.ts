"use server";

import {
  easyAccessGPT,
  EasyAccessGPTInput,
} from "@/ai/flows/easy-access-gpt";
import {
  getPakistaniInformation,
  GetPakistaniInformationInput,
} from "@/ai/flows/pakistani-information-tool";
import {
  intelligentConversation,
  IntelligentConversationInput,
} from "@/ai/flows/intelligent-conversation";
import {
  personalizedAssistancePakistan,
  PersonalizedAssistancePakistanInput,
} from "@/ai/flows/personalized-assistance-pakistan";

export type AiMode =
  | "conversation"
  | "assistance"
  | "information"
  | "gpt";

export async function invokeAI(mode: AiMode, prompt: string) {
  try {
    switch (mode) {
      case "conversation": {
        const input: IntelligentConversationInput = { message: prompt };
        const result = await intelligentConversation(input);
        return { success: true, response: result.response };
      }
      case "assistance": {
        const input: PersonalizedAssistancePakistanInput = { query: prompt };
        const result = await personalizedAssistancePakistan(input);
        return { success: true, response: result.response };
      }
      case "information": {
        const input: GetPakistaniInformationInput = { query: prompt };
        const result = await getPakistaniInformation(input);
        return { success: true, response: result.information };
      }
      case "gpt": {
        const input: EasyAccessGPTInput = { query: prompt };
        const result = await easyAccessGPT(input);
        return { success: true, response: result.response };
      }
      default:
        throw new Error(`Unknown AI mode: ${mode}`);
    }
  } catch (error) {
    console.error("AI invocation failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
