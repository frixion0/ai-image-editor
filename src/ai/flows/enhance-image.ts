// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-Powered Image Enhancement.
 *
 * This file defines a Genkit flow for enhancing the quality of images using AI algorithms.  It sharpens, denoises, and improves the overall visual appeal of the input image.
 *
 * @exports enhanceImage - A function that enhances the quality of an image.
 * @exports EnhanceImageInput - The input type for the enhanceImage function.
 * @exports EnhanceImageOutput - The return type for the enhanceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

const EnhanceImageOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      'The enhanced photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;

export async function enhanceImage(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageFlow(input);
}

const enhanceImagePrompt = ai.definePrompt({
  name: 'enhanceImagePrompt',
  input: {schema: EnhanceImageInputSchema},
  output: {schema: EnhanceImageOutputSchema},
  prompt: `Enhance the quality of the following image. Sharpen it, denoise it, and improve its overall visual appeal.

   Output the enhanced image as a data URI.
  Image: {{media url=photoDataUri}}
  `,
});

const enhanceImageFlow = ai.defineFlow(
  {
    name: 'enhanceImageFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Enhance this image. Sharpen it, denoise it, and improve its overall visual appeal. Return the resulting image as a data URI.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {enhancedPhotoDataUri: media.url!};
  }
);
