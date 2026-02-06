import { z } from "zod";

export const presignUploadSchema = z.object({
  mimeType: z.string().min(1),
});
