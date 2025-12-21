import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { GitBranch, Kanban, ListTodo, Sparkles } from "lucide-react";
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
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <GitBranch className="w-6 h-6" />
            BetterRepo
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
            onClick={toggle}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Ask Agent</span>
          </Button>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <ModeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

