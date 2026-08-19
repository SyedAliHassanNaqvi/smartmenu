import type { NextRequest } from "next/server";
import { chatRequestSchema } from "@/lib/validations/ai";
import { VectorSearchService } from "@/services/vector-service";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * POST /api/ai
 * Chat + recommendations: embed the query, vector-search the menu, then
 * produce a Virtual Sommelier recommendation.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    const queryEmbeddings = await VectorSearchService.generateEmbeddings(
      validatedData.message,
    );

    const searchResults = await VectorSearchService.semanticSearch(
      validatedData.message,
      queryEmbeddings,
      5,
    );

    const recommendation =
      await VectorSearchService.getVirtualSommelierRecommendation(
        validatedData.message,
        searchResults,
      );

    return ok({
      conversationId: validatedData.conversationId || `conv_${Date.now()}`,
      response: recommendation.reasoning,
      recommendation: recommendation.recommendation,
      selectedProduct: recommendation.selectedProduct,
      similarProducts: searchResults.slice(1, 3),
      confidence: 0.92,
      timestamp: new Date(),
    });
  });
}

/**
 * GET /api/ai?q=query&limit=5
 * Semantic search over the menu.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("limit") || "5", 10);

    if (!query) {
      throw new ApiError(400, "Query parameter 'q' is required");
    }

    const embeddings = await VectorSearchService.generateEmbeddings(query);
    const results = await VectorSearchService.semanticSearch(
      query,
      embeddings,
      maxResults,
    );

    return ok({ results, total: results.length });
  });
}
