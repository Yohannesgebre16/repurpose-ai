import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import {
  RepurposedOutputSchema,
  type RepurposedOutput,
} from "@/lib/schemas/repurpose";

export async function generateRepurposedContent(
  title: string,
  originalText: string
): Promise<RepurposedOutput> {
  const { output } = await generateText({
    model: google("gemini-2.5-flash"),
    output: Output.object({
      schema: RepurposedOutputSchema,
    }),
    prompt: `You are an expert B2B content strategist. Transform the following long-form content into three platform-native formats while preserving the author's core insights and tone.

Title: ${title}

Source Content:
${originalText}`,
  });

  if (!output) {
    throw new Error("Gemini failed to generate structured content.");
  }

  return output;
}