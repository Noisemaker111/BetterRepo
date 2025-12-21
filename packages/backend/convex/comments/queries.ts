import { v } from "convex/values";
import { query } from "../_generated/server";

export const listForIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
  },
});

export const listForPR = query({
  args: { prId: v.id("pullRequests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_prId", (q) => q.eq("prId", args.prId))
      .collect();
  },
});
