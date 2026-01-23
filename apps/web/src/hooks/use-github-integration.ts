/**
 * GitHub Integration Hook
 * Manages GitHub OAuth flow via Better Auth and repository sync operations
 */

import { useState, useCallback } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import type { Id } from "@BetterRepo/backend/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

export interface GitHubRepo {
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    owner: string;
    description: string | null;
    htmlUrl: string;
    private: boolean;
    defaultBranch: string;
    permissions?: {
        admin: boolean;
        push: boolean;
        pull: boolean;
    };
    updatedAt: string;
}

export function useGitHubIntegration(userId: string | null) {
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [availableRepos, setAvailableRepos] = useState<GitHubRepo[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Queries
    const connection = useQuery(api.github.queries.getConnection);
    const syncedRepos = useQuery(api.github.queries.listSyncedRepos);

    // Actions
    const listReposAction = useAction(api.github.actions.listAvailableRepos);
    const importRepoAction = useAction(api.github.actions.importRepository);
    const fullSyncAction = useAction(api.github.actions.fullSync);
    const setupWebhookAction = useAction(api.github.actions.setupWebhookForRepo);

    // Mutations
    const disconnectMutation = useMutation(api.github.mutations.disconnectGitHub);
    const toggleSyncMutation = useMutation(api.github.mutations.toggleSync);

    /**
     * Initiate GitHub OAuth flow via Better Auth
     * This uses the same GitHub provider configured in the backend,
     * with extra scopes for repo access.
     */
    const connectGitHub = useCallback(async () => {
        try {
            // Let Better Auth handle the callback URL - don't specify it explicitly
            // to avoid callbackURL validation issues with cross-domain setup
            await authClient.linkSocial({
                provider: "github",
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to connect GitHub";
            console.error("GitHub connect error:", errorMsg);
            setError(errorMsg);
        }
    }, []);

    /**
     * Disconnect GitHub account
     */
    const disconnectGitHub = useCallback(async () => {
        await disconnectMutation();
        setAvailableRepos([]);
    }, [disconnectMutation]);

    /**
     * Fetch available repositories from GitHub
     */
    const fetchAvailableRepos = useCallback(async () => {
        if (!userId) return;

        setIsLoadingRepos(true);
        setError(null);

        try {
            const repos = await listReposAction({ userId });
            setAvailableRepos(repos as GitHubRepo[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch repositories");
        } finally {
            setIsLoadingRepos(false);
        }
    }, [listReposAction, userId]);

    /**
     * Import a repository from GitHub
     */
    const importRepository = useCallback(async (fullName: string) => {
        if (!userId) throw new Error("Not authenticated");

        const result = await importRepoAction({
            userId,
            githubRepoFullName: fullName,
        });

        return result;
    }, [importRepoAction, userId]);

    /**
     * Trigger a full sync for a repository
     */
    const syncRepository = useCallback(async (repositoryId: Id<"repositories">) => {
        if (!userId) throw new Error("Not authenticated");

        const result = await fullSyncAction({
            userId,
            repositoryId,
        });

        return result;
    }, [fullSyncAction, userId]);

    /**
     * Toggle sync for a repository
     */
    const toggleSync = useCallback(async (repositoryId: Id<"repositories">, enabled: boolean) => {
        await toggleSyncMutation({ repositoryId, enabled });
    }, [toggleSyncMutation]);

    const setupWebhook = useCallback(async (repositoryId: Id<"repositories">) => {
        const res = await setupWebhookAction({ repositoryId });
        return res.webhookId != null;
    }, [setupWebhookAction]);

    return {
        // Connection state
        isConnected: !!connection?.hasToken,
        connection,

        // Repository state
        syncedRepos: syncedRepos ?? [],
        availableRepos,
        isLoadingRepos,

        // Error state
        error,
        clearError: () => setError(null),

        // Actions
        connectGitHub,
        disconnectGitHub,
        fetchAvailableRepos,
        importRepository,
        syncRepository,
        toggleSync,
        setupWebhook,
    };
}
