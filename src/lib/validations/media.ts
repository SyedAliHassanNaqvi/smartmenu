import { z } from "zod";
import { MEDIA_KINDS } from "@/lib/media-rules";

export const signUploadSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
});
