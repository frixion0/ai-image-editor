// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered image manipulation flow.
 *
 * - aiImageManipulation - A function that handles adding objects to an image or changing colors using AI.
 * - AiImageManipulationInput - The input type for the aiImageManipulation function.
 * - AiImageManipulationOutput - The return type for the aiImageManipulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiImageManipulationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be manipulated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  instructions: z.string().describe('Instructions for manipulating the image (e.g., add a cat, change the sky to blue).'),
});
export type AiImageManipulationInput = z.infer<typeof AiImageManipulationInputSchema>;

const AiImageManipulationOutputSchema = z.object({
  editedPhotoDataUri: z.string().optional().describe('The manipulated photo as a data URI.'),
  error: z.string().optional(),
});
export type AiImageManipulationOutput = z.infer<typeof AiImageManipulationOutputSchema>;

export async function aiImageManipulation(input: AiImageManipulationInput): Promise<AiImageManipulationOutput> {
  return aiImageManipulationFlow(input);
}

const aiImageManipulationFlow = ai.defineFlow(
  {
    name: 'aiImageManipulationFlow',
    inputSchema: AiImageManipulationInputSchema,
    outputSchema: AiImageManipulationOutputSchema,
  },
  async (input) => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: input.instructions},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        return {error: 'The AI failed to generate an image. This might be due to safety settings or other restrictions. Please try a different prompt.'};
      }
      
      if (media.url.startsWith('data:')) {
        return {editedPhotoDataUri: media.url};
      }

      return {editedPhotoDataUri: `data:${media.contentType};base64,${media.url}`};
    } catch (e) {
      console.error(e);
      return {error: 'An unexpected error occurred during image manipulation.' };
    }
  }
);
