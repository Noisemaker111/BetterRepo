/**
 * GitHub Sync Actions
 * External API calls for GitHub integration
 */

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import * as githubApi from "./api";

/**
 * Complete GitHub OAuth flow and save connection
 * Called after user authorizes the GitHub OAuth app
 */
export const completeOAuthFlow = action({
    args: {
        code: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error("GitHub OAuth not configured");
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: args.code,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error("Failed to exchange code for token");
        }

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error);
        }

        const { access_token, token_type, scope } = tokenData;

        // Get GitHub user info
        const githubUser = await githubApi.getCurrentUser(access_token);

        // Save connection to database
        await ctx.runMutation(internal.github.mutations.saveConnection, {
            userId: args.userId,
            githubUserId: githubUser.id,
            githubUsername: githubUser.login,
            accessToken: access_token,
            tokenType: token_type,
            scope,
            avatarUrl: githubUser.avatar_url,
        });

        return {
            success: true,
            username: githubUser.login,
            avatarUrl: githubUser.avatar_url,
        };
    },
});

/**
 * List repositories the user has access to on GitHub
 */
export const listAvailableRepos = action({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
            userId: args.userId,
        });

        if (!accessToken) {
            throw new Error("No GitHub connection found. Please connect your GitHub account first.");
        }

        try {
            const repos = await githubApi.listUserRepos(accessToken, {
                type: "all",
                sort: "updated",
                perPage: 100,
            });

            return repos.map((repo) => ({
                id: repo.id,
                nodeId: repo.node_id,
                name: repo.name,
                fullName: repo.full_name,
                owner: repo.owner.login,
                description: repo.description,
                htmlUrl: repo.html_url,
                private: repo.private,
                defaultBranch: repo.default_branch,
                permissions: repo.permissions,
                updatedAt: repo.updated_at,
            }));
        } catch (error) {
            console.error("Error fetching GitHub repos:", error);
            throw new Error("Failed to fetch repositories from GitHub");
        }
    },
});

/**
 * Import a GitHub repository and set up sync
 */
export const importRepository = action({
    args: {
        userId: v.string(),
        githubRepoFullName: v.string(), // "owner/repo" format
    },
    handler: async (ctx, args): Promise<{ repositoryId: string; hasWebhook: boolean }> => {
        const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
            userId: args.userId,
        });

        if (!accessToken) {
            throw new Error("No GitHub connection found");
        }

        const [owner, repoName] = args.githubRepoFullName.split("/");
        if (!owner || !repoName) {
            throw new Error("Invalid repository name format. Expected 'owner/repo'");
        }

        // Fetch repo details from GitHub
        const repo = await githubApi.getRepository(accessToken, owner, repoName);

        // Check permissions
        const githubUser = await githubApi.getCurrentUser(accessToken);
        const permission = await githubApi.checkRepoPermission(
            accessToken,
            owner,
            repoName,
            githubUser.login
        );

        if (permission.permission === "none") {
            throw new Error("You don't have access to this repository");
        }

        // Import repository
        const repositoryId = await ctx.runMutation(internal.github.mutations.importRepository, {
            userId: args.userId,
            githubId: repo.id,
            githubNodeId: repo.node_id,
            name: repo.name,
            owner: repo.owner.login,
            fullName: repo.full_name,
            description: repo.description ?? undefined,
            htmlUrl: repo.html_url,
            defaultBranch: repo.default_branch,
            isPrivate: repo.private,
        });

        // Log the import
        await ctx.runMutation(internal.github.mutations.logSyncEvent, {
            repositoryId,
            eventType: "repository.imported",
            direction: "inbound",
            success: true,
        });

        // Return - webhook setup will be done separately by the user
        return {
            repositoryId: repositoryId as string,
            hasWebhook: false,
            // Note: User can set up webhook separately via setupWebhookAction 
        };
    },
});

/**
 * Set up webhook for real-time sync
 */
