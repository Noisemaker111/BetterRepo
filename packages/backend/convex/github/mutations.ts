/**
 * GitHub Sync Mutations
 * Database operations for GitHub sync state
 */

import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { authComponent } from "../auth";

/**
 * Save GitHub OAuth connection after successful authentication
 * Called by the action after OAuth flow completes
 */
export const saveConnection = internalMutation({
    args: {
        userId: v.string(),
        githubUserId: v.number(),
        githubUsername: v.string(),
        accessToken: v.string(),
        tokenType: v.string(),
        scope: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for existing connection
        const existing = await ctx.db
            .query("githubConnections")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            // Update existing connection
            await ctx.db.patch(existing._id, {
                githubUserId: args.githubUserId,
                githubUsername: args.githubUsername,
                accessToken: args.accessToken,
                tokenType: args.tokenType,
                scope: args.scope,
                avatarUrl: args.avatarUrl,
                lastUsedAt: Date.now(),
            });
            return existing._id;
        }

        // Create new connection
        return await ctx.db.insert("githubConnections", {
            userId: args.userId,
            githubUserId: args.githubUserId,
            githubUsername: args.githubUsername,
            accessToken: args.accessToken,
            tokenType: args.tokenType,
            scope: args.scope,
            avatarUrl: args.avatarUrl,
            connectedAt: Date.now(),
        });
    },
});

/**
 * Disconnect GitHub account
 */
export const disconnectGitHub = mutation({
    args: {},
    handler: async (ctx) => {
        let user;
        try {
            user = await authComponent.getAuthUser(ctx);
        } catch (e) {
            throw new Error("Not authenticated");
        }
        if (!user) throw new Error("Not authenticated");

        const userId = user.userId || user._id.toString();

        const connection = await ctx.db
            .query("githubConnections")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (connection) {
            await ctx.db.delete(connection._id);
        }
    },
});

/**
 * Import a GitHub repository into BetterRepo
 */
export const importRepository = internalMutation({
    args: {
        userId: v.string(),
        githubId: v.number(),
        githubNodeId: v.string(),
        name: v.string(),
        owner: v.string(),
        fullName: v.string(),
        description: v.optional(v.string()),
        htmlUrl: v.string(),
        defaultBranch: v.string(),
        isPrivate: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Check if repo already exists
        const existing = await ctx.db
            .query("repositories")
            .withIndex("by_githubId", (q) => q.eq("githubId", args.githubId))
            .unique();

        if (existing) {
            // Update and return existing
            await ctx.db.patch(existing._id, {
                name: args.name,
                owner: args.owner,
                description: args.description,
                githubFullName: args.fullName,
                githubUrl: args.htmlUrl,
                githubDefaultBranch: args.defaultBranch,
                isPublic: !args.isPrivate,
                lastSyncedAt: Date.now(),
            });
            return existing._id;
        }

        // Create new repository
        return await ctx.db.insert("repositories", {
            name: args.name,
            owner: args.owner,
            description: args.description,
            ownerId: args.userId,
            isPublic: !args.isPrivate,
            githubId: args.githubId,
            githubNodeId: args.githubNodeId,
            githubFullName: args.fullName,
            githubUrl: args.htmlUrl,
            githubDefaultBranch: args.defaultBranch,
            syncEnabled: true,
            syncStatus: "idle",
            lastSyncedAt: Date.now(),
        });
    },
});

/**
 * Save webhook info after creating it on GitHub
 */
export const saveWebhookInfo = internalMutation({
    args: {
        repositoryId: v.id("repositories"),
        webhookId: v.number(),
        webhookSecret: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.repositoryId, {
            webhookId: args.webhookId,
            webhookSecret: args.webhookSecret,
        });
    },
});

/**
 * Update repository sync status
 */
export const updateSyncStatus = internalMutation({
    args: {
        repositoryId: v.id("repositories"),
        status: v.union(v.literal("idle"), v.literal("syncing"), v.literal("error")),
        lastSyncedAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updateData: Record<string, unknown> = { syncStatus: args.status };
        if (args.lastSyncedAt) {
            updateData.lastSyncedAt = args.lastSyncedAt;
        }
        await ctx.db.patch(args.repositoryId, updateData);
    },
});

/**
 * Toggle sync enabled/disabled
 */
