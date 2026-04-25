import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message cannot be empty"),
  timestamp: z.date().optional(),
});

export const semanticSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResults: z.number().positive().default(5),
  threshold: z.number().min(0).max(1).default(0.7),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000),
  tableId: z.string(),
  conversationId: z.string().optional(),
  context: z.record(z.string(), z.any()).optional(),
});

export const chatResponseSchema = z.object({
  conversationId: z.string(),
  response: z.string(),
  recommendations: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
  timestamp: z.date(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SemanticSearch = z.infer<typeof semanticSearchSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
