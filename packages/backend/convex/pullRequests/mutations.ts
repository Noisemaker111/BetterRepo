import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    sourceBranch: v.string(),
    targetBranch: v.string(),
    issueId: v.optional(v.id("issues")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pullRequests", {
      title: args.title,
      body: args.body,
      authorId: args.authorId,
      sourceBranch: args.sourceBranch,
      targetBranch: args.targetBranch,
      status: "open",
      issueId: args.issueId,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("pullRequests"),
    status: v.union(v.literal("open"), v.literal("merged"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const patchGitHubInfo = mutation({
  args: {
    id: v.id("pullRequests"),
    githubId: v.number(),
    githubNodeId: v.string(),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      githubId: args.githubId,
      githubNodeId: args.githubNodeId,
      githubUrl: args.githubUrl,
    });
  },
});
