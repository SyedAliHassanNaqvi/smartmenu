/**
 * Vision Service for Dish Recognition
 * Integrates with Gemini 1.5 Flash for image analysis
 */

export interface VisionAnalysisResult {
  dishName: string;
  productId: string;
  confidence: number;
  ingredients: string[];
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recommendedPairings: string[];
  price: number;
  matchedProducts: Array<{
    id: string;
    name: string;
    similarity: number;
  }>;
}

export class VisionService {
  private static readonly API_ENDPOINT = "/api/vision";

  /**
   * Analyze image and identify dish
   * In production: Send to Gemini 1.5 Flash API
   */
  static async analyzeDish(
    imageData: Blob | File
  ): Promise<VisionAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append("file", imageData);

      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Vision analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Vision analysis error:", error);
      throw error;
    }
  }

  /**
   * Process canvas frame from video
   */
  static canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        "image/jpeg",
        0.95
      );
    });
  }

  /**
   * Extract frame from video element
   */
  static captureVideoFrame(
    videoElement: HTMLVideoElement
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.drawImage(videoElement, 0, 0);
    return canvas;
  }

  /**
   * Mock Gemini analysis - returns dish recognition
   */
  static async mockGeminiAnalysis(imageData: Blob): Promise<VisionAnalysisResult> {
    return {
      dishName: "Margherita Pizza",
      productId: "prod-margherita-1",
      confidence: 0.94,
      ingredients: ["Tomato", "Mozzarella", "Basil", "Olive Oil"],
      nutritionInfo: {
        calories: 285,
        protein: 12,
        carbs: 36,
        fat: 10,
      },
      recommendedPairings: ["Iced Tea", "Garlic Bread"],
      price: 12.99,
      matchedProducts: [
        { id: "prod-margherita-1", name: "Margherita Pizza", similarity: 0.94 },
        { id: "prod-margherita-2", name: "Premium Margherita", similarity: 0.88 },
      ],
    };
  }
}
