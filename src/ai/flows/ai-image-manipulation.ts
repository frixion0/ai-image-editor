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
  editedPhotoDataUri: z.string().describe('The manipulated photo as a data URI.'),
});
export type AiImageManipulationOutput = z.infer<typeof AiImageManipulationOutputSchema>;

export async function aiImageManipulation(input: AiImageManipulationInput): Promise<AiImageManipulationOutput> {
  return aiImageManipulationFlow(input);
}

const ImageManipulationPromptOutput = z.object({
  image: z.string().describe("The resulting image. THIS IS A REQUIRED FIELD."),
});

const prompt = ai.definePrompt({
  name: 'aiImageManipulationPrompt',
  input: { schema: AiImageManipulationInputSchema },
  output: { schema: ImageManipulationPromptOutput },
  prompt: `You are an expert image editor. Manipulate the image according to the user's instructions.

Instructions: {{{instructions}}}

Return ONLY the manipulated image.

Image to manipulate:
{{media url=photoDataUri}}
`,
});

const aiImageManipulationFlow = ai.defineFlow(
  {
    name: 'aiImageManipulationFlow',
    inputSchema: AiImageManipulationInputSchema,
    outputSchema: AiImageManipulationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output?.image) {
      throw new Error('No manipulated image was generated.');
    }
    
    if (output.image.startsWith('data:')) {
      return {editedPhotoDataUri: output.image};
    }

    return {editedPhotoDataUri: `data:image/png;base64,${output.image}`};
  }
);
