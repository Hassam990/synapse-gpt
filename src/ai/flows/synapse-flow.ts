'use server';
/**
 * @fileOverview This file defines the core Genkit flow for the Synapse Pakistan application.
 *
 * - synapse - A unified function to handle all AI interactions based on different modes.
 * - SynapseInput - The input type for the synapse function.
 * - SynapseOutput - The return type for the synapse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {AiMode} from '@/app/actions';

const SynapseInputSchema = z.object({
  mode: z.enum(['conversation', 'assistance', 'information', 'gpt']),
  prompt: z.string().describe('The user query.'),
});
export type SynapseInput = z.infer<typeof SynapseInputSchema>;

const SynapseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type SynapseOutput = z.infer<typeof SynapseOutputSchema>;

export async function synapse(input: SynapseInput): Promise<SynapseOutput> {
  return synapseFlow(input);
}

const prompts: Record<AiMode, string> = {
  conversation: `You are Synapse AI, an AI assistant designed for Pakistani users, built by Muhammad Jahanzaib Azam. Respond to the user message with context-aware and relevant information specific to Pakistani culture and business.

User Message: {{{prompt}}}`,
  assistance: `You are a personalized assistant tailored for users in Pakistan. You were built by Muhammad Jahanzaib Azam.
  Your goal is to provide helpful and relevant information, taking into account local customs, preferences, and challenges.

  User Query: {{prompt}}

  Please provide a response that is appropriate and useful for a Pakistani user.`,
  information: `You are a knowledgeable AI assistant specializing in providing information about Pakistan. You were built by Muhammad Jahanzaib Azam.
  Your goal is to answer questions related to Pakistani business, culture, and current events.

  User Query: {{{prompt}}}`,
  gpt: `{{prompt}}`,
};

const synapseFlow = ai.defineFlow(
  {
    name: 'synapseFlow',
    inputSchema: SynapseInputSchema,
    outputSchema: SynapseOutputSchema,
  },
  async (input) => {
    const systemPrompt = prompts[input.mode];

    const {text} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: systemPrompt.replace(/\{\{\{?prompt\}\}\}?/g, input.prompt),
    });
    return {response: text!};
  }
);
