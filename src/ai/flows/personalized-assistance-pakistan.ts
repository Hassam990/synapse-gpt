// src/ai/flows/personalized-assistance-pakistan.ts
'use server';

/**
 * @fileOverview Provides personalized assistance tailored for Pakistani users.
 *
 * - personalizedAssistancePakistan - A function that provides personalized assistance to Pakistani users.
 * - PersonalizedAssistancePakistanInput - The input type for the personalizedAssistancePakistan function.
 * - PersonalizedAssistancePakistanOutput - The return type for the personalizedAssistancePakistan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAssistancePakistanInputSchema = z.object({
  query: z.string().describe('The user query or request.'),
  location: z.string().optional().describe('The user\u0027s location in Pakistan, if known.'),
  preferences: z.string().optional().describe('Any specific preferences the user has.'),
});
export type PersonalizedAssistancePakistanInput = z.infer<typeof PersonalizedAssistancePakistanInputSchema>;

const PersonalizedAssistancePakistanOutputSchema = z.object({
  response: z.string().describe('The personalized assistance response.'),
});
export type PersonalizedAssistancePakistanOutput = z.infer<typeof PersonalizedAssistancePakistanOutputSchema>;

export async function personalizedAssistancePakistan(input: PersonalizedAssistancePakistanInput): Promise<PersonalizedAssistancePakistanOutput> {
  return personalizedAssistancePakistanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedAssistancePakistanPrompt',
  input: {schema: PersonalizedAssistancePakistanInputSchema},
  output: {schema: PersonalizedAssistancePakistanOutputSchema},
  prompt: `You are a personalized assistant tailored for users in Pakistan. You were built by Muhammad Jahanzaib Azam.

  Your goal is to provide helpful and relevant information, taking into account local customs, preferences, and challenges.

  Location: {{location}}
  Preferences: {{preferences}}

  User Query: {{query}}

  Please provide a response that is appropriate and useful for a Pakistani user.`,
});

const personalizedAssistancePakistanFlow = ai.defineFlow(
  {
    name: 'personalizedAssistancePakistanFlow',
    inputSchema: PersonalizedAssistancePakistanInputSchema,
    outputSchema: PersonalizedAssistancePakistanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {model: 'googleai/gemini-2.5-flash'});
    return output!;
  }
);
