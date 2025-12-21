import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    labelIds: v.array(v.id("labels")),
    repositoryId: v.optional(v.id("repositories")),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const issueId = await ctx.db.insert("issues", {
      title: args.title,
      body: args.body,
      authorId: args.authorId,
      labelIds: args.labelIds,
      repositoryId: args.repositoryId,
      status: args.status ?? "backlog",
    });
    
    await ctx.scheduler.runAfter(0, internal.issues.actions.updateEmbeddingAction, { issueId });
    
    return issueId;
  },
});

export const patchEmbedding = internalMutation({
  args: {
    issueId: v.id("issues"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.issueId, { embedding: args.embedding });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("issues"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
