import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";


export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
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
            // Check if user has used their free update pass
            const hasUsedFreePass = existingProfile.hasUsedFreeUpdate === true;

            if (hasUsedFreePass) {
                // After using free pass, enforce 3-month restriction
                const timeSinceLastUpdate = now - existingProfile.lastUpdated;
                if (timeSinceLastUpdate < threeMonthsInMs) {
                    const remainingDays = Math.ceil((threeMonthsInMs - timeSinceLastUpdate) / (24 * 60 * 60 * 1000));
                    throw new Error(`Profile can only be updated once every 3 months. Please wait ${remainingDays} more days.`);
                }
            }

            let finalImage = args.image ?? existingProfile.image;
            if (args.storageId) {
                const url = await ctx.storage.getUrl(args.storageId);
                if (url) finalImage = url;
            }

            await ctx.db.patch(existingProfile._id, {
                name: args.name ?? existingProfile.name,
                image: finalImage,
                lastUpdated: now,
                hasUsedFreeUpdate: true, // Mark free pass as used
            });


        } else {
            let finalImage = args.image;
            if (args.storageId) {
                const url = await ctx.storage.getUrl(args.storageId);
                if (url) finalImage = url;
            }

            await ctx.db.insert("userProfiles", {
                userId,
                name: args.name,
                image: finalImage,
                lastUpdated: now,
            });

        }
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Not authenticated");
        return await ctx.storage.generateUploadUrl();
    },
});

