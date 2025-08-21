'use server';

/**
 * @fileOverview Allows recoloring of images, either greyscale or selective color changes.
 *
 * - recolorImage - Function to handle the image recoloring process.
 * - RecolorImageInput - Input type for the recolorImage function.
 * - RecolorImageOutput - Return type for the recolorImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecolorImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  recolorPrompt: z.string().describe('Instructions for recoloring the image.'),
});
export type RecolorImageInput = z.infer<typeof RecolorImageInputSchema>;

const RecolorImageOutputSchema = z.object({
  recoloredPhotoDataUri:
    z
      .string()
      .describe("The recolored photo, as a data URI with MIME type and Base64 encoding."),
});
export type RecolorImageOutput = z.infer<typeof RecolorImageOutputSchema>;

export async function recolorImage(input: RecolorImageInput): Promise<RecolorImageOutput> {
  return recolorImageFlow(input);
}

const recolorImagePrompt = ai.definePrompt({
  name: 'recolorImagePrompt',
  input: {schema: RecolorImageInputSchema},
  output: {schema: RecolorImageOutputSchema},
  prompt: `You are an AI image editor. Please recolor the provided image based on the instructions.

Instructions: {{{recolorPrompt}}}

Original Image: {{media url=photoDataUri}}

Output a re-colored image.`, // Handlebars
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

const recolorImageFlow = ai.defineFlow(
  {
    name: 'recolorImageFlow',
    inputSchema: RecolorImageInputSchema,
    outputSchema: RecolorImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: [
        {text: `Recolor this image: ${input.recolorPrompt}`},
        {media: {url: input.photoDataUri}},
      ],
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No recolored image was generated.');
    }

    return {recoloredPhotoDataUri: media.url};
  }
);

