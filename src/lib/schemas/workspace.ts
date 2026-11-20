import { z } from "zod";

export const UpdateOutputSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(10000, "Content exceeds maximum length"),
});

export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(50, "Workspace name must be under 50 characters"),
});