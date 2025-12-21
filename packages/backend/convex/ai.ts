import { action } from "./_generated/server";
import { v } from "convex/values";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText, embed } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const suggestTags = action({
  args: {
    title: v.string(),
    body: v.string(),
    availableLabels: v.array(v.object({
      id: v.id("labels"),
      name: v.string(),
    })),
  },
  handler: async (_ctx, args) => {
    const { object } = await generateObject({
      model: openrouter("anthropic/claude-3.5-sonnet"), // Default for tagging
      schema: z.object({
        suggestedLabelIds: z.array(z.string()),
      }),
      prompt: `Given the following issue title and description, suggest appropriate labels from the available list.
      Title: ${args.title}
      Description: ${args.body}
      
      Available Labels:
      ${args.availableLabels.map(l => `- ${l.name} (id: ${l.id})`).join("\n")}
      `,
    });

    return object.suggestedLabelIds;
  },
});

export const getEmbedding = action({
  args: { text: v.string() },
  handler: async (_ctx, args) => {
    const { embedding } = await embed({
      model: openrouter.embedding("openai/text-embedding-3-small"),
      value: args.text,
    });
    return embedding;
  },
});

export const chatWithOpenRouter = action({
  args: {
    model: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
  },
  handler: async (_ctx, args) => {
    const { text } = await generateText({
      model: openrouter(args.model),
      messages: args.messages as any,
    });
    return text;
  },
});
