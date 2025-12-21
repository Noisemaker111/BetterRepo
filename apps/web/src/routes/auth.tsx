import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Zap, Shield, GitBranch } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

function AuthPage() {
    return (
        <>
            <Authenticated>
                <Navigate to="/" />
            </Authenticated>
            <Unauthenticated>
                <AuthLayout />
            </Unauthenticated>
        </>
    );
}

function AuthLayout() {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800" />

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent animate-pulse" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-blob animation-delay-4000" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <GitBranch className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-display font-bold">BetterRepo</span>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-display font-bold leading-tight">
                                Ship faster.<br />
                                <span className="text-white/80">Collaborate better.</span>
                            </h1>
                            <p className="text-xl text-white/60 max-w-md">
                                The modern project management platform for teams who want to move fast and break nothing.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-white/80">
                                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Lightning Fast</p>
                                    <p className="text-sm text-white/60">Real-time sync across all devices</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/80">
                                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Secure by Default</p>
                                    <p className="text-sm text-white/60">Enterprise-grade security for your code</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/80">
                                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">GitHub Integration</p>
                                    <p className="text-sm text-white/60">Seamless sync with your repositories</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-white/40">
                        © 2024 BetterRepo. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-background">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center">
                            <GitBranch className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold">BetterRepo</span>
                    </div>

                    {/* Form Header */}
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-display font-bold tracking-tight">
                            {isSignUp ? "Create your account" : "Welcome back"}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {isSignUp
                                ? "Start your journey with BetterRepo today"
                                : "Sign in to continue to your workspace"}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-14 text-base font-medium gap-3 hover:bg-accent transition-all border-2"
                            onClick={async () => {
                                await authClient.signIn.social({ provider: "github" });
                            }}
                        >
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-14 text-base font-medium gap-3 hover:bg-accent transition-all border-2"
                            onClick={async () => {
                                await authClient.signIn.social({ provider: "google" });
                            }}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.47-1.92 4.64-1.2 1.2-3.08 2.58-5.92 2.58-4.79 0-8.34-3.89-8.34-8.67s3.55-8.67 8.34-8.67c2.84 0 4.72 1.38 5.92 2.58l2.31-2.31C17.53 1.65 14.84 0 11.83 0 5.28 0 0 5.28 0 11.83s5.28 11.83 11.83 11.83c5.41 0 9-1.81 11.18-4.43 1.73-2.09 2.28-5.05 2.28-7.43 0-.7-.06-1.37-.17-2h-12.64z"
                                    fill="currentColor"
                                />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>

                    {/* Toggle */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        {isSignUp ? (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(false)}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Sign in
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(true)}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Sign up for free
                                </button>
                            </>
                        )}
                    </p>

                    {/* Terms */}
                    <p className="text-center text-xs text-muted-foreground/60 mt-8">
                        By continuing, you agree to our{" "}
                        <a href="#" className="underline hover:text-muted-foreground">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline hover:text-muted-foreground">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
