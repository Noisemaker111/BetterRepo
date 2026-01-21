import { Link, useParams } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { FcTreeStructure } from "react-icons/fc";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import UserMenu from "./user-menu";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";

export default function Header() {
  const user = useQuery(api.auth.getCurrentUser);
  const params = useParams({ strict: false }) as { owner?: string; repo?: string };

  // Only show breadcrumb if we're on a repo page
  const isRepoPage = params.owner && params.repo;

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 group transition-all duration-300 active:scale-95 shrink-0">
            <div className="p-1 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <FcTreeStructure className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              BetterRepo
            </span>
          </Link>

          {/* Breadcrumb Navigation - only show on repo pages */}
          {isRepoPage ? (
            <div className="flex items-center gap-0.5 sm:gap-1.5 text-sm font-medium">
              <span className="text-muted-foreground/30 text-base sm:text-lg font-light select-none">/</span>
              <Link
                to="/$owner"
                params={{ owner: params.owner! }}
                className="text-foreground hover:opacity-80 transition-opacity px-0.5 sm:px-1 truncate max-w-[80px] sm:max-w-none"
              >
                {params.owner}
              </Link>
              <span className="text-muted-foreground/30 text-base sm:text-lg font-light select-none">/</span>
              <Link
                to="/$owner/$repo"
                params={{ owner: params.owner!, repo: params.repo! }}
                className="text-foreground font-bold hover:opacity-80 transition-opacity px-0.5 sm:px-1 truncate max-w-[120px] sm:max-w-none"
              >
                {params.repo}
              </Link>
            </div>
          ) : params.owner ? (
            <div className="flex items-center gap-0.5 sm:gap-1.5 text-sm font-medium">
              <span className="text-muted-foreground/30 text-base sm:text-lg font-light select-none">/</span>
              <span className="text-foreground font-bold px-0.5 sm:px-1 truncate max-w-[80px] sm:max-w-none">
                {params.owner}
              </span>
            </div>
          ) : null}
        </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/Noisemaker111/BetterRepo"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <div className="h-6 w-px bg-border/40 mx-0.5 sm:mx-1 hidden xs:block" />

            <ModeToggle />

          {user === undefined ? (
            <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
          ) : user ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-full px-3 sm:px-4 border-none hover:opacity-90 transition-opacity font-medium text-xs h-7 sm:h-8 shrink-0"
              )}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
