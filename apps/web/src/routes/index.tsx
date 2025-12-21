import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Star, Zap, Shield, Cpu, Layers, MessageSquare, Kanban, GitBranch, ArrowRight, Github } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const user = useQuery(api.auth.getCurrentUser);
  const healthCheck = useQuery(api.healthCheck.get);
  
  const recentRepos = useQuery(api.repositories.queries.list, user ? {} : "skip");
  const recentIssues = useQuery(api.issues.queries.listRecent, user ? {} : "skip");
  const starredIssues = useQuery(api.issues.queries.listFromStarred, user ? {} : "skip");

  if (user === null) {
    return (
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-24 sm:py-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-4 text-sm font-medium">
              <Zap className="mr-2 h-3.5 w-3.5 fill-primary text-primary" />
              BetterRepo v1.0 is now in beta
            </Badge>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
              Engineering workflow, <br />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                reimagined with AI.
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-[800px] text-xl text-muted-foreground sm:text-2xl">
              BetterRepo brings your repositories, issues, and AI assistant together. 
              Built for teams who want to move fast without losing track of quality.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/chat" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base")}>
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="https://github.com/Opencode-AI/BetterRepo"
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 px-8 text-base")}
              >
                <Github className="mr-2 h-5 w-5" />
                Star on GitHub
              </a>
            </div>
            
            {/* Mock UI Preview */}
            <div className="mt-16 overflow-hidden rounded-xl border bg-muted/30 p-2 shadow-2xl">
              <div className="aspect-video rounded-lg border bg-background p-4 shadow-inner">
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="ml-4 h-6 w-64 rounded bg-muted animate-pulse" />
                </div>
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-3 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-8 rounded bg-muted/60 animate-pulse" />
                    ))}
                  </div>
                  <div className="col-span-6 space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-32 rounded border bg-muted/20 animate-pulse" />
                    ))}
                  </div>
                  <div className="col-span-3 space-y-4">
                    <div className="h-48 rounded bg-muted/40 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Gradients */}
          <div className="absolute top-0 -z-10 h-full w-full opacity-20 dark:opacity-10">
            <div className="absolute left-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-primary blur-[120px]" />
            <div className="absolute right-[10%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-purple-500 blur-[120px]" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-24 border-y">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">One platform, endless possibilities.</p>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI-Powered Insights",
                description: "Talk to your codebase. Ask about architectural decisions, find bugs, or generate documentation instantly.",
                icon: Cpu,
              },
              {
                title: "Unified Kanban",
                description: "A familiar board view for your issues and pull requests, synchronized in real-time with Convex.",
                icon: Kanban,
              },
              {
                title: "Team Collaboration",
                description: "Built-in comments and notification systems keep everyone in sync, whether you're 2 or 200 people.",
                icon: Layers,
              },
              {
                title: "Secure by Design",
                description: "Your data is protected with enterprise-grade encryption and Better Auth integration.",
                icon: Shield,
              },
              {
                title: "Developer First",
                description: "Keyboard shortcuts, dark mode, and a lightning-fast UI designed specifically for power users.",
                icon: Zap,
              },
              {
                title: "Git Integration",
                description: "Deep integration with your favorite Git providers, making PR management a breeze.",
                icon: GitBranch,
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="bg-muted/30 py-24 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-12 text-2xl font-semibold opacity-60">Powered by the modern stack</h2>
            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-2xl font-bold tracking-tighter">CONVEX</span>
              <span className="text-2xl font-bold tracking-tighter">REACT 19</span>
              <span className="text-2xl font-bold tracking-tighter">TANSTACK</span>
              <span className="text-2xl font-bold tracking-tighter">TAILWIND</span>
              <span className="text-2xl font-bold tracking-tighter">BETTER AUTH</span>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} BetterRepo. Open source under the MIT License.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left Sidebar: Recent Repos */}
        <aside className="md:col-span-3">
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Repositories
                </h2>
                <Button variant="ghost" size="icon-xs">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1">
                {recentRepos === undefined ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-full animate-pulse rounded bg-muted/50" />
                  ))
                ) : recentRepos.length === 0 ? (
                  <p className="px-2 py-4 text-xs text-muted-foreground">No repositories yet.</p>
                ) : (
                  recentRepos.map((repo) => (
                    <Link
                      key={repo._id}
                      to="/kanban"
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                    >
                      <Book className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate group-hover:underline text-muted-foreground group-hover:text-foreground">
                        {repo.owner}/{repo.name}
                      </span>
                    </Link>
                  ))
                )}
              </nav>
            </div>

            <div className="h-px bg-border" />

            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <h2 className="mb-2 text-sm font-medium">API Status</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${healthCheck === "OK" ? "bg-green-500" : healthCheck === undefined ? "bg-orange-400" : "bg-red-500"}`}
                />
                <span className="text-sm text-muted-foreground">
                  {healthCheck === undefined
                    ? "Checking..."
                    : healthCheck === "OK"
                      ? "Connected"
                      : "Error"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Feed: Issues */}
        <main className="md:col-span-6">
          <div className="flex flex-col gap-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Your Recent Issues</h2>
              </div>
              <div className="flex flex-col gap-3">
                {recentIssues === undefined ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-24 bg-muted/30" />
                    </Card>
                  ))
                ) : recentIssues.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        You haven't created any issues yet.
                      </p>
                      <Link to="/issues" className={cn(buttonVariants({ variant: "link", size: "sm" }))}>
                        Create your first issue
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  recentIssues.map((issue) => (
                    <Card key={issue._id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold leading-none hover:underline">
                            <Link to="/issues">{issue.title}</Link>
                          </CardTitle>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(issue._creationTime).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">From Starred Projects</h2>
              </div>
              <div className="flex flex-col gap-3">
                {starredIssues === undefined ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-24 bg-muted/30" />
                    </Card>
                  ))
                ) : starredIssues.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Star className="mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No updates from starred projects.</p>
                    </CardContent>
                  </Card>
                ) : (
                  starredIssues.map((issue) => (
                    <Card key={issue._id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold leading-none hover:underline">
                            <Link to="/issues">{issue.title}</Link>
                          </CardTitle>
                          <Badge variant="secondary">{issue.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">Update from repository</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar: Tech News etc. */}
        <aside className="md:col-span-3">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tech News & Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {[
                  { title: "OpenAI launches o1 model series", category: "Model Drops" },
                  { title: "Hackathon: Build with Convex & Better Auth", category: "Hackathons" },
                  { title: "Broadcom acquires VMware: What's next?", category: "Acquisitions" },
                ].map((news, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit text-[10px] uppercase">
                      {news.category}
                    </Badge>
                    <a href="#" className="text-sm font-medium hover:underline">
                      {news.title}
                    </a>
                    <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="rounded-lg border border-dashed p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase leading-tight text-muted-foreground">
                Coming Soon
              </h3>
              <p className="text-[11px] leading-normal text-muted-foreground">
                Integration with X (Twitter) for real-time tech acquisition and funding news.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
