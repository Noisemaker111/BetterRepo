import { createFileRoute } from "@tanstack/react-router";
import { AuthContainer } from "@/components/auth-container";
import { Authenticated, Unauthenticated } from "convex/react";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

function AuthPage() {
    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
            <Authenticated>
                <Navigate to="/" />
            </Authenticated>
            <Unauthenticated>
                <AuthContainer />
            </Unauthenticated>
        </div>
    );
}
