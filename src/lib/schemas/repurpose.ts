import { z } from "zod";

export const RepurposeRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  sourceType: z.enum(["TEXT", "YOUTUBE_TRANSCRIPT", "BLOG_POST"]).default("TEXT"),
  originalText: z
    .string()
    .min(50, "Please provide at least 50 characters to repurpose")
    .max(25000, "Source text exceeds the 25,000 character limit"),
});

export const RepurposedOutputSchema = z.object({
  linkedinPost: z
    .string()
    .describe("Engaging LinkedIn post with a strong hook, short paragraphs, and a call-to-action"),
  twitterThread: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe("A cohesive 3-to-7 tweet thread where each item is under 280 characters"),
  newsletterSummary: z
    .string()
    .describe("A crisp email newsletter section with a subject line, key takeaways, and closing thought"),
});

export type RepurposeRequest = z.infer<typeof RepurposeRequestSchema>;
export type RepurposedOutput = z.infer<typeof RepurposedOutputSchema>;