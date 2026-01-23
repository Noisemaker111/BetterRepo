/**
 * GitHub Webhook Handler
 * HTTP endpoint for receiving GitHub webhook events
 */

import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { IssueCommentWebhookPayload, IssueWebhookPayload, PullRequestWebhookPayload } from "./types";

// Webhook signature verification using Web Crypto API
async function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(payload)
    );

    const expectedSignature = "sha256=" + Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return signature === expectedSignature;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getRepoIdFromPayload(payload: unknown): number | null {
    if (!isRecord(payload)) return null;
    const repo = payload.repository;
    if (!isRecord(repo)) return null;
    const id = repo.id;
    return typeof id === "number" ? id : null;
}

function getActionFromPayload(payload: unknown): string | undefined {
    if (!isRecord(payload)) return undefined;
    const action = payload.action;
    return typeof action === "string" ? action : undefined;
}

function isIssueWebhookPayload(payload: unknown): payload is IssueWebhookPayload {
    if (!isRecord(payload)) return false;
    return isRecord(payload.issue) && typeof payload.action === "string";
}

function isPullRequestWebhookPayload(payload: unknown): payload is PullRequestWebhookPayload {
    if (!isRecord(payload)) return false;
    return isRecord(payload.pull_request) && typeof payload.action === "string";
}

function isIssueCommentWebhookPayload(payload: unknown): payload is IssueCommentWebhookPayload {
    if (!isRecord(payload)) return false;
    return isRecord(payload.issue) && isRecord(payload.comment) && typeof payload.action === "string";
}

/**
 * Main webhook handler
 */
