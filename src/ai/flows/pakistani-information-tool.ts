'use server';

/**
 * @fileOverview A flow that accesses information and tools specific to Pakistan.
 *
 * - getPakistaniInformation - A function that retrieves Pakistani-specific information.
 * - GetPakistaniInformationInput - The input type for the getPakistaniInformation function.
 * - GetPakistaniInformationOutput - The return type for the getPakistaniInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPakistaniInformationInputSchema = z.object({
  query: z.string().describe('The query for Pakistani-specific information.'),
});
export type GetPakistaniInformationInput = z.infer<typeof GetPakistaniInformationInputSchema>;

const GetPakistaniInformationOutputSchema = z.object({
  information: z.string().describe('The relevant information about Pakistan.'),
});
export type GetPakistaniInformationOutput = z.infer<typeof GetPakistaniInformationOutputSchema>;

export async function getPakistaniInformation(
  input: GetPakistaniInformationInput
): Promise<GetPakistaniInformationOutput> {
  return pakistaniInformationFlow(input);
}

const pakistaniInformationPrompt = ai.definePrompt({
  name: 'pakistaniInformationPrompt',
  input: {schema: GetPakistaniInformationInputSchema},
  output: {schema: GetPakistaniInformationOutputSchema},
  prompt: `You are a knowledgeable AI assistant specializing in providing information about Pakistan.
  Your goal is to answer questions related to Pakistani business, culture, and current events.

  User Query: {{{query}}}
  `,
});

const pakistaniInformationFlow = ai.defineFlow(
  {
    name: 'pakistaniInformationFlow',
    inputSchema: GetPakistaniInformationInputSchema,
    outputSchema: GetPakistaniInformationOutputSchema,
  },
  async input => {
    const {output} = await pakistaniInformationPrompt(input, {
      model: 'googleai/gemini-2.5-flash',
    });
    return output!;
  }
);
