'use server';
/**
 * @fileOverview An AI assistant flow for generating or improving course descriptions.
 *
 * - generateCourseDescription - A function that handles the course description generation process.
 * - GenerateCourseDescriptionInput - The input type for the generateCourseDescription function.
 * - GenerateCourseDescriptionOutput - The return type for the generateCourseDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCourseDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the course.'),
  keyLearningPoints: z.array(z.string()).describe('A list of key learning points or topics covered in the course.'),
  existingDescription: z.string().optional().describe('An optional existing course description to be improved or rewritten.'),
});
export type GenerateCourseDescriptionInput = z.infer<typeof GenerateCourseDescriptionInputSchema>;

const GenerateCourseDescriptionOutputSchema = z.object({
  generatedDescription: z.string().describe('The generated or improved course description.'),
});
export type GenerateCourseDescriptionOutput = z.infer<typeof GenerateCourseDescriptionOutputSchema>;

export async function generateCourseDescription(input: GenerateCourseDescriptionInput): Promise<GenerateCourseDescriptionOutput> {
  return generateCourseDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseDescriptionPrompt',
  input: { schema: GenerateCourseDescriptionInputSchema },
  output: { schema: GenerateCourseDescriptionOutputSchema },
  prompt: `You are an expert copywriter specializing in creating compelling and informative course descriptions for online learning platforms. Your goal is to attract potential students by highlighting the value and key takeaways of the course.

Course Title: {{{title}}}

{{#if existingDescription}}
Existing Description (improve or rewrite this):
"""
{{{existingDescription}}}
"""

Improve the above description, making it more engaging, clear, and concise. Focus on the benefits for the student and incorporate the key learning points effectively.
{{else}}
Key Learning Points:
{{#each keyLearningPoints}}- {{{this}}}
{{/each}}

Create a compelling and informative course description based on the provided title and key learning points. The description should be professional, engaging, and highlight the value proposition of the course. Ensure it clearly outlines what a student will learn and achieve.
{{/if}}

Generated Description:`,
});

const generateCourseDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCourseDescriptionFlow',
    inputSchema: GenerateCourseDescriptionInputSchema,
    outputSchema: GenerateCourseDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
