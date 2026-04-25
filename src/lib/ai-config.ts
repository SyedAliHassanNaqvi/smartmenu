/**
 * AI Configuration for LLM Integration
 * Supports both OpenAI and Gemini APIs
 */

export interface AIConfig {
  provider: "openai" | "gemini";
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class AIService {
  private static config: AIConfig = {
    provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as "openai" | "gemini") || "gemini",
    apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "",
    model:
      process.env.NEXT_PUBLIC_AI_PROVIDER === "openai"
        ? "gpt-4-turbo"
        : "gemini-1.5-flash",
    maxTokens: 500,
    temperature: 0.7,
  };

  /**
   * Virtual Sommelier Prompt
   * Analyzes dish descriptions to make recommendations
   */
  static getVirtualSommelierPrompt(
    userQuery: string,
    products: Array<{
      name: string;
      description: string;
      pros: string[];
      cons: string[];
      price: number;
    }>
  ): string {
    const productsList = products
      .map(
        (p) =>
          `- ${p.name}: ${p.description} | Pros: ${p.pros.join(", ")} | Cons: ${p.cons.join(", ")} | $${p.price}`
      )
      .join("\n");

    return `You are a Virtual Sommelier for a restaurant. Analyze the user's request and recommend the best dish.

User Request: "${userQuery}"

Available Dishes:
${productsList}

Based on the user's needs, provide:
1. Your top recommendation
2. Why this dish is perfect for them
3. Any pairing suggestions
4. Nutritional highlights if relevant

Keep the response concise and engaging.`;
  }

  /**
   * Dish Recognition Prompt for Gemini Vision
   */
  static getDishRecognitionPrompt(menuItems: string[]): string {
    return `You are a culinary expert analyzing a food image. Identify the dish in the image and match it to one of these menu items:

${menuItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Provide:
1. Identified dish name
2. Confidence score (0-1)
3. Key ingredients visible
4. Best matching menu item number
5. Alternative matches if any

Be precise and concise.`;
  }

  /**
   * Make API call to LLM
   */
  static async callLLM(prompt: string, systemRole?: string): Promise<string> {
    try {
      if (this.config.provider === "openai") {
        return await this.callOpenAI(prompt, systemRole);
      } else {
        return await this.callGemini(prompt, systemRole);
      }
    } catch (error) {
      console.error("LLM API call failed:", error);
      throw error;
    }
  }

  private static async callOpenAI(prompt: string, systemRole?: string): Promise<string> {
    // Mock implementation - integrate with actual OpenAI API
    console.log("OpenAI call with prompt:", prompt);
    return "Based on your preferences, I recommend the Light Quinoa Salad. It's perfect for a hot day with fresh ingredients and low calories.";
  }

  private static async callGemini(prompt: string, systemRole?: string): Promise<string> {
    // Mock implementation - integrate with actual Gemini API
    console.log("Gemini call with prompt:", prompt);
    return "I recommend the Margherita Pizza - it has excellent flavor balance and uses premium ingredients.";
  }
}
