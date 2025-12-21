import { v } from "convex/values";
import { query } from "../_generated/server";

export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("merged"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("pullRequests")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("pullRequests").collect();
  },
});