export const setupWebhook = internalAction({
    args: {
        userId: v.string(),
        repositoryId: v.id("repositories"),
    },
    handler: async (ctx, args) => {
        const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
            userId: args.userId,
        });

        if (!accessToken) {
            throw new Error("No GitHub connection found");
        }

        const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
            repositoryId: args.repositoryId,
        });

        if (!repo || !repo.githubFullName) {
            throw new Error("Repository not found or not synced with GitHub");
        }

        const [owner, repoName] = repo.githubFullName.split("/");

        // Generate webhook secret
        const webhookSecret = crypto.randomUUID();

        // Get the webhook URL (Convex HTTP endpoint)
        const convexUrl = process.env.CONVEX_SITE_URL;
        if (!convexUrl) {
            throw new Error("CONVEX_SITE_URL not configured");
        }

        const webhookUrl = `${convexUrl}/github/webhook`;

        try {
            // Create webhook on GitHub
            const webhook = await githubApi.createWebhook(
                accessToken,
                owner,
                repoName,
                webhookUrl,
                webhookSecret,
                ["issues", "pull_request", "issue_comment"]
            );

            // Save webhook info
            await ctx.runMutation(internal.github.mutations.saveWebhookInfo, {
                repositoryId: args.repositoryId,
                webhookId: webhook.id,
                webhookSecret,
            });

            return { webhookId: webhook.id };
        } catch (error) {
            console.error("Error setting up webhook:", error);
            // Log the error but don't fail the import
            await ctx.runMutation(internal.github.mutations.logSyncEvent, {
                repositoryId: args.repositoryId,
                eventType: "webhook.setup_failed",
                direction: "outbound",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
            return { webhookId: null };
        }
    },
});

/**
 * Full sync: pull all issues and PRs from GitHub
 */
export const fullSync = action({
    args: {
        userId: v.string(),
        repositoryId: v.id("repositories"),
    },
    handler: async (ctx, args) => {
        // Set syncing status
        await ctx.runMutation(internal.github.mutations.updateSyncStatus, {
            repositoryId: args.repositoryId,
            status: "syncing",
        });

        try {
            const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
                userId: args.userId,
            });

            if (!accessToken) {
                throw new Error("No GitHub connection found");
            }

            const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
                repositoryId: args.repositoryId,
            });

            if (!repo || !repo.githubFullName) {
                throw new Error("Repository not found or not synced with GitHub");
            }

            const [owner, repoName] = repo.githubFullName.split("/");

            // Sync issues
            let issuesSynced = 0;
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const issues = await githubApi.listIssues(accessToken, owner, repoName, {
                    state: "all",
                    perPage: 100,
                    page,
                });

                if (issues.length === 0) {
                    hasMore = false;
                    break;
                }

                // Filter out pull requests (GitHub API returns PRs in issues endpoint)
                const realIssues = issues.filter((issue) => !("pull_request" in issue));

                for (const issue of realIssues) {
                    await ctx.runMutation(internal.github.mutations.syncIssueFromGitHub, {
                        repositoryId: args.repositoryId,
                        githubId: issue.number,
                        githubNodeId: issue.node_id,
                        githubUrl: issue.html_url,
                        title: issue.title,
                        body: issue.body || "",
                        state: issue.state,
                        authorId: args.userId, // Default to importing user
                    });
                    issuesSynced++;
                }

                page++;
                if (issues.length < 100) hasMore = false;
            }

            // Sync pull requests
            let prsSynced = 0;
            page = 1;
            hasMore = true;

            while (hasMore) {
                const prs = await githubApi.listPullRequests(accessToken, owner, repoName, {
                    state: "all",
                    perPage: 100,
                    page,
                });

                if (prs.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const pr of prs) {
                    await ctx.runMutation(internal.github.mutations.syncPRFromGitHub, {
                        repositoryId: args.repositoryId,
                        githubId: pr.number,
                        githubNodeId: pr.node_id,
                        githubUrl: pr.html_url,
                        title: pr.title,
                        body: pr.body || "",
                        state: pr.state,
                        merged: pr.merged,
                        sourceBranch: pr.head.ref,
                        targetBranch: pr.base.ref,
                        authorId: args.userId,
                    });
                    prsSynced++;
                }

                page++;
                if (prs.length < 100) hasMore = false;
            }

            // Update sync status
            await ctx.runMutation(internal.github.mutations.updateSyncStatus, {
                repositoryId: args.repositoryId,
                status: "idle",
                lastSyncedAt: Date.now(),
            });

            // Log success
            await ctx.runMutation(internal.github.mutations.logSyncEvent, {
                repositoryId: args.repositoryId,
                eventType: "full_sync",
                direction: "inbound",
                success: true,
                payload: JSON.stringify({ issuesSynced, prsSynced }),
            });

            return { issuesSynced, prsSynced };
        } catch (error) {
            // Update status to error
            await ctx.runMutation(internal.github.mutations.updateSyncStatus, {
                repositoryId: args.repositoryId,
                status: "error",
            });

            // Log failure
            await ctx.runMutation(internal.github.mutations.logSyncEvent, {
                repositoryId: args.repositoryId,
                eventType: "full_sync",
                direction: "inbound",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        }
    },
});

