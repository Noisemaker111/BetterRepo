import { v } from "convex/values";
import { query } from "../_generated/server";

export const list = query({
  args: {
    repositoryId: v.optional(v.id("repositories")),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("merged"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const q = args.repositoryId
      ? ctx.db.query("pullRequests").withIndex("by_repositoryId", (q) => q.eq("repositoryId", args.repositoryId))
      : ctx.db.query("pullRequests");

    if (args.status) {
      const status = args.status;
      if (args.repositoryId) {
        return (await q.collect()).filter(p => p.status === status);
      }
      return await ctx.db.query("pullRequests").withIndex("by_status", (q) => q.eq("status", status)).collect();
    }
    return await q.collect();
  },
});
