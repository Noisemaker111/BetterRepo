import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

// Allow fallback for development - siteUrl should be the frontend URL
const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    // trustedOrigins should contain ORIGINS only (scheme + host + port), not paths
    trustedOrigins: [
      siteUrl,
      "http://localhost:3001",
      "http://localhost:3000", // In case of port variations during dev
    ],
    database: authComponent.adapter(ctx),
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      } : {}),
      ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          // Request extra scopes for repo access and webhooks
          scope: ["read:user", "user:email", "repo", "admin:repo_hook"],
        },
      } : {}),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async function (ctx) {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) return null;

      const userId = user.userId || user._id.toString();
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (profile) {
        return {
          ...user,
          name: profile.name ?? user.name,
          image: profile.image ?? user.image,
          lastProfileUpdate: profile.lastUpdated,
        };
      }

      return user;
    } catch (e) {
      return null;
    }
  },
});
