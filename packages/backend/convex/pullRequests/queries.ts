import { v } from "convex/values";
import { query } from "../_generated/server";

export const list = query({
  args: {
    repositoryId: v.optional(v.id("repositories")),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("merged"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const q = args.repositoryId
      ? ctx.db.query("pullRequests").withIndex("by_repositoryId", (q) => q.eq("repositoryId", args.repositoryId))
      : ctx.db.query("pullRequests");

    if (args.status) {
      const status = args.status;
      if (args.repositoryId) {
        return (await q.collect()).filter(p => p.status === status);
      }
      return await ctx.db.query("pullRequests").withIndex("by_status", (q) => q.eq("status", status)).collect();
    }
    return await q.collect();
  },
});

export const listWithDetails = query({
  args: {
    repositoryId: v.optional(v.id("repositories")),
  },
  handler: async (ctx, args) => {
    const q = args.repositoryId
      ? ctx.db.query("pullRequests").withIndex("by_repositoryId", (q) => q.eq("repositoryId", args.repositoryId))
      : ctx.db.query("pullRequests");

    const prs = await q.collect();

    const authorIds = Array.from(new Set(prs.map(p => p.authorId)));

    const authors = await Promise.all(
      authorIds.map(async (userId) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
        return { userId, ...profile };
      })
    );

    return prs.map(pr => ({
      ...pr,
      author: authors.find(a => a.userId === pr.authorId),
    }));
  },
});

export const listByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pullRequests")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});
