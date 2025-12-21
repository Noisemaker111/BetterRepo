import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { GitBranch, Kanban, ListTodo } from "lucide-react";
import { FcTreeStructure } from "react-icons/fc";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import UserMenu from "./user-menu";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAgentSidebar } from "@/hooks/use-agent-sidebar";

export default function Header() {
  const user = useQuery(api.auth.getCurrentUser);
  const { toggle } = useAgentSidebar();

  const links = [
    { to: "/issues", label: "Issues", icon: ListTodo },
    { to: "/pull-requests", label: "PRs", icon: GitBranch },
    { to: "/kanban", label: "Flow", icon: Kanban },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="flex items-center gap-2 group transition-all duration-300 active:scale-95 shrink-0">
            <div className="p-1 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <FcTreeStructure className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              BetterRepo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/5 text-muted-foreground hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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
                "rounded-full px-4 sm:px-6 premium-gradient border-none hover:opacity-90 transition-opacity font-bold text-xs h-9 sm:h-10 shrink-0"
              )}
            >
              Sign In
            </Link>
          )}

          {/* Mobile Nav - icons only for small screens */}
          <div className="md:hidden flex items-center gap-0.5 sm:gap-1 border-l pl-2 sm:pl-3 ml-1 border-border/40">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                title={label}
                className="p-1.5 sm:p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:bg-primary/5"
              >
                <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
