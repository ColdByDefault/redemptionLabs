import { z } from "zod";

export const documentUploadSchema = z.object({
  name: z
    .string()
    .min(1, "Document name is required")
    .max(100, "Document name must be at most 100 characters"),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
