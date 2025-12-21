/**
 * GitHub Webhook Handler
 * HTTP endpoint for receiving GitHub webhook events
 */

import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { IssueWebhookPayload, PullRequestWebhookPayload } from "./types";

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

/**
 * Main webhook handler
 */
export const webhookHandler = httpAction(async (ctx, request) => {
    // Get headers
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");
    const deliveryId = request.headers.get("x-github-delivery");

    if (!signature || !event) {
        return new Response("Missing required headers", { status: 400 });
    }

    // Read body
    const body = await request.text();

    let payload: IssueWebhookPayload | PullRequestWebhookPayload;
    try {
        payload = JSON.parse(body);
    } catch {
        return new Response("Invalid JSON payload", { status: 400 });
    }

    // Get repository from payload
    const githubRepoId = payload.repository?.id;
    if (!githubRepoId) {
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

    // Get owner ID for creating issues/PRs
    const ownerId = repo.ownerId;

    try {
        // Handle different event types
        switch (event) {
            case "issues":
                await handleIssueEvent(ctx, repo._id, ownerId, payload as IssueWebhookPayload);
                break;
            case "pull_request":
                await handlePREvent(ctx, repo._id, ownerId, payload as PullRequestWebhookPayload);
                break;
            case "ping":
                // GitHub sends a ping event when webhook is first created
                console.log(`Webhook ping received for repo: ${repo._id}`);
                break;
            default:
                console.log(`Unhandled event type: ${event}`);
        }

        // Log success
        await ctx.runMutation(internal.github.mutations.logSyncEvent, {
            repositoryId: repo._id,
            eventType: `webhook.${event}.${payload.action}`,
            direction: "inbound",
            success: true,
            payload: JSON.stringify({ deliveryId, action: payload.action }),
        });

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Webhook handler error:", error);

        // Log failure
        await ctx.runMutation(internal.github.mutations.logSyncEvent, {
            repositoryId: repo._id,
            eventType: `webhook.${event}.${payload.action}`,
            direction: "inbound",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });

        return new Response("Internal error", { status: 500 });
    }
});

/**
 * Handle issue events
 */
async function handleIssueEvent(
    ctx: any,
    repositoryId: any,
    ownerId: string,
    payload: IssueWebhookPayload
) {
    const issue = payload.issue;
    const action = payload.action;

    if (action === "opened" || action === "edited" || action === "reopened" || action === "closed") {
        await ctx.runMutation(internal.github.mutations.syncIssueFromGitHub, {
            repositoryId,
            githubId: issue.number,
            githubNodeId: issue.node_id,
            githubUrl: issue.html_url,
            title: issue.title,
            body: issue.body || "",
            state: issue.state,
            authorId: ownerId, // Default to repo owner
        });
    }

    if (action === "deleted") {
        // Note: Deletion is tricky - we might want to mark as deleted rather than actually delete
        console.log(`Issue ${issue.number} deleted on GitHub`);
    }
}

/**
 * Handle pull request events
 */
async function handlePREvent(
    ctx: any,
    repositoryId: any,
    ownerId: string,
    payload: PullRequestWebhookPayload
) {
    const pr = payload.pull_request;
    const action = payload.action;

    if (action === "opened" || action === "edited" || action === "reopened" || action === "closed" || action === "synchronize") {
        await ctx.runMutation(internal.github.mutations.syncPRFromGitHub, {
            repositoryId,
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
}
