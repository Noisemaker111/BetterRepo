import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Zap, Cpu, Layers, Kanban, GitBranch, ArrowRight, Github, Sparkles, Shield, Workflow } from "lucide-react";
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
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="relative min-h-full">
            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[150px] animate-blob" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[150px] animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] animate-blob animation-delay-4000" />

              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                  backgroundSize: '60px 60px'
                }} />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 z-10 overflow-hidden">
              <div className="container mx-auto text-center max-w-6xl relative">
                {/* Floating Elements for depth */}
                <div className="hidden lg:block absolute -left-20 top-20 w-32 h-32 glass rounded-3xl rotate-12 animate-bounce duration-[3000ms] opacity-20 border-white/20">
                  <div className="absolute inset-0 flex items-center justify-center"><Cpu className="text-primary w-12 h-12" /></div>
                </div>
                <div className="hidden lg:block absolute -right-20 bottom-40 w-40 h-40 glass rounded-full -rotate-12 animate-pulse duration-[4000ms] opacity-20 border-white/20">
                  <div className="absolute inset-0 flex items-center justify-center"><Workflow className="text-purple-400 w-16 h-16" /></div>
                </div>

                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-foreground/70">Next-Gen Software Management</span>
                </div>

                <h1 className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tighter mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 leading-[0.85] text-foreground">
                  Code at the<br />
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                      Speed of AI.
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-sm opacity-50" />
                  </span>
                </h1>

                <p className="mx-auto mb-16 max-w-3xl text-xl sm:text-2xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 font-medium">
                  The first truly reactive repo manager built for the modern age. Automate your issues, sync in real-time, and let our agents help you ship.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 mb-24">
                  <Link
                    to="/auth"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full sm:w-auto h-16 px-12 text-xl rounded-2xl border-none shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 font-black group relative overflow-hidden"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Building Free
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] group-hover:animate-shimmer" />
                  </Link>
                  <a
                    href="https://github.com/Opencode-AI/BetterRepo"
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "w-full sm:w-auto h-16 px-12 text-xl rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 font-black"
                    )}
                  >
                    <Github className="mr-3 h-6 w-6" />
                    Star on GitHub
                  </a>
                </div>

                {/* Stats / Proof */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-32 border-y border-white/5 py-12 px-4 backdrop-blur-sm bg-white/[0.01] rounded-3xl">
                  {[
                    { label: "Updates", val: "1.2ms" },
                    { label: "Uptime", val: "99.9%" },
                    { label: "Community", val: "5k+" },
                    { label: "PRs Merged", val: "12k+" }
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-2xl sm:text-3xl font-black text-foreground">{s.val}</span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[36px] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                  <div className="relative">
                    <InteractiveDemo />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="relative py-32 px-4 z-10">
              <div className="container mx-auto">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                  <h2 className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-6">Engineered for Excellence</h2>
                  <p className="text-5xl sm:text-7xl font-display font-black tracking-tighter text-foreground leading-[0.9] mb-8">Ship software like it's 2030.</p>
                  <p className="text-xl text-muted-foreground">Stop fighting your tools. Start building with a platform that works for you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                    {
                      title: "AI-Native Logic",
                      description: "Our backend is optimized for AI agents. They understand your context better than you do.",
                      icon: Cpu,
                      color: "text-blue-400",
                      bg: "bg-blue-400/10",
                      gradient: "from-blue-500/20 to-transparent"
                    },
                    {
                      title: "Insane Speed",
                      description: "Powered by Convex's reactive engine. Changes reflect globally in milliseconds. No refresh needed.",
                      icon: Zap,
                      color: "text-amber-400",
                      bg: "bg-amber-400/10",
                      gradient: "from-amber-500/20 to-transparent"
                    },
                    {
                      title: "Team Flow",
                      description: "Collaborate seamlessly with a Kanban experience that feels alive and truly real-time.",
                      icon: Kanban,
                      color: "text-purple-400",
                      bg: "bg-purple-400/10",
                      gradient: "from-purple-500/20 to-transparent"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="relative group overflow-hidden glass rounded-[40px] p-10 border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-3">
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />
                      <div className={cn("mb-8 h-16 w-16 flex items-center justify-center rounded-[20px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10 shadow-lg shadow-black/20", feature.bg)}>
                        <feature.icon className={cn("h-8 w-8", feature.color)} />
                      </div>
                      <h3 className="text-2xl font-black mb-4 text-foreground relative z-10">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg relative z-10">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trust / Tech Stack */}
            <section className="py-32 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm">
              <div className="container mx-auto px-4 text-center">
                <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.5em] mb-16">The Stack Of The Future</p>
                <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-24">
                  <div className="flex flex-col items-center gap-4 group cursor-pointer transition-all hover:scale-110">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 flex items-center justify-center p-5 group-hover:border-primary/50 group-hover:bg-primary/5 shadow-xl transition-all">
                      <Zap className="w-full h-full text-primary" />
                    </div>
                    <span className="font-display font-black text-lg text-foreground/50 group-hover:text-foreground">CONVEX</span>
                  </div>
                  <div className="flex flex-col items-center gap-4 group cursor-pointer transition-all hover:scale-110">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 flex items-center justify-center p-5 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 shadow-xl transition-all">
                      <Shield className="w-full h-full text-emerald-400" />
                    </div>
                    <span className="font-display font-black text-lg text-foreground/50 group-hover:text-foreground">SECURE</span>
                  </div>
                  <div className="flex flex-col items-center gap-4 group cursor-pointer transition-all hover:scale-110">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 flex items-center justify-center p-5 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 shadow-xl transition-all">
                      <Book className="w-full h-full text-blue-400" />
                    </div>
                    <span className="font-display font-black text-lg text-foreground/50 group-hover:text-foreground">TYPESAFE</span>
                  </div>
                  <div className="flex flex-col items-center gap-4 group cursor-pointer transition-all hover:scale-110">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 flex items-center justify-center p-5 group-hover:border-purple-500/50 group-hover:bg-purple-500/5 shadow-xl transition-all">
                      <Workflow className="w-full h-full text-purple-400" />
                    </div>
                    <span className="font-display font-black text-lg text-foreground/50 group-hover:text-foreground">REACTIVE</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Brand Marquee */}
            <section className="py-20 overflow-hidden opacity-30">
              <div className="flex gap-12 sm:gap-24 animate-shimmer min-w-full">
                {["OpenCode", "DeepMind", "Convex", "BetterAuth", "NextJS", "Vercel", "Stripe", "GitHub", "Linear"].map((b, i) => (
                  <span key={i} className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground whitespace-nowrap uppercase italic">{b}</span>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-4 relative overflow-hidden">
              <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { name: "Sarah Chen", role: "Sr. Engineer @ Linear", text: "BetterRepo is what GitHub should have been. The AI integration is actually useful, not just a chatbot.", icon: "SC" },
                    { name: "Marcus Thorne", role: "Founder @ Stealth Startup", text: "The reactivity is insane. I drag a task, and my whole team sees it instantly. No more stale tabs.", icon: "MT" },
                    { name: "Elena Rossi", role: "DevOps Lead", text: "Finally, a tool that understands the dev-ops lifecycle from an AI-first perspective. Ship faster, indeed.", icon: "ER" }
                  ].map((t, i) => (
                    <div key={i} className="glass p-8 rounded-[32px] border border-white/5 relative group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{t.icon}</div>
                        <div>
                          <div className="font-bold text-foreground">{t.name}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-widest font-black">{t.role}</div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-lg leading-relaxed italic">"{t.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-32 px-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
              <h2 className="text-4xl sm:text-6xl font-black mb-10 text-foreground">Ready to ship better?</h2>
              <Link
                to="/auth"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-16 px-12 text-xl rounded-2xl border-none shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-black"
                )}
              >
                Get Started Now — It's Free
              </Link>
            </section>

            <footer className="py-20 px-4 border-t border-white/5 text-center bg-black/40 relative z-10 backdrop-blur-xl">
              <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-8 h-8 text-primary" />
                      <span className="font-display font-black tracking-tighter text-3xl text-foreground">BetterRepo</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-left max-w-xs font-medium">
                      The next-generation repository manager powered by AI and real-time synchronization.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20 text-left">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Product</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground font-bold">
                        <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Team</a></li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Resources</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground font-bold">
                        <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Legal</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground font-bold">
                        <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">License</a></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                    © {new Date().getFullYear()} BetterRepo. Engine synchronized.
                  </p>
                  <div className="flex gap-6 opacity-30">
                    <Github className="w-5 h-5" />
                    <Workflow className="w-5 h-5" />
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
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
