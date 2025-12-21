import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getCachedFile = internalQuery({
  args: {
    repositoryId: v.id("repositories"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId_path", (q) =>
        q.eq("repositoryId", args.repositoryId).eq("path", args.path)
      )
      .first();
  },
});

export const getCachedFilesByRepo = internalQuery({
  args: {
    repositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId", (q) =>
        q.eq("repositoryId", args.repositoryId)
      )
      .collect();
  },
});

export const searchCachedFiles = internalQuery({
  args: {
    repositoryId: v.id("repositories"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("repositoryFiles")
      .withIndex("by_repositoryId", (q) =>
        q.eq("repositoryId", args.repositoryId)
      )
      .collect();

    const lowerQuery = args.query.toLowerCase();
    return files.filter(
      (file) =>
        file.path.toLowerCase().includes(lowerQuery) ||
        file.content.toLowerCase().includes(lowerQuery)
    );
  },
});

export const getFileCount = internalQuery({
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
    return files.length;
  },
});
