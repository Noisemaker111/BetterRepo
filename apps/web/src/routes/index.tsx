import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Star, Zap, Cpu, Layers, Kanban, GitBranch, ArrowRight, Github } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Loader from "@/components/loader";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const user = useQuery(api.auth.getCurrentUser);
  const healthCheck = useQuery(api.healthCheck.get);

  const recentRepos = useQuery(api.repositories.queries.list, user ? {} : "skip");
  const recentIssues = useQuery(api.issues.queries.listRecent, user ? {} : "skip");
  const starredIssues = useQuery(api.issues.queries.listFromStarred, user ? {} : "skip");

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col overflow-x-hidden">
        {/* Stunning Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12 sm:py-24 px-4 sm:px-6">
          <div className="absolute inset-0 z-0 text-primary">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse duration-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="container relative z-10 mx-auto text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full glass border border-primary/20 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="h-3.5 w-3.5 text-primary fill-primary/20" />
              <span className="text-xs sm:text-sm font-medium tracking-tight text-foreground">BetterRepo v1.0 Beta is live</span>
              <div className="h-3 w-px bg-primary/20 mx-1" />
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-wider">Open Source</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 leading-[1.1]">
              Engineering workflow<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                reimagined with AI
              </span>
            </h1>

            <p className="mx-auto mb-8 sm:mb-12 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground/80 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4">
              The only platform that seamlessly integrates your repositories, issues, and a powerful AI agent to accelerate your delivery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 px-6">
              <Link
                to="/auth"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-full premium-gradient border-none shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-500 text-primary-foreground font-bold"
                )}
              >
                Start building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="https://github.com/Opencode-AI/BetterRepo"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-full glass border-border/40 hover:bg-white/5 transition-all duration-500 font-bold"
                )}
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </div>

            <div className="mt-16 sm:mt-24 relative animate-in fade-in zoom-in-95 duration-1000 delay-300 px-4 sm:px-0">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] sm:blur-[100px] -z-10 opacity-30 scale-90" />
              <div className="glass rounded-xl sm:rounded-2xl border border-white/10 p-2 sm:p-3 shadow-2xl backdrop-blur-2xl">
                <div className="aspect-[16/10] rounded-lg sm:rounded-xl overflow-hidden bg-background/40 relative">
                  <div className="absolute inset-0 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 text-left origin-top scale-[0.85] sm:scale-100">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 sm:pb-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 animate-pulse" />
                        <div className="space-y-2 py-1">
                          <div className="w-24 sm:w-32 h-3 sm:h-4 rounded bg-white/10 animate-pulse" />
                          <div className="w-16 sm:w-24 h-2 sm:h-3 rounded bg-white/5 animate-pulse" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2].map(i => <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/5 animate-pulse" />)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={cn("rounded-lg sm:rounded-xl border border-white/5 bg-white/5 p-3 sm:p-4 space-y-3 sm:space-y-4", i === 3 && "hidden sm:block")}>
                          <div className="w-1/2 h-3 sm:h-4 rounded bg-white/10 animate-pulse" />
                          <div className="space-y-2">
                            <div className="w-full h-16 sm:h-20 rounded-lg bg-white/5 animate-pulse" />
                            <div className="w-full h-16 sm:h-20 rounded-lg bg-white/5 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32 px-4 border-t border-border/40 bg-muted/10 relative">
          <div className="container mx-auto">
            <div className="text-center mb-16 sm:mb-24">
              <h2 className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-4">Core Ecosystem</h2>
              <p className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight px-4 text-foreground">Everything you need to deliver</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: "AI-Powered Insights",
                  description: "Talk to your codebase. Ask about architectural decisions, find bugs, or generate documentation instantly.",
                  icon: Cpu,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  title: "Fluid Workflow",
                  description: "A familiar board view for your issues and pull requests, synchronized in real-time with Convex.",
                  icon: Kanban,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10"
                },
                {
                  title: "Team Sync",
                  description: "Built-in comments and notification systems keep everyone in sync, whether you're 2 or 200.",
                  icon: Layers,
                  color: "text-green-500",
                  bg: "bg-green-500/10"
                }
              ].map((feature, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 group hover:-translate-y-2 transition-all duration-300 text-left">
                  <div className={cn("mb-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-500", feature.bg)}>
                    <feature.icon className={cn("h-6 w-6 sm:h-7 sm:w-7", feature.color)} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-20 px-4 border-t border-border/40 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 opacity-60">
            <GitBranch className="w-5 h-5 text-primary" />
            <span className="font-display font-bold tracking-tighter text-foreground">BetterRepo</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            © {new Date().getFullYear()} BetterRepo. Crafting the future of development.
          </p>
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
              <Button className="flex-1 sm:flex-none rounded-full px-4 sm:px-6 premium-gradient border-none shadow-lg shadow-primary/20 transition-all active:scale-95 text-primary-foreground text-xs sm:text-sm h-9 sm:h-10 font-bold">
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
                      Active Issues
                    </h2>
                    <Link to="/issues" className="text-xs sm:text-sm text-primary hover:underline font-medium">
                      View all
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    {recentIssues === undefined ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-28 sm:h-32 rounded-2xl glass-card animate-pulse" />
                      ))
                    ) : recentIssues.length === 0 ? (
                      <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border-dashed border-border/40">
                        <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted/20 text-muted-foreground mb-4">
                          <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">You're all caught up! No active issues.</p>
                        <Button variant="outline" size="sm" className="rounded-full text-xs">Create one</Button>
                      </div>
                    ) : (
                      recentIssues.map((issue) => (
                        <Link
                          key={issue._id}
                          to="/issues"
                          className="group flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl glass-card border-border/40 hover:border-primary/40 transition-all hover:translate-x-1"
                        >
                          <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0 text-left">
                            <h3 className="text-sm sm:text-base font-semibold truncate group-hover:text-primary transition-colors text-foreground">
                              {issue.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                              <span className="font-medium text-primary/70">#{issue._id.slice(-4)}</span>
                              <span>•</span>
                              <span>{new Date(issue._creationTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="rounded-full px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary border-none text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                            {issue.status}
                          </Badge>
                        </Link>
                      ))
                    )}
                  </div>
                </section>

                <section className="text-left">
                  <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                      <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                      Starred Projects
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {starredIssues === undefined ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-36 sm:h-40 rounded-2xl glass-card animate-pulse" />
                      ))
                    ) : starredIssues.length === 0 ? (
                      <div className="col-span-full glass-card rounded-2xl p-8 text-center bg-muted/5 border-dashed border-border/40">
                        <Star className="mx-auto mb-3 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Star repositories to see updates here.</p>
                      </div>
                    ) : (
                      starredIssues.map((issue) => (
                        <div key={issue._id} className="glass-card rounded-2xl p-4 sm:p-5 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-center justify-between mb-3 sm:mb-4 text-foreground">
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold text-foreground/70 rounded-md">{issue.status}</Badge>
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500/20 group-hover:fill-yellow-500 transition-all" />
                          </div>
                          <h3 className="font-semibold text-xs sm:text-sm mb-2 line-clamp-1 text-foreground text-left">{issue.title}</h3>
                          <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/40 w-2/3 group-hover:bg-primary transition-all shadow-[0_0_8px_var(--primary)]" />
                          </div>
                        </div>
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
                          to="/kanban"
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

                <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-center justify-between text-foreground">
                    <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">System Status</h2>
                    <div className={cn(
                      "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                      healthCheck === "OK" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "bg-red-500"
                    )} />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground hover:text-foreground transition-colors">API Latency</span>
                    <span className="font-medium text-foreground">12ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Convex Sync</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
