import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import * as githubApi from "../github/api";

export const updateEmbeddingAction = internalAction({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: args.issueId });
    if (!issue) return;

    const embedding = await ctx.runAction(api.ai.getEmbedding, {
      text: `${issue.title}\n${issue.body}`,
    });

    await ctx.runMutation(internal.issues.mutations.patchEmbedding, {
      issueId: args.issueId,
      embedding,
    });
  },
});

export const findDuplicates = action({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const embedding = await ctx.runAction(api.ai.getEmbedding, {
      text: `${args.title}\n${args.body}`,
    });

    const results = await ctx.vectorSearch("issues", "by_embedding", {
      vector: embedding,
      limit: 5,
    });

    const duplicates: any[] = [];
    for (const result of results) {
      if (result._score > 0.85) {
        const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: result._id });
        if (issue) {
          duplicates.push({
            ...issue,
            score: result._score,
          });
        }
      }
    }

    return duplicates;
  },
});

// ============ GitHub Outbound Sync Actions ============

/**
 * Push a newly created issue to GitHub
 */
export const pushNewIssueToGitHub = internalAction({
  args: {
    issueId: v.id("issues"),
    repositoryId: v.id("repositories"),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get access token
    const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
      userId: args.authorId,
    });

    if (!accessToken) {
      console.log("No GitHub connection for outbound sync, skipping");
      return;
    }

    // Get issue and repo details
    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: args.issueId });
    const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
      repositoryId: args.repositoryId,
    });

    if (!issue || !repo || !repo.githubFullName) {
      console.log("Issue or repo not found for outbound sync");
      return;
    }

    const [owner, repoName] = repo.githubFullName.split("/");

    try {
      // Create issue on GitHub
      const githubIssue = await githubApi.createIssue(accessToken, owner, repoName, {
        title: issue.title,
        body: issue.body,
      });

      // Update local issue with GitHub ID
      await ctx.runMutation(internal.issues.mutations.patchGitHubInfo, {
        issueId: args.issueId,
        githubId: githubIssue.number,
        githubNodeId: githubIssue.node_id,
        githubUrl: githubIssue.html_url,
      });

      // Log success
      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: args.repositoryId,
        eventType: "issue.created",
        direction: "outbound",
        success: true,
      });

      console.log(`Created GitHub issue #${githubIssue.number} for local issue ${args.issueId}`);
    } catch (error) {
      console.error("Failed to push issue to GitHub:", error);

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: args.repositoryId,
        eventType: "issue.created",
        direction: "outbound",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

/**
 * Push issue status change to GitHub (close/reopen)
 */
export const pushIssueStatusToGitHub = internalAction({
  args: {
    issueId: v.id("issues"),
    status: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
      userId: args.userId,
    });

    if (!accessToken) return;

    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: args.issueId });
    if (!issue || !issue.githubId || !issue.repositoryId) return;

    const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
      repositoryId: issue.repositoryId,
    });

    if (!repo || !repo.githubFullName || !repo.syncEnabled) return;

    const [owner, repoName] = repo.githubFullName.split("/");

    try {
      // Map BetterRepo status to GitHub state
      const githubState = (args.status === "closed" || args.status === "done") ? "closed" : "open";

      await githubApi.updateIssue(accessToken, owner, repoName, issue.githubId, {
        state: githubState,
      });

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue.status_changed",
        direction: "outbound",
        success: true,
      });

      console.log(`Updated GitHub issue #${issue.githubId} state to ${githubState}`);
    } catch (error) {
      console.error("Failed to update issue status on GitHub:", error);

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue.status_changed",
        direction: "outbound",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

/**
 * Push issue content update to GitHub
 */
export const pushIssueUpdateToGitHub = internalAction({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
      userId: args.userId,
    });

    if (!accessToken) return;

    const issue = await ctx.runQuery(api.issues.queries.getIssue, { id: args.issueId });
    if (!issue || !issue.githubId || !issue.repositoryId) return;

    const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
      repositoryId: issue.repositoryId,
    });

    if (!repo || !repo.githubFullName || !repo.syncEnabled) return;

    const [owner, repoName] = repo.githubFullName.split("/");

    try {
      await githubApi.updateIssue(accessToken, owner, repoName, issue.githubId, {
        title: args.title,
        body: args.body,
      });

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue.updated",
        direction: "outbound",
        success: true,
      });

      console.log(`Updated GitHub issue #${issue.githubId}`);
    } catch (error) {
      console.error("Failed to update issue on GitHub:", error);

      await ctx.runMutation(internal.github.mutations.logSyncEvent, {
        repositoryId: issue.repositoryId,
        eventType: "issue.updated",
        direction: "outbound",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

