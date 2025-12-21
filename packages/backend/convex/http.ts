import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { webhookHandler } from "./github/webhook";

const http = httpRouter();

// Auth routes
authComponent.registerRoutes(http, createAuth, { cors: true });

// GitHub webhook endpoint for real-time sync
http.route({
    path: "/github/webhook",
    method: "POST",
    handler: webhookHandler,
});

export default http;

