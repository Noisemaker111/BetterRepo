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
    GitHubContent,
    GitHubCommit,
    GitHubReadme,
    GitHubLanguages,
    GitHubBranch,
    GitHubIssueComment,
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

// ============ Repository Contents Endpoints ============

/**
 * Get contents of a repository directory or file
 * @param path - Path within repo, empty string for root
 * @param ref - Branch/tag/commit SHA (optional, defaults to default branch)
 */
export async function getRepoContents(
    accessToken: string,
    owner: string,
    repo: string,
    path: string = "",
    ref?: string
): Promise<GitHubContent | GitHubContent[]> {
    const params = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : "";

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents${encodedPath}${params}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubContent | GitHubContent[]>(response);
}

/**
 * Get repository commits
 * @param options - Filter options for commits
 */
export async function getRepoCommits(
    accessToken: string,
    owner: string,
    repo: string,
    options?: {
        sha?: string; // Branch name or commit SHA
        path?: string; // Only commits containing this file path
        perPage?: number;
        page?: number;
    }
): Promise<GitHubCommit[]> {
    const params = new URLSearchParams();
    if (options?.sha) params.set("sha", options.sha);
    if (options?.path) params.set("path", options.path);
    params.set("per_page", String(options?.perPage ?? 30));
    params.set("page", String(options?.page ?? 1));

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubCommit[]>(response);
}

/**
 * Get specific commit for a file to show last commit info
 */
export async function getFileLastCommit(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    ref?: string
): Promise<GitHubCommit | null> {
    const params = new URLSearchParams({
        path,
        per_page: "1",
        page: "1",
    });
    if (ref) params.set("sha", ref);

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`,
        { headers: getHeaders(accessToken) }
    );
    const commits = await handleResponse<GitHubCommit[]>(response);
    return commits[0] ?? null;
}

/**
 * Get repository README
 * Returns null if no README exists
 */
export async function getReadme(
    accessToken: string,
    owner: string,
    repo: string,
    ref?: string
): Promise<GitHubReadme | null> {
    const params = ref ? `?ref=${encodeURIComponent(ref)}` : "";

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme${params}`,
        { headers: getHeaders(accessToken) }
    );

    if (response.status === 404) {
        return null;
    }
    return handleResponse<GitHubReadme>(response);
}

/**
 * Get repository languages breakdown
 */
export async function getLanguages(
    accessToken: string,
    owner: string,
    repo: string
): Promise<GitHubLanguages> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubLanguages>(response);
}

/**
 * List repository branches
 */
export async function listBranches(
    accessToken: string,
    owner: string,
    repo: string,
    options?: {
        perPage?: number;
        page?: number;
    }
): Promise<GitHubBranch[]> {
    const params = new URLSearchParams({
        per_page: String(options?.perPage ?? 30),
        page: String(options?.page ?? 1),
    });

    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?${params}`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse<GitHubBranch[]>(response);
}

// ============ Issue Comment Endpoints ============

export async function createIssueComment(
    accessToken: string,
    owner: string,
    repo: string,
    issueNumber: number,
    data: { body: string }
): Promise<GitHubIssueComment> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
        {
            method: "POST",
            headers: getHeaders(accessToken),
            body: JSON.stringify(data),
        }
    );
    return handleResponse<GitHubIssueComment>(response);
}

export async function updateIssueComment(
    accessToken: string,
    owner: string,
    repo: string,
    commentId: number,
    data: { body: string }
): Promise<GitHubIssueComment> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/comments/${commentId}`,
        {
            method: "PATCH",
            headers: getHeaders(accessToken),
            body: JSON.stringify(data),
        }
    );
    return handleResponse<GitHubIssueComment>(response);
}

/**
 * Create a pull request on GitHub
 */
export async function createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    data: {
        title: string;
        body?: string;
        head: string;
        base: string;
    }
): Promise<GitHubPullRequest> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
        {
            method: "POST",
            headers: getHeaders(accessToken),
            body: JSON.stringify(data),
        }
    );
    return handleResponse<GitHubPullRequest>(response);
}

/**
 * Search code in a repository
 */
export async function searchCode(
    accessToken: string,
    owner: string,
    repo: string,
    query: string,
    options?: {
        perPage?: number;
        page?: number;
    }
): Promise<{ items: Array<{ path: string; sha: string; score: number }>; totalCount: number }> {
    const params = new URLSearchParams({
        q: `repo:${owner}/${repo} ${query}`,
        per_page: String(options?.perPage ?? 30),
        page: String(options?.page ?? 1),
    });

    const response = await fetch(
        `${GITHUB_API_BASE}/search/code?${params}`,
        { headers: getHeaders(accessToken) }
    );
    const data = await handleResponse<{ items: Array<{ path: string; sha: string; score: number }>; total_count: number }>(response);
    return {
        items: data.items,
        totalCount: data.total_count,
    };
}

/**
 * Get commit status (combined status for a commit)
 */
export async function getCommitStatus(
    accessToken: string,
    owner: string,
    repo: string,
    ref: string
): Promise<{ state: "success" | "failure" | "pending" | "error"; statuses: Array<{ state: string; description: string; context: string }> }> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${ref}/status`,
        { headers: getHeaders(accessToken) }
    );
    const data = await handleResponse<{ state: string; statuses: Array<{ state: string; description: string; context: string }> }>(response);
    return {
        state: data.state as "success" | "failure" | "pending" | "error",
        statuses: data.statuses,
    };
}

/**
 * Get pull request review comments
 */
export async function getPullRequestReviews(
    accessToken: string,
    owner: string,
    repo: string,
    pullNumber: number
): Promise<Array<{ id: number; state: string; body: string; user: { login: string; avatar_url: string } }>> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
        { headers: getHeaders(accessToken) }
    );
    return handleResponse(response);
}

/**
 * Get check runs for a commit (GitHub Actions status)
 */
export async function getCheckRuns(
    accessToken: string,
    owner: string,
    repo: string,
    ref: string
): Promise<{ totalCount: number; checkRuns: Array<{ name: string; status: string; conclusion: string | null }> }> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${ref}/check-runs`,
        { headers: getHeaders(accessToken) }
    );
    const data = await handleResponse<{ total_count: number; check_runs: Array<{ name: string; status: string; conclusion: string | null }> }>(response);
    return {
        totalCount: data.total_count,
        checkRuns: data.check_runs,
    };
}