/**
 * Push changes to GitHub (outbound sync)
 * Called when an issue or PR is updated in BetterRepo
 */
export const pushToGitHub = internalAction({
    args: {
        userId: v.string(),
        type: v.union(v.literal("issue"), v.literal("pr")),
        action: v.union(v.literal("create"), v.literal("update"), v.literal("close")),
        repositoryId: v.id("repositories"),
        itemId: v.string(), // Issue or PR ID
        data: v.object({
            title: v.optional(v.string()),
            body: v.optional(v.string()),
            state: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const accessToken = await ctx.runMutation(internal.github.mutations.getAccessToken, {
            userId: args.userId,
        });

        if (!accessToken) {
            console.log("No GitHub connection, skipping push");
            return;
        }

        const repo = await ctx.runQuery(internal.github.queries.getRepoForSync, {
            repositoryId: args.repositoryId,
        });

        if (!repo || !repo.githubFullName || !repo.syncEnabled) {
            console.log("Repository not synced or sync disabled, skipping push");
            return;
        }

        const [owner, repoName] = repo.githubFullName.split("/");

        try {
            if (args.type === "issue") {
                if (args.action === "create") {
                    const newIssue = await githubApi.createIssue(accessToken, owner, repoName, {
                        title: args.data.title!,
                        body: args.data.body,
                    });

                    // TODO: Update local issue with GitHub ID
                    console.log("Created GitHub issue:", newIssue.number);
                } else if (args.action === "update" || args.action === "close") {
                    const issue = await ctx.runQuery(internal.github.queries.getIssueGitHubId, {
                        issueId: args.itemId as any,
                    });

                    if (issue?.githubId) {
                        await githubApi.updateIssue(accessToken, owner, repoName, issue.githubId, {
                            title: args.data.title,
                            body: args.data.body,
                            state: args.action === "close" ? "closed" : "open",
                        });
                    }
                }
            }

            // Log success
            await ctx.runMutation(internal.github.mutations.logSyncEvent, {
                repositoryId: args.repositoryId,
                eventType: `${args.type}.${args.action}`,
                direction: "outbound",
                success: true,
            });
        } catch (error) {
            console.error("Error pushing to GitHub:", error);

            await ctx.runMutation(internal.github.mutations.logSyncEvent, {
                repositoryId: args.repositoryId,
                eventType: `${args.type}.${args.action}`,
                direction: "outbound",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
});

/**
 * Fetch repository view data (contents, branches, README, languages)
 * Used by the repository index page to display real GitHub data
 */
type RepoViewData = {
    error: string | null;
    contents: Array<{
        name: string;
        path: string;
        type: "file" | "dir";
        size: number;
        sha: string;
        lastCommit: {
            message: string;
            date: string;
            authorName: string;
        } | null;
    }> | null;
    readme: { content: string; name: string } | null;
    languages: { [lang: string]: number } | null;
    branches: Array<{ name: string; isDefault: boolean }> | null;
    lastCommit: {
        sha: string;
        message: string;
        date: string;
        authorName: string;
        authorAvatar: string | null;
    } | null;
};

type ContentItem = {
    name: string;
    path: string;
    type: "file" | "dir";
    size: number;
    sha: string;
    lastCommit: {
        message: string;
        date: string;
        authorName: string;
    } | null;
};

export const getRepoViewData = action({
    args: {
        owner: v.string(),
        repo: v.string(),
        path: v.optional(v.string()),
        ref: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<RepoViewData> => {
        // Get access token from any authenticated user with GitHub connected
        // We use internal query to check for connection
        const connection = await ctx.runQuery(internal.github.queries.getAnyGitHubToken) as { accessToken: string; userId: string } | null;

        if (!connection?.accessToken) {
            return {
                error: "No GitHub connection available",
                contents: null,
                readme: null,
                languages: null,
                branches: null,
                lastCommit: null,
            };
        }

        const accessToken: string = connection.accessToken;
        const path = args.path ?? "";
        const ref = args.ref;

        try {
            // Fetch contents, readme, languages, and branches in parallel
            const [contentsResult, readmeResult, languagesResult, branchesResult, lastCommitResult] = await Promise.allSettled([
                githubApi.getRepoContents(accessToken, args.owner, args.repo, path, ref),
                githubApi.getReadme(accessToken, args.owner, args.repo, ref),
                githubApi.getLanguages(accessToken, args.owner, args.repo),
                githubApi.listBranches(accessToken, args.owner, args.repo, { perPage: 30 }),
                githubApi.getRepoCommits(accessToken, args.owner, args.repo, {
                    sha: ref,
                    perPage: 1,
                }),
            ]);

            // Process contents - add last commit info for each file/dir
            let contents: ContentItem[] | null = null;

            if (contentsResult.status === "fulfilled" && Array.isArray(contentsResult.value)) {
                // Get last commit for each file (limit to first 20 to avoid rate limits)
                const filesWithCommits: ContentItem[] = await Promise.all(
                    (contentsResult.value as Array<{ name: string; path: string; type: string; size: number; sha: string }>).slice(0, 30).map(async (item): Promise<ContentItem> => {
                        let lastCommit: { message: string; date: string; authorName: string } | null = null;
                        try {
                            const commit = await githubApi.getFileLastCommit(
                                accessToken,
                                args.owner,
                                args.repo,
                                item.path,
                                ref
                            );
                            if (commit) {
                                lastCommit = {
                                    message: commit.commit.message.split('\n')[0], // First line only
                                    date: commit.commit.committer.date,
                                    authorName: commit.commit.author.name,
                                };
                            }
                        } catch {
                            // Ignore errors for individual files
                        }
                        return {
                            name: item.name,
                            path: item.path,
                            type: item.type as "file" | "dir",
                            size: item.size,
                            sha: item.sha,
                            lastCommit,
                        };
                    })
                );
                // Sort: directories first, then files, both alphabetically
                contents = filesWithCommits.sort((a: ContentItem, b: ContentItem) => {
                    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
                    return a.name.localeCompare(b.name);
                });
            }

            // Process README
            let readme: { content: string; name: string } | null = null;
            if (readmeResult.status === "fulfilled" && readmeResult.value) {
                try {
                    const decodedContent = atob(readmeResult.value.content.replace(/\n/g, ""));
                    readme = {
                        content: decodedContent,
                        name: readmeResult.value.name,
                    };
                } catch {
                    readme = null;
                }
            }

            // Process languages
            let languages: { [lang: string]: number } | null = null;
            if (languagesResult.status === "fulfilled") {
                const totalBytes = Object.values(languagesResult.value).reduce((a, b) => a + b, 0);
                if (totalBytes > 0) {
                    languages = {};
                    for (const [lang, bytes] of Object.entries(languagesResult.value)) {
                        languages[lang] = Math.round((bytes / totalBytes) * 100);
                    }
                }
            }

            // Process branches
            let branches: Array<{ name: string; isDefault: boolean }> | null = null;
            if (branchesResult.status === "fulfilled") {
                branches = branchesResult.value.map((b) => ({
                    name: b.name,
                    isDefault: false, // We'll mark default below
                }));
            }

            // Process last commit for the repo/path
            let lastCommit: {
                sha: string;
                message: string;
                date: string;
                authorName: string;
                authorAvatar: string | null;
            } | null = null;
            if (lastCommitResult.status === "fulfilled" && lastCommitResult.value.length > 0) {
                const commit = lastCommitResult.value[0];
                lastCommit = {
                    sha: commit.sha.substring(0, 7),
                    message: commit.commit.message.split('\n')[0],
                    date: commit.commit.committer.date,
                    authorName: commit.commit.author.name,
                    authorAvatar: commit.author?.avatar_url ?? null,
                };
            }

            return {
                error: null,
                contents,
                readme,
                languages,
                branches,
                lastCommit,
            };
        } catch (error) {
            console.error("Error fetching repo view data:", error);
            return {
                error: error instanceof Error ? error.message : "Failed to fetch repository data",
                contents: null,
                readme: null,
                languages: null,
                branches: null,
                lastCommit: null,
            };
        }
    },
});
