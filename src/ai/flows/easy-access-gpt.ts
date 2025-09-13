'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing easy access to a fully powered Generative Pre-trained Transformer.
 *
 * - easyAccessGPT - A function that allows users to interact with a GPT model without limitations.
 * - EasyAccessGPTInput - The input type for the easyAccessGPT function, which is a simple text query.
 * - EasyAccessGPTOutput - The return type for the easyAccessGPT function, which is the GPT model's text response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EasyAccessGPTInputSchema = z.object({
  query: z.string().describe('The user query to be passed to the GPT model.'),
});
export type EasyAccessGPTInput = z.infer<typeof EasyAccessGPTInputSchema>;

const EasyAccessGPTOutputSchema = z.object({
  response: z.string().describe('The GPT model generated response.'),
});
export type EasyAccessGPTOutput = z.infer<typeof EasyAccessGPTOutputSchema>;

export async function easyAccessGPT(input: EasyAccessGPTInput): Promise<EasyAccessGPTOutput> {
  return easyAccessGPTFlow(input);
}

const easyAccessGPTFlow = ai.defineFlow(
  {
    name: 'easyAccessGPTFlow',
    inputSchema: EasyAccessGPTInputSchema,
    outputSchema: EasyAccessGPTOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: input.query,
    });
    return {response: text!};
  }
);
