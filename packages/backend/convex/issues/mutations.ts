import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { authComponent } from "../auth";

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    labelIds: v.array(v.id("labels")),
    repositoryId: v.optional(v.id("repositories")),
    syncToGitHub: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("closed")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
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
      priority: args.priority ?? "low",
    });

    // Update embedding
    await ctx.scheduler.runAfter(0, internal.issues.actions.updateEmbeddingAction, { issueId });

    // If linked to a GitHub repo, push to GitHub (two-way sync)
    if (args.repositoryId && args.syncToGitHub !== false) {
      const repo = await ctx.db.get(args.repositoryId);
      if (repo?.githubId && repo.syncEnabled) {
        await ctx.scheduler.runAfter(0, internal.issues.actions.pushNewIssueToGitHub, {
          issueId,
          repositoryId: args.repositoryId,
          authorId: args.authorId,
        });
      }
    }

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

/**
 * Update issue with GitHub sync info (called after pushing to GitHub)
 */
export const patchGitHubInfo = internalMutation({
  args: {
    issueId: v.id("issues"),
    githubId: v.number(),
    githubNodeId: v.string(),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.issueId, {
      githubId: args.githubId,
      githubNodeId: args.githubNodeId,
      githubUrl: args.githubUrl,
      lastSyncedAt: Date.now(),
    });
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
    const issue = await ctx.db.get(args.id);
    if (!issue) throw new Error("Issue not found");

    await ctx.db.patch(args.id, { status: args.status });

    // Push status change to GitHub if synced
    if (issue.repositoryId && issue.githubId) {
      const repo = await ctx.db.get(issue.repositoryId);
      if (repo?.syncEnabled) {
        // Get current user for the push
        let user;
        try {
          user = await authComponent.getAuthUser(ctx);
        } catch (e) {
          user = null;
        }

        if (user) {
          const userId = user.userId || user._id.toString();
          // Schedule the outbound sync
          await ctx.scheduler.runAfter(0, internal.issues.actions.pushIssueStatusToGitHub, {
            issueId: args.id,
            status: args.status,
            userId,
          });
        }
      }
    }
  },
});

export const updatePriority = mutation({
  args: {
    id: v.id("issues"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { priority: args.priority });
    // Note: GitHub doesn't have a native priority concept, so we don't sync this
  },
});

/**
 * Update issue title and body (with GitHub sync)
 */
export const update = mutation({
  args: {
    id: v.id("issues"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (!issue) throw new Error("Issue not found");

    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.body !== undefined) updates.body = args.body;

    await ctx.db.patch(args.id, updates);

    // Push changes to GitHub if synced
    if (issue.repositoryId && issue.githubId) {
      const repo = await ctx.db.get(issue.repositoryId);
      if (repo?.syncEnabled) {
        let user;
        try {
          user = await authComponent.getAuthUser(ctx);
        } catch (e) {
          user = null;
        }

        if (user) {
          const userId = user.userId || user._id.toString();
          await ctx.scheduler.runAfter(0, internal.issues.actions.pushIssueUpdateToGitHub, {
            issueId: args.id,
            title: args.title,
            body: args.body,
            userId,
          });
        }
      }
    }
  },
});
