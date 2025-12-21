/**
 * GitHub API Client
 * Wrapper for GitHub REST API calls
 */

import type {
    GitHubRepository,
    GitHubIssue,
    GitHubPullRequest,
    GitHubWebhook,
    CreateWebhookRequest,
    GitHubUser,
} from "./types";

const GITHUB_API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

function getHeaders(accessToken: string): HeadersInit {
    return {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": API_VERSION,
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `GitHub API Error: ${response.status}`);
    }
    return response.json();
}

// ============ User Endpoints ============

export async function getCurrentUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: getHeaders(accessToken),
    });
    return handleResponse<GitHubUser>(response);
}

// ============ Repository Endpoints ============

export async function getRepository(
    accessToken: string,
    owner: string,
    repo: string
): Promise<GitHubRepository> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: getHeaders(accessToken),
    });
    return handleResponse<GitHubRepository>(response);
}

export async function listUserRepos(
    accessToken: string,
    options?: {
        type?: "all" | "owner" | "public" | "private" | "member";
        sort?: "created" | "updated" | "pushed" | "full_name";
        perPage?: number;
        page?: number;
    }
): Promise<GitHubRepository[]> {
    const params = new URLSearchParams({
        type: options?.type ?? "all",
        sort: options?.sort ?? "updated",
        per_page: String(options?.perPage ?? 30),
        page: String(options?.page ?? 1),
    });

    const response = await fetch(`${GITHUB_API_BASE}/user/repos?${params}`, {
        headers: getHeaders(accessToken),
    });
    return handleResponse<GitHubRepository[]>(response);
}

export async function checkRepoPermission(
    accessToken: string,
    owner: string,
    repo: string,
    username: string
): Promise<{ permission: "admin" | "write" | "read" | "none" }> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/collaborators/${username}/permission`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<{ permission: "admin" | "write" | "read" | "none" }>(response);
}

// ============ Issue Endpoints ============

export async function listIssues(
    accessToken: string,
    owner: string,
    repo: string,
    options?: {
        state?: "open" | "closed" | "all";
        perPage?: number;
        page?: number;
    }
): Promise<GitHubIssue[]> {
    const params = new URLSearchParams({
        state: options?.state ?? "all",
        per_page: String(options?.perPage ?? 100),
        page: String(options?.page ?? 1),
    });

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubIssue[]>(response);
}

export async function getIssue(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number
): Promise<GitHubIssue> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubIssue>(response);
}

export async function createIssue(
    accessToken: string,
    owner: string,
    repo: string,
    data: { title: string; body?: string; labels?: string[]; assignees?: string[] }
): Promise<GitHubIssue> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
        {
            method: "POST",
            headers: getHeaders(accessToken),
            body: JSON.stringify(data),
        }
    );
    return handleResponse<GitHubIssue>(response);
}

export async function updateIssue(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number,
    data: { title?: string; body?: string; state?: "open" | "closed"; labels?: string[] }
): Promise<GitHubIssue> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
        {
            method: "PATCH",
            headers: getHeaders(accessToken),
            body: JSON.stringify(data),
        }
    );
    return handleResponse<GitHubIssue>(response);
}

// ============ Pull Request Endpoints ============

export async function listPullRequests(
    accessToken: string,
    owner: string,
    repo: string,
    options?: {
        state?: "open" | "closed" | "all";
        perPage?: number;
        page?: number;
    }
): Promise<GitHubPullRequest[]> {
    const params = new URLSearchParams({
        state: options?.state ?? "all",
        per_page: String(options?.perPage ?? 100),
        page: String(options?.page ?? 1),
    });

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?${params}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubPullRequest[]>(response);
}

export async function getPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
): Promise<GitHubPullRequest> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubPullRequest>(response);
}

// ============ Webhook Endpoints ============

export async function createWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string,
    events: string[] = ["issues", "pull_request", "issue_comment"]
): Promise<GitHubWebhook> {
    const payload: CreateWebhookRequest = {
        name: "web",
        active: true,
        events: events as CreateWebhookRequest["events"],
        config: {
            url: webhookUrl,
            content_type: "json",
            secret,
            insecure_ssl: "0",
        },
    };

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/hooks`,
        {
            method: "POST",
            headers: getHeaders(accessToken),
            body: JSON.stringify(payload),
        }
    );
    return handleResponse<GitHubWebhook>(response);
}

export async function deleteWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    hookId: number
): Promise<void> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/hooks/${hookId}`,
        {
            method: "DELETE",
            headers: getHeaders(accessToken),
        }
    );

    if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete webhook: ${response.statusText}`);
    }
}

export async function listWebhooks(
    accessToken: string,
    owner: string,
    repo: string
): Promise<GitHubWebhook[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/hooks`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubWebhook[]>(response);
}
