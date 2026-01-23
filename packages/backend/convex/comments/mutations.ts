import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";

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
    const commentId = await ctx.db.insert("comments", {
      body: args.body,
      authorId: args.authorId,
      issueId: args.issueId,
      prId: args.prId,
    });

    if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (issue?.repositoryId && issue.githubId) {
        const repo = await ctx.db.get(issue.repositoryId);
        if (repo?.syncEnabled) {
          await ctx.scheduler.runAfter(0, internal.comments.actions.pushIssueCommentToGitHub, {
            commentId,
            userId: args.authorId,
          });
        }
      }
    }

    return commentId;
  },
});

export const patchGitHubInfo = internalMutation({
  args: {
    commentId: v.id("comments"),
    githubId: v.number(),
    githubNodeId: v.string(),
    githubUrl: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, {
      githubId: args.githubId,
      githubNodeId: args.githubNodeId,
      githubUrl: args.githubUrl,
      lastSyncedAt: Date.now(),
    });
    return null;
  },
});
