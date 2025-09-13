'use server';
/**
 * @fileOverview This file defines the core Genkit flow for the Synapse Pakistan application.
 *
 * - synapse - A unified function to handle all AI interactions based on different modes.
 * - SynapseInput - The input type for the synapse function.
 * - SynapseOutput - The return type for the synapse function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import type {AiMode} from '@/app/actions';
import wav from 'wav';

const SynapseInputSchema = z.object({
  mode: z.enum(['conversation', 'assistance', 'information', 'gpt']),
  prompt: z.string().describe('The user query.'),
  media: z.string().optional().describe(
    "Optional media file (e.g., image) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type SynapseInput = z.infer<typeof SynapseInputSchema>;

const SynapseOutputSchema = z.object({
  content: z.string().describe('The AI-generated text response.'),
  audio: z.string().optional().describe('The AI-generated audio response as a data URI.'),
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


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const synapseFlow = ai.defineFlow(
  {
    name: 'synapseFlow',
    inputSchema: SynapseInputSchema,
    outputSchema: SynapseOutputSchema,
  },
  async (input) => {
    const systemPrompt = prompts[input.mode];
    const finalPrompt = systemPrompt.replace(/\{\{\{?prompt\}\}\}?/g, input.prompt);
    
    const promptParts = [];
    if (input.media) {
        promptParts.push({ media: { url: input.media } });
    }
    promptParts.push({ text: finalPrompt });

    const [textResult, audioResult] = await Promise.all([
        ai.generate({
            model: googleAI.model('gemini-2.5-flash'),
            prompt: promptParts,
        }),
        ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' },
                    },
                },
            },
            prompt: input.prompt,
        })
    ]);

    const content = textResult.text!;
    
    let audioDataUri: string | undefined = undefined;
    if (audioResult.media) {
        const audioBuffer = Buffer.from(
            audioResult.media.url.substring(audioResult.media.url.indexOf(',') + 1),
            'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    }

    return { content, audio: audioDataUri };
  }
);
