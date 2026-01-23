import { v } from "convex/values";

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import * as githubApi from "../github/api";

export const pushIssueCommentToGitHub = internalAction({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
      userId: args.userId,
    });

    if (!accessToken) return;

    const comment = await ctx.runQuery(api.comments.queries.get, { id: args.commentId });
    if (!comment || !comment.issueId) return;

    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: comment.issueId });
    if (!issue || !issue.repositoryId || !issue.githubId) return;

    const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
      repositoryId: issue.repositoryId,
    });

    if (!repo || !repo.githubFullName || !repo.syncEnabled) return;

    const [owner, repoName] = repo.githubFullName.split("/");
    if (!owner || !repoName) return;

    try {
      const githubComment = await githubApi.createIssueComment(
        accessToken,
        owner,
        repoName,
        issue.githubId,
        { body: comment.body }
      );

      await ctx.runMutation(internal.comments.mutations.patchGitHubInfo, {
        commentId: args.commentId,
        githubId: githubComment.id,
        githubNodeId: githubComment.node_id,
        githubUrl: githubComment.html_url,
      });

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue_comment.created",
        direction: "outbound",
        success: true,
      });
    } catch (error) {
      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue_comment.created",
        direction: "outbound",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});
