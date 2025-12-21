import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

export const updateEmbeddingAction = internalAction({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: args.issueId });
    if (!issue) return;

    const embedding = await ctx.runAction(api.ai.getEmbedding, {
      text: `${issue.title}\n${issue.body}`,
    });

    await ctx.runMutation(internal.issues.mutations.patchEmbedding, {
      issueId: args.issueId,
      embedding,
    });
  },
});

export const findDuplicates = action({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const embedding = await ctx.runAction(api.ai.getEmbedding, {
      text: `${args.title}\n${args.body}`,
    });

    const results = await ctx.vectorSearch("issues", "by_embedding", {
      vector: embedding,
      limit: 5,
    });

    const duplicates: any[] = [];
    for (const result of results) {
      if (result._score > 0.85) {
        const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: result._id });
        if (issue) {
          duplicates.push({
            ...issue,
            score: result._score,
          });
        }
      }
    }

    return duplicates;
  },
});
