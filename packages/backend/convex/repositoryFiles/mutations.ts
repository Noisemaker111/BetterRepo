import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";

export const cacheFileContent = internalMutation({
  args: {
    repositoryId: v.id("repositories"),
    path: v.string(),
    sha: v.string(),
    content: v.string(),
    size: v.number(),
    lastSyncedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId_path", (q) =>
        q.eq("repositoryId", args.repositoryId).eq("path", args.path)
      )
      .first();

    if (existing) {
      if (existing.sha !== args.sha) {
        await ctx.db.patch(existing._id, {
          sha: args.sha,
          content: args.content,
          size: args.size,
          lastSyncedAt: args.lastSyncedAt,
        });
        return existing._id;
      }
      return existing._id;
    }

    return await ctx.db.insert("repositoryFiles", {
      repositoryId: args.repositoryId,
      path: args.path,
      sha: args.sha,
      content: args.content,
      size: args.size,
      lastSyncedAt: args.lastSyncedAt,
    });
  },
});

export const deleteFileFromCache = internalMutation({
  args: {
    repositoryId: v.id("repositories"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId_path", (q) =>
        q.eq("repositoryId", args.repositoryId).eq("path", args.path)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const clearRepositoryCache = internalMutation({
  args: {
    repositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId", (q) =>
        q.eq("repositoryId", args.repositoryId)
      )
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }
  },
});

export const invalidateFilesBySha = internalMutation({
  args: {
    repositoryId: v.id("repositories"),
    changedPaths: v.array(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    for (const path of args.changedPaths) {
      const existing = await ctx.db
        .query("repositoryFiles")
        .withIndex("by_repositoryId_path", (q) =>
          q.eq("repositoryId", args.repositoryId).eq("path", path)
        )
        .first();

      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});
