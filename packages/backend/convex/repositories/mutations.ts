import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth";

export const create = mutation({
  args: {
    name: v.string(),
    owner: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) throw new Error("Not authenticated");
    const userId = user.userId || user._id.toString();

    return await ctx.db.insert("repositories", {
      name: args.name,
      owner: args.owner,
      description: args.description,
      ownerId: userId,
      isPublic: args.isPublic,
    });
  },
});

export const star = mutation({
  args: {
    repositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) throw new Error("Not authenticated");
    const userId = user.userId || user._id.toString();

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_userId_repositoryId", (q) =>
        q.eq("userId", userId).eq("repositoryId", args.repositoryId)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("stars", {
      userId,
      repositoryId: args.repositoryId,
    });
  },
});

export const recordVisit = mutation({
  args: {
    repositoryId: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) return; // Don't track if not logged in
    const userId = user.userId || user._id.toString();

    const existing = await ctx.db
      .query("repoVisits")
      .withIndex("by_userId_repositoryId", (q) =>
        q.eq("userId", userId).eq("repositoryId", args.repositoryId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastVisited: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("repoVisits", {
      userId,
      repositoryId: args.repositoryId,
      lastVisited: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("repositories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) throw new Error("Not authenticated");
    const userId = user.userId || user._id.toString();

    const repo = await ctx.db.get(args.id);
    if (!repo) throw new Error("Repository not found");
    if (repo.ownerId !== userId) throw new Error("Not authorized");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.id, updates);
  },
});

export const updateVisibility = mutation({
  args: {
    id: v.id("repositories"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) throw new Error("Not authenticated");
    const userId = user.userId || user._id.toString();

    const repo = await ctx.db.get(args.id);
    if (!repo) throw new Error("Repository not found");
    if (repo.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { isPublic: args.isPublic });
  },
});

export const deleteRepo = mutation({
  args: {
    id: v.id("repositories"),
  },
  handler: async (ctx, args) => {
    let user;
    try {
      user = await authComponent.getAuthUser(ctx);
    } catch (e) {
      user = null;
    }

    if (!user) throw new Error("Not authenticated");
    const userId = user.userId || user._id.toString();

    const repo = await ctx.db.get(args.id);
    if (!repo) throw new Error("Repository not found");
    if (repo.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});
