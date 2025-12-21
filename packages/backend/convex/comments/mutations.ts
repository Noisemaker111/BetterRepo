import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const add = mutation({
  args: {
    body: v.string(),
    authorId: v.string(),
    issueId: v.optional(v.id("issues")),
    prId: v.optional(v.id("pullRequests")),
  },
  handler: async (ctx, args) => {
    if (!args.issueId && !args.prId) {
      throw new Error("Comment must be linked to an issue or a PR");
    }
    return await ctx.db.insert("comments", {
      body: args.body,
      authorId: args.authorId,
      issueId: args.issueId,
      prId: args.prId,
    });
  },
});
