import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { withErrorHandling, ok } from "@/lib/api";
import { signUploadSchema } from "@/lib/validations/media";
import { signUpload } from "@/services/media-service";

/**
 * POST /api/media/sign
 *
 * Issue a short-lived Cloudinary signature so the admin's browser can upload a
 * product image, video or 3D model directly to Cloudinary. The signature pins
 * the destination (this restaurant's folder) and the allowed file formats.
 * Body: { kind: "image" | "video" | "model" }
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { restaurantId } = requireRole(request, ["admin"]);

    const body = await request.json();
    const { kind } = signUploadSchema.parse(body);

    return ok(signUpload(restaurantId, kind));
  });
}
