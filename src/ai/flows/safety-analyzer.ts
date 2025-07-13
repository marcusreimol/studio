'use server';

/**
 * @fileOverview An AI-powered tool that analyzes a service description to identify potential safety concerns or special considerations.
 *
 * - analyzeServiceDescription - A function that analyzes the service description and returns safety concerns.
 * - AnalyzeServiceDescriptionInput - The input type for the analyzeServiceDescription function.
 * - AnalyzeServiceDescriptionOutput - The return type for the analyzeServiceDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeServiceDescriptionInputSchema = z.object({
  description: z.string().describe('The service description provided by the property manager.'),
});
export type AnalyzeServiceDescriptionInput = z.infer<typeof AnalyzeServiceDescriptionInputSchema>;

const AnalyzeServiceDescriptionOutputSchema = z.object({
  safetyConcerns: z.array(z.string()).describe('An array of safety concerns or special considerations identified in the service description.'),
});
export type AnalyzeServiceDescriptionOutput = z.infer<typeof AnalyzeServiceDescriptionOutputSchema>;

export async function analyzeServiceDescription(
  input: AnalyzeServiceDescriptionInput
): Promise<AnalyzeServiceDescriptionOutput> {
  return analyzeServiceDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeServiceDescriptionPrompt',
  input: {schema: AnalyzeServiceDescriptionInputSchema},
  output: {schema: AnalyzeServiceDescriptionOutputSchema},
  prompt: `You are an AI assistant that analyzes service descriptions provided by property managers to identify potential safety concerns or special considerations.

  Given the following service description, identify any safety concerns or special considerations that service providers should be aware of before submitting a proposal. Return these concerns as a list of strings.

  Service Description: {{{description}}}
  \nIf no safety concerns are present, return an empty array.
  `,
});

const analyzeServiceDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeServiceDescriptionFlow',
    inputSchema: AnalyzeServiceDescriptionInputSchema,
    outputSchema: AnalyzeServiceDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
