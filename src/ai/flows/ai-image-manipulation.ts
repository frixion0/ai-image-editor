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
      "A photo to be manipulated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  instructions: z.string().describe('Instructions for manipulating the image (e.g., add a cat, change the sky to blue).'),
});
export type AiImageManipulationInput = z.infer<typeof AiImageManipulationInputSchema>;

const AiImageManipulationOutputSchema = z.object({
  editedPhotoDataUri: z.string().describe('The manipulated photo as a data URI.'),
});
export type AiImageManipulationOutput = z.infer<typeof AiImageManipulationOutputSchema>;

export async function aiImageManipulation(input: AiImageManipulationInput): Promise<AiImageManipulationOutput> {
  return aiImageManipulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiImageManipulationPrompt',
  input: {schema: AiImageManipulationInputSchema},
  output: {schema: AiImageManipulationOutputSchema},
  prompt: `You are an AI image manipulation expert.

You will take the provided image and modify it based on the user's instructions.

Instructions: {{{instructions}}}

Original Photo: {{media url=photoDataUri}}

Return the modified image as a data URI.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const aiImageManipulationFlow = ai.defineFlow(
  {
    name: 'aiImageManipulationFlow',
    inputSchema: AiImageManipulationInputSchema,
    outputSchema: AiImageManipulationOutputSchema,
  },
  async input => {
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
    return {editedPhotoDataUri: media!.url!};
  }
);
