import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const list = query({
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
      .query("repositories")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const getStarred = query({
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

    const repos = await Promise.all(
      stars.map((star) => ctx.db.get(star.repositoryId))
    );

    return repos.filter((repo) => repo !== null);
  },
});
