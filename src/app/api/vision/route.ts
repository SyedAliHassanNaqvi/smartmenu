import type { NextRequest } from "next/server";
import { VisionService } from "@/services/vision-service";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * POST /api/vision
 * Analyze a food image and return dish recognition.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "No file provided");
    }

    if (!file.type.startsWith("image/")) {
      throw new ApiError(400, "File must be an image");
    }

    const result = await VisionService.mockGeminiAnalysis(file);
    return ok(result);
  });
}
