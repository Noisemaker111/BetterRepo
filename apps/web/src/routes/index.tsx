import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Zap, GitBranch, ArrowRight, Github } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Loader from "@/components/loader";
import { InteractiveDemo } from "@/components/home/interactive-demo";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const user = useQuery(api.auth.getCurrentUser);

  const recentRepos = useQuery(api.repositories.queries.list, user ? {} : "skip");
  const forYouIssues = useQuery(api.issues.queries.listForYou, user ? {} : "skip");

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col min-h-screen bg-background selection:bg-primary/10">
        {/* Minimal Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">BetterRepo</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Noisemaker111/BetterRepo"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link to="/auth" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              Sign In
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 gap-12">
          <div className="text-center space-y-6 max-w-3xl pt-10 sm:pt-20">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground">
              The reactive <br className="hidden sm:block" />
              repo manager.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              Built for speed. Synchronized in real-time.
              <br className="hidden sm:block" />
              Automate your workflow with AI agents that actually understand code.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/auth"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 font-bold")}
              >
                Start Building
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <a
                href="https://github.com/Noisemaker111/BetterRepo"
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}
              >
                <Github className="mr-2 w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
             <InteractiveDemo />
          </div>
        </main>

        <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
          <p>© {new Date().getFullYear()} BetterRepo. Open Source & Powered by Convex.</p>
        </footer>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b bg-background/50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                Welcome back, <span className="text-foreground font-medium">{user.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 glass hover:bg-white/5 transition-all active:scale-95 text-xs sm:text-sm h-9 sm:h-10">
                Repositories
              </Button>
              <Button className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 border-none shadow-lg shadow-primary/20 transition-all active:scale-95 text-primary-foreground text-xs sm:text-sm h-9 sm:h-10 font-bold">
                <Plus className="mr-2 h-4 w-4" />
                New Issue
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <main className="lg:col-span-8 space-y-8 sm:space-y-10">
                <section className="text-left">
                  <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      For You Issues
                    </h2>
                    <Link to="/issues" className="text-xs sm:text-sm text-primary hover:underline font-medium">
                      View all
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {forYouIssues === undefined ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-36 sm:h-40 rounded-2xl glass-card animate-pulse" />
                      ))
                    ) : forYouIssues.length === 0 ? (
                      <div className="col-span-full glass-card rounded-2xl p-8 text-center bg-muted/5 border-dashed border-border/40">
                        <Zap className="mx-auto mb-3 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Nothing to see here for now. Try starring some repos!</p>
                      </div>
                    ) : (
                      forYouIssues.map((issue: any) => (
                        <Link
                          key={issue._id}
                          to="/issues"
                          className="glass-card rounded-2xl p-4 sm:p-5 hover:bg-white/[0.02] transition-colors group block relative overflow-hidden h-full flex flex-col"
                        >
                          <div className="flex items-center justify-between mb-3 sm:mb-4 text-foreground">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider",
                                issue.priority === "urgent" && "bg-red-500/10 text-red-500 border-red-500/20",
                                issue.priority === "high" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                                issue.priority === "medium" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                (issue.priority === "low" || !issue.priority) && "bg-muted/10 text-muted-foreground border-border/20"
                              )}
                            >
                              {issue.priority || "no priority"}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                              {issue.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 text-foreground text-left group-hover:text-primary transition-colors">
                            {issue.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-auto">
                            <span className="font-medium text-primary/70">#{issue._id.slice(-4)}</span>
                            <span>•</span>
                            <span>{new Date(issue._creationTime).toLocaleDateString()}</span>
                          </div>

                          {issue.priority === "urgent" && (
                            <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-red-500/10 blur-2xl rounded-full" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </section>
              </main>

              <aside className="lg:col-span-4 space-y-6 sm:space-y-8">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-primary/[0.03] border-primary/10 text-left">
                  <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary">
                      Repositories
                    </h2>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/20 h-7 w-7 text-foreground">
                      <Plus className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-1.5 sm:gap-2">
                    {recentRepos === undefined ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
                      ))
                    ) : recentRepos.length === 0 ? (
                      <p className="py-4 text-xs sm:text-sm text-muted-foreground text-center">No repos connected.</p>
                    ) : (
                      recentRepos.map((repo) => (
                        <Link
                          key={repo._id}
                          to="/$owner/$repo/flow"
                          params={{ owner: repo.owner, repo: repo.name }}
                          className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group text-foreground"
                        >
                          <div className="p-1.5 sm:p-2 rounded-lg bg-background border group-hover:border-primary/40 transition-colors">
                            <Book className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {repo.name}
                          </span>
                        </Link>
                      ))
                    )}
                  </nav>
                </div>

              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
