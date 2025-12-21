/**
 * GitHub API Types
 * Type definitions for GitHub REST API responses and webhook payloads
 */

// GitHub User (simplified)
export interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    type: "User" | "Organization" | "Bot";
}

// GitHub Repository
export interface GitHubRepository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    owner: GitHubUser;
    html_url: string;
    description: string | null;
    private: boolean;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    permissions?: {
        admin: boolean;
        push: boolean;
        pull: boolean;
    };
}

// GitHub Issue
export interface GitHubIssue {
    id: number;
    node_id: string;
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    html_url: string;
    user: GitHubUser;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    labels: GitHubLabel[];
    created_at: string;
    updated_at: string;
    closed_at: string | null;
}

// GitHub Label
export interface GitHubLabel {
    id: number;
    node_id: string;
    name: string;
    color: string;
    description: string | null;
}

// GitHub Pull Request
export interface GitHubPullRequest {
    id: number;
    node_id: string;
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    merged: boolean;
    html_url: string;
    user: GitHubUser;
    head: {
        ref: string;
        sha: string;
        repo: GitHubRepository | null;
    };
    base: {
        ref: string;
        sha: string;
        repo: GitHubRepository;
    };
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
}

// GitHub Webhook Events
export type GitHubWebhookEvent =
    | "issues"
    | "issue_comment"
    | "pull_request"
    | "pull_request_review"
    | "push"
    | "create"
    | "delete"
    | "release";

// Webhook Payload Base
export interface GitHubWebhookPayload {
    action: string;
    sender: GitHubUser;
    repository: GitHubRepository;
}

// Issue webhook payload
export interface IssueWebhookPayload extends GitHubWebhookPayload {
    action:
    | "opened"
    | "edited"
    | "deleted"
    | "closed"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled";
    issue: GitHubIssue;
    changes?: {
        title?: { from: string };
        body?: { from: string };
    };
}

// Pull Request webhook payload
export interface PullRequestWebhookPayload extends GitHubWebhookPayload {
    action:
    | "opened"
    | "edited"
    | "closed"
    | "reopened"
    | "synchronize"
    | "converted_to_draft"
    | "ready_for_review";
    number: number;
    pull_request: GitHubPullRequest;
    changes?: {
        title?: { from: string };
        body?: { from: string };
    };
}

// GitHub API Error
export interface GitHubAPIError {
    message: string;
    documentation_url?: string;
    errors?: Array<{
        resource: string;
        field: string;
        code: string;
        message?: string;
    }>;
}

// Webhook creation request
export interface CreateWebhookRequest {
    name: "web";
    active: boolean;
    events: GitHubWebhookEvent[];
    config: {
        url: string;
        content_type: "json";
        secret: string;
        insecure_ssl?: "0" | "1";
    };
}

// Webhook response
export interface GitHubWebhook {
    id: number;
    type: string;
    name: string;
    active: boolean;
    events: string[];
    config: {
        url: string;
        content_type: string;
        insecure_ssl: string;
    };
    created_at: string;
    updated_at: string;
}

// Repository Contents (file/directory entry)
export interface GitHubContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: "file" | "dir" | "symlink" | "submodule";
    // Only present for files when fetching single file
    content?: string;
    encoding?: "base64";
}

// Commit Author/Committer
export interface GitHubCommitUser {
    name: string;
    email: string;
    date: string;
}

// Commit object
export interface GitHubCommit {
    sha: string;
    node_id: string;
    url: string;
    html_url: string;
    commit: {
        author: GitHubCommitUser;
        committer: GitHubCommitUser;
        message: string;
        tree: {
            sha: string;
            url: string;
        };
    };
    author: GitHubUser | null;
    committer: GitHubUser | null;
    parents: Array<{
        sha: string;
        url: string;
        html_url: string;
    }>;
}

// Branch info
export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}

// README content (decoded)
export interface GitHubReadme {
    name: string;
    path: string;
    sha: string;
    size: number;
    html_url: string;
    download_url: string;
    content: string; // Base64 encoded
    encoding: "base64";
}

// Languages breakdown
export interface GitHubLanguages {
    [language: string]: number; // bytes of code
}
