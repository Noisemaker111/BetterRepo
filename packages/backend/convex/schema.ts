import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  issues: defineTable({
    title: v.string(),
    body: v.string(),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("closed")
    ),
    authorId: v.string(), // Better Auth user id
    assigneeId: v.optional(v.string()),
    labelIds: v.array(v.id("labels")),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    repositoryId: v.optional(v.id("repositories")),
    embedding: v.optional(v.array(v.float64())),
    // GitHub sync fields
    githubId: v.optional(v.number()), // GitHub issue number
    githubNodeId: v.optional(v.string()), // GitHub GraphQL node ID
    githubUrl: v.optional(v.string()), // URL to GitHub issue
    lastSyncedAt: v.optional(v.number()), // Timestamp of last sync
  }).index("by_status", ["status"])
    .index("by_authorId", ["authorId"])
    .index("by_assigneeId", ["assigneeId"])
    .index("by_repositoryId", ["repositoryId"])
    .index("by_priority", ["priority"])
    .index("by_githubId", ["githubId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
  repoVisits: defineTable({
    userId: v.string(),
    repositoryId: v.id("repositories"),
    lastVisited: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_repositoryId", ["repositoryId"])
    .index("by_userId_repositoryId", ["userId", "repositoryId"]),
  repositories: defineTable({
    name: v.string(),
    owner: v.string(), // e.g., "username" or "orgname"
    description: v.optional(v.string()),
    ownerId: v.string(), // user id
    isPublic: v.boolean(),
    // GitHub sync fields
    githubId: v.optional(v.number()), // GitHub repository ID
    githubNodeId: v.optional(v.string()), // GitHub GraphQL node ID
    githubFullName: v.optional(v.string()), // "owner/repo" format
    githubUrl: v.optional(v.string()), // https://github.com/owner/repo
    githubDefaultBranch: v.optional(v.string()), // e.g., "main"
    webhookId: v.optional(v.number()), // GitHub webhook ID
    webhookSecret: v.optional(v.string()), // Secret for webhook verification
    syncEnabled: v.optional(v.boolean()), // Whether auto-sync is enabled
    lastSyncedAt: v.optional(v.number()), // Timestamp of last successful sync
    syncStatus: v.optional(v.union(
      v.literal("idle"),
      v.literal("syncing"),
      v.literal("error")
    )),
  }).index("by_ownerId", ["ownerId"])
    .index("by_owner_name", ["owner", "name"])
    .index("by_githubId", ["githubId"]),
  stars: defineTable({
    userId: v.string(),
    repositoryId: v.id("repositories"),
  }).index("by_userId", ["userId"])
    .index("by_repositoryId", ["repositoryId"])
    .index("by_userId_repositoryId", ["userId", "repositoryId"]),
  pullRequests: defineTable({
    title: v.string(),
    body: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("merged"),
      v.literal("closed")
    ),
    authorId: v.string(),
    sourceBranch: v.string(),
    targetBranch: v.string(),
    issueId: v.optional(v.id("issues")),
    repositoryId: v.optional(v.id("repositories")),
    // GitHub sync fields
    githubId: v.optional(v.number()), // GitHub PR number
    githubNodeId: v.optional(v.string()), // GitHub GraphQL node ID
    githubUrl: v.optional(v.string()), // URL to GitHub PR
    lastSyncedAt: v.optional(v.number()), // Timestamp of last sync
  }).index("by_status", ["status"])
    .index("by_authorId", ["authorId"])
    .index("by_issueId", ["issueId"])
    .index("by_repositoryId", ["repositoryId"])
    .index("by_githubId", ["githubId"]),
  labels: defineTable({
    name: v.string(),
    color: v.string(), // hex code
    description: v.optional(v.string()),
  }),
  comments: defineTable({
    body: v.string(),
    authorId: v.string(),
    issueId: v.optional(v.id("issues")),
    prId: v.optional(v.id("pullRequests")),
  }).index("by_issueId", ["issueId"])
    .index("by_prId", ["prId"]),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  userProfiles: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    lastUpdated: v.number(),
    hasUsedFreeUpdate: v.optional(v.boolean()), // Users get 1 free update on first login
  }).index("by_userId", ["userId"]),

  // GitHub OAuth connections - stores access tokens for API calls
  githubConnections: defineTable({
    userId: v.string(), // BetterRepo user ID
    githubUserId: v.number(), // GitHub user ID
    githubUsername: v.string(), // GitHub login
    accessToken: v.string(), // OAuth access token (encrypted in production)
    tokenType: v.string(), // Usually "bearer"
    scope: v.optional(v.string()), // Granted OAuth scopes
    avatarUrl: v.optional(v.string()),
    connectedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_githubUserId", ["githubUserId"]),

  // Sync event log for debugging and audit
  githubSyncLog: defineTable({
    repositoryId: v.id("repositories"),
    eventType: v.string(), // e.g., "issue.created", "pr.merged", "full_sync"
    direction: v.union(v.literal("inbound"), v.literal("outbound")), // From GitHub or to GitHub
    success: v.boolean(),
    error: v.optional(v.string()),
    payload: v.optional(v.string()), // JSON stringified payload for debugging
    timestamp: v.number(),
  }).index("by_repositoryId", ["repositoryId"])
    .index("by_timestamp", ["timestamp"]),
});
