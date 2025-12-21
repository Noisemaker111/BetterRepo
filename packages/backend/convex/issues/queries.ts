import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const list = query({
  args: {
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
    const q = args.repositoryId
      ? ctx.db.query("issues").withIndex("by_repositoryId", (q) => q.eq("repositoryId", args.repositoryId))
      : ctx.db.query("issues");

    if (args.status) {
      const status = args.status;
      // If we already have an index, we might need to filter or use a different index if available
      // For now, simple filter if repositoryId was used, or use by_status if not.
      if (args.repositoryId) {
        return (await q.collect()).filter(i => i.status === status);
      }
      return await ctx.db.query("issues").withIndex("by_status", (q) => q.eq("status", status)).collect();
    }

    return await q.collect();
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }
    if (!user) return [];
    const userId = user.userId || user._id.toString();

    return await ctx.db
      .query("issues")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .order("desc")
      .take(10);
  },
});

export const listFromStarred = query({
  args: {},
  handler: async (ctx) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }
    if (!user) return [];
    const userId = user.userId || user._id.toString();

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const repoIds = stars.map((s) => s.repositoryId);

    // This is a bit inefficient for large numbers of starred repos, but okay for a start.
    // Convex doesn't have a direct "in" query for indexes yet, so we'd have to collect or do multiple queries.
    const allIssues = [];
    for (const repoId of repoIds) {
      const issues = await ctx.db
        .query("issues")
        .withIndex("by_repositoryId", (q) => q.eq("repositoryId", repoId))
        .order("desc")
        .take(5);
      allIssues.push(...issues);
    }

    return allIssues.sort((a, b) => b._creationTime - a._creationTime).slice(0, 20);
  },
});

export const getIssue = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listForYou = query({
  args: {},
  handler: async (ctx) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }
    if (!user) return [];
    const userId = user.userId || user._id.toString();

    // 1. Get starred repos
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const starredRepoIds = stars.map((s) => s.repositoryId);

    // 2. Get visited repos
    const visits = await ctx.db
      .query("repoVisits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
    const visitedRepoIds = visits.map((v) => v.repositoryId);

    const relevantRepoIds = Array.from(new Set([...starredRepoIds, ...visitedRepoIds]));

    // 3. Get issues from these repos
    let issues: any[] = [];

    // Fetch urgent/high priority issues first across all relevant repos
    // Since we don't have a cross-repo index for priority, we'll collect from relevant repos
    for (const repoId of relevantRepoIds) {
      const repoIssues = await ctx.db
        .query("issues")
        .withIndex("by_repositoryId", (q) => q.eq("repositoryId", repoId))
        .collect();
      issues.push(...repoIssues);
    }

    // 4. Also get issues assigned to or authored by the user
    const authoredIssues = await ctx.db
      .query("issues")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .collect();
    const assignedIssues = await ctx.db
      .query("issues")
      .withIndex("by_assigneeId", (q) => q.eq("assigneeId", userId))
      .collect();

    issues.push(...authoredIssues);
    issues.push(...assignedIssues);

    // De-duplicate issues
    const uniqueIssues = Array.from(new Map(issues.map(i => [i._id, i])).values());

    // Sort by priority and then by creation time
    const priorityOrder = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
      undefined: 0,
    };

    return uniqueIssues
      .sort((a, b) => {
        const pA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const pB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (pA !== pB) return pB - pA;
        return b._creationTime - a._creationTime;
      })
      .slice(0, 20);
  },
});
