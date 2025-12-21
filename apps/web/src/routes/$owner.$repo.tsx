import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Kanban, ListTodo, GitPullRequest, Settings, Code, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$owner/$repo")({
  component: RepoLayout,
});

function RepoLayout() {
  const { owner, repo } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repo });
  const location = useLocation();

  const tabs = [
    { to: `/${owner}/${repo}`, label: "Code", icon: Code, exact: true },
    { to: `/${owner}/${repo}/issues`, label: "Issues", icon: ListTodo },
    { to: `/${owner}/${repo}/pull-requests`, label: "Changes", icon: GitPullRequest },
    { to: `/${owner}/${repo}/flow`, label: "Flow", icon: Kanban },
    { to: `/${owner}/${repo}/actions`, label: "Actions", icon: Activity },
    { to: `/${owner}/${repo}/security`, label: "Security", icon: ShieldCheck },
    { to: `/${owner}/${repo}/settings`, label: "Settings", icon: Settings },
  ] as const;

  if (repository === undefined) return null;
  if (repository === null) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">404</h1>
        <h2 className="text-xl font-bold mb-2">Repository Not Found</h2>
        <p className="text-muted-foreground mb-6">The repository you're looking for doesn't exist or is private.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full px-6 py-2 premium-gradient text-primary-foreground font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50">
      {/* Sub-navigation for the repo */}
      <div className="px-4 sm:px-6 border-b bg-background/50 shrink-0 overflow-x-auto scrollbar-none">
        <div className="container mx-auto">
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact
                ? location.pathname === to
                : location.pathname.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all relative border-b-2 border-transparent hover:text-foreground text-muted-foreground whitespace-nowrap group",
                    isActive && "border-primary text-primary"
                  )}
                >
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
