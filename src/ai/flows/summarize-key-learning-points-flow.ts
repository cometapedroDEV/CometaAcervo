'use server';
/**
 * @fileOverview An AI assistant flow to summarize key learning points from course content.
 *
 * - summarizeKeyLearningPoints - A function that handles the summarization of key learning points.
 * - CourseContentInput - The input type for the summarizeKeyLearningPoints function.
 * - KeyLearningPointsOutput - The return type for the summarizeKeyLearningPoints function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CourseContentInputSchema = z.object({
  courseContent: z
    .string()
    .describe('The course outline or content to summarize into key learning points.'),
});
export type CourseContentInput = z.infer<typeof CourseContentInputSchema>;

const KeyLearningPointsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, bulleted list of the most important key learning points from the course content.'
    ),
});
export type KeyLearningPointsOutput = z.infer<
  typeof KeyLearningPointsOutputSchema
>;

export async function summarizeKeyLearningPoints(
  input: CourseContentInput
): Promise<KeyLearningPointsOutput> {
  return summarizeKeyLearningPointsFlow(input);
}

const summarizeKeyLearningPointsPrompt = ai.definePrompt({
  name: 'summarizeKeyLearningPointsPrompt',
  input: { schema: CourseContentInputSchema },
  output: { schema: KeyLearningPointsOutputSchema },
  prompt: `You are an AI assistant tasked with summarizing course content into key learning points.
Read the following course content carefully and extract the most important learning outcomes and topics.
Provide a concise summary in the form of a bulleted list for the 'summary' field.

Course Content:
{{{courseContent}}}`,
});

const summarizeKeyLearningPointsFlow = ai.defineFlow(
  {
    name: 'summarizeKeyLearningPointsFlow',
    inputSchema: CourseContentInputSchema,
    outputSchema: KeyLearningPointsOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeKeyLearningPointsPrompt(input);
    return output!;
  }
);
