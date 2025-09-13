'use server';
/**
 * @fileOverview Implements the Intelligent Conversation flow for the Synapse Pakistan application.
 *
 * - intelligentConversation - A function that facilitates real-time intelligent conversations with the AI.
 * - IntelligentConversationInput - The input type for the intelligentConversation function.
 * - IntelligentConversationOutput - The return type for the intelligentConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentConversationInputSchema = z.object({
  message: z.string().describe('The user message to be processed by the AI.'),
});
export type IntelligentConversationInput = z.infer<typeof IntelligentConversationInputSchema>;

const IntelligentConversationOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});
export type IntelligentConversationOutput = z.infer<typeof IntelligentConversationOutputSchema>;

export async function intelligentConversation(input: IntelligentConversationInput): Promise<IntelligentConversationOutput> {
  return intelligentConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentConversationPrompt',
  input: {schema: IntelligentConversationInputSchema},
  output: {schema: IntelligentConversationOutputSchema},
  prompt: `You are Synapse AI, an AI assistant designed for Pakistani users, built by Muhammad Jahanzaib Azam. Respond to the user message with context-aware and relevant information specific to Pakistani culture and business.

User Message: {{{message}}}`,
});

const intelligentConversationFlow = ai.defineFlow(
  {
    name: 'intelligentConversationFlow',
    inputSchema: IntelligentConversationInputSchema,
    outputSchema: IntelligentConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {model: 'googleai/gemini-2.5-flash'});
    return output!;
  }
);
