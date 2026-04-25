import { NextRequest, NextResponse } from "next/server";
import { VisionService } from "@/services/vision-service";

/**
 * Vision Recognition API
 * Integrates Gemini 1.5 Flash for dish recognition
 * 
 * POST /api/vision
 * - Accepts image file
 * - Returns dish identification with confidence score
 * - Provides nutritional information and pairings
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // In production: Send to Gemini 1.5 Flash API
    // const buffer = await file.arrayBuffer();
    // const result = await geminiVisionApi.analyze(buffer, {
    //   prompt: AIService.getDishRecognitionPrompt(menuItems)
    // });

    // Mock analysis result
    const result = await VisionService.mockGeminiAnalysis(file);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Vision analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Vision analysis failed" },
      { status: 500 }
    );
  }
}
