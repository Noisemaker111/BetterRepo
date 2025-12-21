import { action } from "./_generated/server";
import { v } from "convex/values";

const OPENCODE_SERVER_URL = process.env.OPENCODE_SERVER_URL;

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.optional(v.string()),
    context: v.optional(v.object({
      repository: v.string(),
      currentPath: v.string(),
    })),
  },
  handler: async (_ctx, args) => {
    if (!OPENCODE_SERVER_URL) {
      throw new Error("OPENCODE_SERVER_URL is not set");
    }

    const response = await fetch(`${OPENCODE_SERVER_URL}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: args.message,
        session_id: args.sessionId,
        context: args.context,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Opencode API error: ${errorText}`);
    }

    return await response.json();
  },
});

export const getStatus = action({
  args: {},
  handler: async () => {
    if (!OPENCODE_SERVER_URL) {
      throw new Error("OPENCODE_SERVER_URL is not set");
    }

    const response = await fetch(`${OPENCODE_SERVER_URL}/v1/health`);
    return response.ok;
  },
});