export const toggleSync = mutation({
    args: {
        repositoryId: v.id("repositories"),
        enabled: v.boolean(),
    },
    handler: async (ctx, args) => {
        let user;
        try {
            user = await authComponent.getAuthUser(ctx);
        } catch (e) {
            throw new Error("Not authenticated");
        }
        if (!user) throw new Error("Not authenticated");

        const userId = user.userId || user._id.toString();
        const repo = await ctx.db.get(args.repositoryId);

        if (!repo || repo.ownerId !== userId) {
            throw new Error("Repository not found or access denied");
        }

        await ctx.db.patch(args.repositoryId, {
            syncEnabled: args.enabled,
        });
    },
});

/**
 * Log a sync event
 */
export const logSyncEvent = internalMutation({
    args: {
        repositoryId: v.id("repositories"),
        eventType: v.string(),
        direction: v.union(v.literal("inbound"), v.literal("outbound")),
        success: v.boolean(),
        error: v.optional(v.string()),
        payload: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("githubSyncLog", {
            repositoryId: args.repositoryId,
            eventType: args.eventType,
            direction: args.direction,
            success: args.success,
            error: args.error,
            payload: args.payload,
            timestamp: Date.now(),
        });
    },
});

/**
 * Sync an issue from GitHub (create or update)
 */
export const syncIssueFromGitHub = internalMutation({
    args: {
        repositoryId: v.id("repositories"),
        githubId: v.number(),
        githubNodeId: v.string(),
        githubUrl: v.string(),
        title: v.string(),
        body: v.string(),
        state: v.string(),
        authorId: v.string(), // Will be the importing user's ID if author not in system
    },
    handler: async (ctx, args) => {
        // Check if issue already exists by githubId
        const existingIssues = await ctx.db
            .query("issues")
            .withIndex("by_githubId", (q) => q.eq("githubId", args.githubId))
            .collect();

        const existing = existingIssues.find(i => i.repositoryId?.toString() === args.repositoryId.toString());

        // Map GitHub state to BetterRepo status
        const status = args.state === "closed" ? "closed" : "backlog";

        if (existing) {
            await ctx.db.patch(existing._id, {
                title: args.title,
                body: args.body,
                status,
                githubUrl: args.githubUrl,
                lastSyncedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("issues", {
            title: args.title,
            body: args.body,
            status,
            authorId: args.authorId,
            labelIds: [],
            repositoryId: args.repositoryId,
            priority: "low",
            githubId: args.githubId,
            githubNodeId: args.githubNodeId,
            githubUrl: args.githubUrl,
            lastSyncedAt: Date.now(),
        });
    },
});

/**
 * Sync a PR from GitHub (create or update)
 */
export const syncPRFromGitHub = internalMutation({
    args: {
        repositoryId: v.id("repositories"),
        githubId: v.number(),
        githubNodeId: v.string(),
        githubUrl: v.string(),
        title: v.string(),
        body: v.string(),
        state: v.string(),
        merged: v.boolean(),
        sourceBranch: v.string(),
        targetBranch: v.string(),
        authorId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if PR already exists by githubId
        const existingPRs = await ctx.db
            .query("pullRequests")
            .withIndex("by_githubId", (q) => q.eq("githubId", args.githubId))
            .collect();

        const existing = existingPRs.find(pr => pr.repositoryId?.toString() === args.repositoryId.toString());

        // Map GitHub state to BetterRepo status
        let status: "open" | "merged" | "closed";
        if (args.merged) {
            status = "merged";
        } else if (args.state === "closed") {
            status = "closed";
        } else {
            status = "open";
        }

        if (existing) {
            await ctx.db.patch(existing._id, {
                title: args.title,
                body: args.body,
                status,
                sourceBranch: args.sourceBranch,
                targetBranch: args.targetBranch,
                githubUrl: args.githubUrl,
                lastSyncedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("pullRequests", {
            title: args.title,
            body: args.body,
            status,
            authorId: args.authorId,
            sourceBranch: args.sourceBranch,
            targetBranch: args.targetBranch,
            repositoryId: args.repositoryId,
            githubId: args.githubId,
            githubNodeId: args.githubNodeId,
            githubUrl: args.githubUrl,
            lastSyncedAt: Date.now(),
        });
    },
});

/**
 * Get access token for a user (internal use only)
 */
export const getAccessToken = internalMutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const connection = await ctx.db
            .query("githubConnections")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!connection) return null;

        // Update last used timestamp
        await ctx.db.patch(connection._id, { lastUsedAt: Date.now() });

        return connection.accessToken;
    },
});
