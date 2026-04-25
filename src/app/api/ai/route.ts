import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validations/ai";
import { VectorSearchService } from "@/services/vector-service";
import { AIService } from "@/lib/ai-config";

/**
 * AI Agent API
 * Semantic Search + Virtual Sommelier Integration
 * 
 * POST /api/ai - Chat and recommendations
 * GET /api/ai?q=query - Semantic search
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    // Generate embeddings for the user query
    const queryEmbeddings = await VectorSearchService.generateEmbeddings(
      validatedData.message
    );

    // Perform vector search in MongoDB Atlas
    const searchResults = await VectorSearchService.semanticSearch(
      validatedData.message,
      queryEmbeddings,
      5
    );

    // Get Virtual Sommelier recommendation
    const recommendation = await VectorSearchService.getVirtualSommelierRecommendation(
      validatedData.message,
      searchResults
    );

    // AI response with context
    const aiResponse = {
      conversationId: validatedData.conversationId || `conv_${Date.now()}`,
      response: recommendation.reasoning,
      recommendation: recommendation.recommendation,
      selectedProduct: recommendation.selectedProduct,
      similarProducts: searchResults.slice(1, 3),
      confidence: 0.92,
      timestamp: new Date(),
    };

    return NextResponse.json(aiResponse, { status: 200 });
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    );
  }
}

/**
 * Semantic Search Endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("limit") || "5");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Generate embeddings
    const embeddings = await VectorSearchService.generateEmbeddings(query);

    // Vector search
    const results = await VectorSearchService.semanticSearch(
      query,
      embeddings,
      maxResults
    );

    return NextResponse.json({ results, total: results.length }, { status: 200 });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
