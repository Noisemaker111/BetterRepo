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
    repositoryId: v.optional(v.id("repositories")),
    embedding: v.optional(v.array(v.float64())),
  }).index("by_status", ["status"])
    .index("by_authorId", ["authorId"])
    .index("by_assigneeId", ["assigneeId"])
    .index("by_repositoryId", ["repositoryId"])
    .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // Standard for many models, can adjust if needed
  }),
  repositories: defineTable({
    name: v.string(),
    owner: v.string(), // e.g., "username" or "orgname"
    description: v.optional(v.string()),
    ownerId: v.string(), // user id
    isPublic: v.boolean(),
  }).index("by_ownerId", ["ownerId"]),
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
  }).index("by_status", ["status"])
    .index("by_authorId", ["authorId"])
    .index("by_issueId", ["issueId"]),
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
});
