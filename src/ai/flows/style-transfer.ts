'use server';

/**
 * @fileOverview Style transfer AI agent.
 *
 * - styleTransfer - A function that handles the style transfer process.
 * - StyleTransferInput - The input type for the styleTransfer function.
 * - StyleTransferOutput - The return type for the styleTransfer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleTransferInputSchema = z.object({
  contentImage: z
    .string()
    .describe(
      "The content image to be styled, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styleImage: z
    .string()
    .describe(
      "The style image to be used for style transfer, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type StyleTransferInput = z.infer<typeof StyleTransferInputSchema>;

const StyleTransferOutputSchema = z.object({
  styledImage: z
    .string()
    .describe(
      'The stylized image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // add the base64 and data uri description
    ),
});
export type StyleTransferOutput = z.infer<typeof StyleTransferOutputSchema>;

export async function styleTransfer(input: StyleTransferInput): Promise<StyleTransferOutput> {
  return styleTransferFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleTransferPrompt',
  input: {schema: StyleTransferInputSchema},
  output: {schema: StyleTransferOutputSchema},
  prompt: `Apply the style of the following image to the content image.

Content Image: {{media url=contentImage}}
Style Image: {{media url=styleImage}}
`,
});

const styleTransferFlow = ai.defineFlow(
  {
    name: 'styleTransferFlow',
    inputSchema: StyleTransferInputSchema,
    outputSchema: StyleTransferOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

