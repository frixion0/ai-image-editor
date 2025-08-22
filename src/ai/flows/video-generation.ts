'use server';

/**
 * @fileOverview A video generation AI agent.
 *
 * - generateVideo - A function that handles the video generation process.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt for the video generation.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z
    .string()
    .optional()
    .describe(
      "The generated video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  error: z.string().optional(),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async ({prompt}) => {
    try {
      let {operation} = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });

      if (!operation) {
        return {error: 'The model failed to start a video generation operation.'};
      }

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
      }

      if (operation.error) {
        return {error: `Video generation failed: ${operation.error.message}`};
      }

      const video = operation.output?.message?.content.find(p => !!p.media);
      if (!video?.media?.url) {
        return {error: 'Failed to find the generated video in the operation result.'};
      }

      // The URL is a GCS URL that needs to be fetched with an API key.
      const fetch = (await import('node-fetch')).default;
      const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
      );

      if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        return {error: `Failed to download the generated video. Status: ${videoDownloadResponse.status}`};
      }
      
      const buffer = await videoDownloadResponse.buffer();
      const videoDataUri = `data:video/mp4;base64,${buffer.toString('base64')}`;

      return {videoDataUri};
    } catch (e: any) {
      console.error(e);
      return {error: e.message || 'An unexpected error occurred during video generation.' };
    }
  }
);