export const webhookHandler = httpAction(async (ctx, request) => {
    // Get headers
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");
    const deliveryId = request.headers.get("x-github-delivery");

    if (!signature || !event || !deliveryId) {
        return new Response("Missing required headers", { status: 400 });
    }

    // Read body
    const body = await request.text();

    let payload: unknown;
    try {
        payload = JSON.parse(body);
    } catch {
        return new Response("Invalid JSON payload", { status: 400 });
    }

    // Get repository from payload
    const githubRepoId = getRepoIdFromPayload(payload);
    if (githubRepoId === null) {
        return new Response("Missing repository in payload", { status: 400 });
    }

    // Look up the repository to get the webhook secret
    const repo = await ctx.runQuery(internal.github.queries.getRepoByGitHubId, {
        githubId: githubRepoId,
    });

    if (!repo) {
        console.log(`Received webhook for unknown repo: ${githubRepoId}`);
        return new Response("Repository not found", { status: 404 });
    }

    if (!repo.webhookSecret) {
        console.log(`No webhook secret for repo: ${repo._id}`);
        return new Response("Webhook not configured", { status: 400 });
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(body, signature, repo.webhookSecret);
    if (!isValid) {
        console.log(`Invalid webhook signature for repo: ${repo._id}`);
        return new Response("Invalid signature", { status: 401 });
    }

    // Check if sync is enabled
    if (!repo.syncEnabled) {
        console.log(`Sync disabled for repo: ${repo._id}`);
        return new Response("Sync disabled", { status: 200 });
    }

    // Idempotency: skip duplicate deliveries
    const isNewDelivery = await ctx.runMutation(internal.github.mutations.recordWebhookDelivery, {
        repositoryId: repo._id,
        deliveryId,
        event,
        action: getActionFromPayload(payload),
    });

    if (!isNewDelivery) {
        return new Response("OK", { status: 200 });
    }

    // Get owner ID for creating issues/PRs
    const ownerId = repo.ownerId;

    const handleIssueEvent = async (payload: IssueWebhookPayload) => {
        const issue = payload.issue;
        const action = payload.action;

        if (action === "opened" || action === "edited" || action === "reopened" || action === "closed") {
            await ctx.runMutation(internal.github.mutations.syncIssueFromGitHub, {
                repositoryId: repo._id,
                githubId: issue.number,
                githubNodeId: issue.node_id,
                githubUrl: issue.html_url,
                title: issue.title,
                body: issue.body || "",
                state: issue.state,
                authorId: ownerId,
            });
        }

        if (action === "deleted") {
            console.log(`Issue ${issue.number} deleted on GitHub`);
        }
    };

    const handleIssueCommentEvent = async (payload: IssueCommentWebhookPayload) => {
        const issue = payload.issue;
        const comment = payload.comment;
        const action = payload.action;

        // Ensure issue exists locally
        await ctx.runMutation(internal.github.mutations.syncIssueFromGitHub, {
            repositoryId: repo._id,
            githubId: issue.number,
            githubNodeId: issue.node_id,
            githubUrl: issue.html_url,
            title: issue.title,
            body: issue.body || "",
            state: issue.state,
            authorId: ownerId,
        });

        if (action === "deleted") {
            // Soft-delete not implemented; just log for now.
            return;
        }

        await ctx.runMutation(internal.github.mutations.syncIssueCommentFromGitHub, {
            repositoryId: repo._id,
            issueGithubId: issue.number,
            commentGithubId: comment.id,
            commentNodeId: comment.node_id,
            commentUrl: comment.html_url,
            body: comment.body || "",
            authorId: ownerId,
        });
    };

    const handlePREvent = async (payload: PullRequestWebhookPayload) => {
        const pr = payload.pull_request;
        const action = payload.action;

        if (action === "opened" || action === "edited" || action === "reopened" || action === "closed" || action === "synchronize") {
            await ctx.runMutation(internal.github.mutations.syncPRFromGitHub, {
                repositoryId: repo._id,
                githubId: pr.number,
                githubNodeId: pr.node_id,
                githubUrl: pr.html_url,
                title: pr.title,
                body: pr.body || "",
                state: pr.state,
                merged: pr.merged,
                sourceBranch: pr.head.ref,
                targetBranch: pr.base.ref,
                authorId: ownerId,
            });
        }
    };

    const handlePushEvent = async (payload: unknown) => {
        if (!isRecord(payload)) return;
        const commitsValue = payload.commits;
        if (!Array.isArray(commitsValue)) return;

        const changedPaths: string[] = [];
        for (const commit of commitsValue) {
            if (!isRecord(commit)) continue;
            const added = commit.added;
            const modified = commit.modified;
            const removed = commit.removed;

            if (Array.isArray(added)) changedPaths.push(...added.filter((p): p is string => typeof p === "string"));
            if (Array.isArray(modified)) changedPaths.push(...modified.filter((p): p is string => typeof p === "string"));
            if (Array.isArray(removed)) changedPaths.push(...removed.filter((p): p is string => typeof p === "string"));
        }

        const uniquePaths = [...new Set(changedPaths)];

        if (uniquePaths.length > 0) {
            await ctx.runMutation(internal.repositoryFiles.mutations.invalidateFilesBySha, {
                repositoryId: repo._id,
                changedPaths: uniquePaths,
                timestamp: Date.now(),
            });

            console.log(`Invalidated ${uniquePaths.length} cached files for repo: ${repo._id}`);
        }
    };

    try {
        switch (event) {
            case "issues":
                if (!isIssueWebhookPayload(payload)) {
                    return new Response("Invalid issues payload", { status: 400 });
                }
                await handleIssueEvent(payload);
                break;
            case "issue_comment":
                if (!isIssueCommentWebhookPayload(payload)) {
                    return new Response("Invalid issue_comment payload", { status: 400 });
                }
                await handleIssueCommentEvent(payload);
                break;
            case "pull_request":
                if (!isPullRequestWebhookPayload(payload)) {
                    return new Response("Invalid pull_request payload", { status: 400 });
                }
                await handlePREvent(payload);
                break;
            case "push":
                await handlePushEvent(payload);
                break;
            case "ping":
                console.log(`Webhook ping received for repo: ${repo._id}`);
                break;
            default:
                console.log(`Unhandled event type: ${event}`);
        }

        await ctx.runMutation(internal.github.mutations.logSyncEvent, {
            repositoryId: repo._id,
            eventType: `webhook.${event}.${getActionFromPayload(payload) ?? "none"}`,
            direction: "inbound",
            success: true,
            payload: JSON.stringify({ deliveryId, action: getActionFromPayload(payload) }),
        });

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Webhook handler error:", error);

        // Log failure
        await ctx.runMutation(internal.github.mutations.logSyncEvent, {
            repositoryId: repo._id,
            eventType: `webhook.${event}.${getActionFromPayload(payload) ?? "none"}`,
            direction: "inbound",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });

        return new Response("Internal error", { status: 500 });
    }
});
