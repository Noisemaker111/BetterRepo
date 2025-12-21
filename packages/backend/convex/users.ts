import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";

export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const userId = user.userId || user._id.toString();
        const now = Date.now();
        const threeMonthsInMs = 3 * 30 * 24 * 60 * 60 * 1000;

        const existingProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (existingProfile) {
            const timeSinceLastUpdate = now - existingProfile.lastUpdated;
            if (timeSinceLastUpdate < threeMonthsInMs) {
                const remainingDays = Math.ceil((threeMonthsInMs - timeSinceLastUpdate) / (24 * 60 * 60 * 1000));
                throw new Error(`Profile can only be updated once every 3 months. Please wait ${remainingDays} more days.`);
            }

            await ctx.db.patch(existingProfile._id, {
                name: args.name ?? existingProfile.name,
                image: args.image ?? existingProfile.image,
                lastUpdated: now,
            });
        } else {
            await ctx.db.insert("userProfiles", {
                userId,
                name: args.name,
                image: args.image,
                lastUpdated: now,
            });
        }
    },
});
