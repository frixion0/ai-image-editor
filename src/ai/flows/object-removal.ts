// Object removal feature
'use server';
/**
 * @fileOverview An object removal AI agent.
 *
 * - objectRemoval - A function that handles the object removal process.
 * - ObjectRemovalInput - The input type for the objectRemoval function.
 * - ObjectRemovalOutput - The return type for the objectRemoval function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ObjectRemovalInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to remove objects from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  maskDataUri: z
    .string()
    .describe(
      "A mask highlighting the objects to remove, as a data URI that must include a MIME type and use Base64 encoding.  The mask should have the same dimensions as the photo. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ObjectRemovalInput = z.infer<typeof ObjectRemovalInputSchema>;

const ObjectRemovalOutputSchema = z.object({
  editedPhotoDataUri: z.string().describe('The photo with the objects removed, as a data URI.'),
});
export type ObjectRemovalOutput = z.infer<typeof ObjectRemovalOutputSchema>;

export async function objectRemoval(input: ObjectRemovalInput): Promise<ObjectRemovalOutput> {
  return objectRemovalFlow(input);
}

const objectRemovalPrompt = ai.definePrompt({
  name: 'objectRemovalPrompt',
  input: {schema: ObjectRemovalInputSchema},
  output: {schema: ObjectRemovalOutputSchema},
  prompt: `Remove the objects in the photo specified by the mask. Return the photo with the objects removed.

Photo: {{media url=photoDataUri}}
Mask: {{media url=maskDataUri}}
`,
});

const objectRemovalFlow = ai.defineFlow(
  {
    name: 'objectRemovalFlow',
    inputSchema: ObjectRemovalInputSchema,
    outputSchema: ObjectRemovalOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {media: {url: input.maskDataUri}},
        {text: 'Remove the objects specified by the mask.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {editedPhotoDataUri: media!.url!};
  }
);
