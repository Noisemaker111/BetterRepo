/**
 * GitHub Sync Queries
 * Read operations for GitHub connection and sync status
 */

import { v } from "convex/values";
import { query, internalQuery } from "../_generated/server";
import { components } from "../_generated/api";
import { authComponent } from "../auth";

/**
 * Get the current user's GitHub connection status
 * Checks Better Auth's account table for GitHub provider credentials
 */
export const getConnection = query({
    args: {},
    handler: async (ctx) => {
        let user;
        try {
            user = await authComponent.getAuthUser(ctx);
        } catch (e) {
            user = null;
        }
        if (!user) return null;

        const userId = user.userId || user._id.toString();

        // First check our custom githubConnections table (for backwards compat)
        const customConnection = await ctx.db
            .query("githubConnections")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (customConnection) {
            return {
                _id: customConnection._id,
                githubUserId: customConnection.githubUserId,
                githubUsername: customConnection.githubUsername,
                avatarUrl: customConnection.avatarUrl,
                connectedAt: customConnection.connectedAt,
                lastUsedAt: customConnection.lastUsedAt,
                hasToken: !!customConnection.accessToken,
            };
        }

        // Check Better Auth's account table for GitHub provider
        // When linkSocial is used, the token is stored there
        const githubAccount = await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "account",
            where: [
                { field: "userId", value: user._id },
                { field: "providerId", value: "github" },
            ],
        });

        if (githubAccount) {
            return {
                _id: null, // No custom connection ID
                githubUserId: parseInt(githubAccount.accountId, 10) || null,
                githubUsername: null, // Not stored in Better Auth account table
                avatarUrl: user.image || null,
                connectedAt: githubAccount.createdAt ? new Date(githubAccount.createdAt).getTime() : Date.now(),
                lastUsedAt: githubAccount.updatedAt ? new Date(githubAccount.updatedAt).getTime() : null,
                hasToken: !!githubAccount.accessToken,
            };
        }

        return null;
    },
});

/**
 * List repositories available to import from GitHub
 * This requires the user to have already connected their GitHub account
 */
export const listGitHubRepos = query({
    args: {},
    handler: async (ctx) => {
        // This is a placeholder - actual GitHub API calls happen in actions
        // Queries can't make external HTTP requests
        // The frontend will call the action and cache results
        return [];
    },
});

/**
 * Get sync status for a specific repository
 */
export const getRepoSyncStatus = query({
    args: { repositoryId: v.id("repositories") },
    handler: async (ctx, args) => {
        const repo = await ctx.db.get(args.repositoryId);
        if (!repo) return null;

        // Get recent sync logs
        const recentLogs = await ctx.db
            .query("githubSyncLog")
            .withIndex("by_repositoryId", (q) => q.eq("repositoryId", args.repositoryId))
            .order("desc")
            .take(10);

        return {
            isGitHubSynced: !!repo.githubId,
            syncEnabled: repo.syncEnabled ?? false,
            lastSyncedAt: repo.lastSyncedAt,
            syncStatus: repo.syncStatus ?? "idle",
            githubFullName: repo.githubFullName,
            githubUrl: repo.githubUrl,
            webhookId: repo.webhookId,
            recentLogs: recentLogs.map((log) => ({
                eventType: log.eventType,
                direction: log.direction,
                success: log.success,
                error: log.error,
                timestamp: log.timestamp,
            })),
        };
    },
});

/**
 * List all synced repositories for the current user
 */
export const listSyncedRepos = query({
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

        const repos = await ctx.db
            .query("repositories")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
            .collect();

        return repos.filter((repo) => repo.githubId != null);
    },
});

// ============ Internal Queries (for actions) ============

/**
 * Get repository data needed for sync operations
 */
export const getRepoForSync = internalQuery({
    args: { repositoryId: v.id("repositories") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.repositoryId);
    },
});

/**
 * Get issue's GitHub ID for outbound sync
 */
export const getIssueGitHubId = internalQuery({
    args: { issueId: v.id("issues") },
    handler: async (ctx, args) => {
        const issue = await ctx.db.get(args.issueId);
        if (!issue) return null;
        return {
            githubId: issue.githubId,
            repositoryId: issue.repositoryId,
        };
    },
});

/**
 * Get PR's GitHub ID for outbound sync
 */
export const getPRGitHubId = internalQuery({
    args: { prId: v.id("pullRequests") },
    handler: async (ctx, args) => {
        const pr = await ctx.db.get(args.prId);
        if (!pr) return null;
        return {
            githubId: pr.githubId,
            repositoryId: pr.repositoryId,
        };
    },
});

/**
 * Find repository by GitHub ID  
 */
export const getRepoByGitHubId = internalQuery({
    args: { githubId: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("repositories")
            .withIndex("by_githubId", (q) => q.eq("githubId", args.githubId))
            .unique();
    },
});

/**
 * Get GitHub access token from Better Auth's account table
 * This is where linkSocial stores the OAuth tokens
 */
export const getBetterAuthGitHubToken = internalQuery({
    args: { betterAuthUserId: v.string() },
    returns: v.union(
        v.object({
            accessToken: v.string(),
            accountId: v.string(),
        }),
        v.null()
    ),
    handler: async (ctx, args): Promise<{ accessToken: string; accountId: string } | null> => {
        const githubAccount = await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "account",
            where: [
                { field: "userId", value: args.betterAuthUserId },
                { field: "providerId", value: "github" },
            ],
        });

        if (!githubAccount || !githubAccount.accessToken) {
            return null;
        }

        return {
            accessToken: githubAccount.accessToken as string,
            accountId: githubAccount.accountId as string,
        };
    },
});

/**
 * Get a GitHub access token for any authenticated user
 * Used by getRepoViewData action to fetch repository contents
 */
export const getAnyGitHubToken = internalQuery({
    args: {},
    returns: v.union(
        v.object({
            accessToken: v.string(),
            userId: v.string(),
        }),
        v.null()
    ),
    handler: async (ctx): Promise<{ accessToken: string; userId: string } | null> => {
        // Get any GitHub connection that has a valid token
        // First check custom githubConnections
        const customConnection = await ctx.db
            .query("githubConnections")
            .filter((q) => q.neq(q.field("accessToken"), null))
            .first();

        if (customConnection?.accessToken) {
            return {
                accessToken: customConnection.accessToken,
                userId: customConnection.userId,
            };
        }

        // Check Better Auth accounts for any GitHub connection
        const githubAccount = await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "account",
            where: [
                { field: "providerId", value: "github" },
            ],
        });

        if (githubAccount?.accessToken) {
            return {
                accessToken: githubAccount.accessToken as string,
                userId: githubAccount.userId as string,
            };
        }

        return null;
    },
});
