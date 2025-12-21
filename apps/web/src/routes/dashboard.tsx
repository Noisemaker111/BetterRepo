import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { AuthContainer } from "@/components/auth-container";
import UserMenu from "@/components/user-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FolderGit, GitPullRequest, AlertCircle, Star, ArrowRight, Search, LayoutGrid, List } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const repositories = useQuery(api.github.queries.listSyncedRepos);
  const issues = useQuery(api.issues.queries.list, {});
  const pullRequests = useQuery(api.pullRequests.queries.list, {});

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const recentRepos = repositories?.slice(0, 6) || [];
  const openIssues = issues?.filter(i => i.status !== "closed") || [];
  const openPRs = pullRequests?.filter(pr => pr.status !== "closed" && pr.status !== "merged") || [];

  const filteredRepos = recentRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AuthLoading>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthLoading>
      <Authenticated>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Welcome back! Here's an overview of your repositories.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-full glass border-white/5 h-9 sm:h-10" onClick={() => navigate({ to: "/issues" })}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Issues
                  {openIssues.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{openIssues.length}</Badge>
                  )}
                </Button>
                <Button variant="outline" className="rounded-full glass border-white/5 h-9 sm:h-10" onClick={() => navigate({ to: "/pull-requests" })}>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  PRs
                  {openPRs.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-500">{openPRs.length}</Badge>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="glass-card border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Repositories</p>
                      <p className="text-2xl font-display font-bold mt-1">{repositories?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FolderGit className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Open Issues</p>
                      <p className="text-2xl font-display font-bold mt-1 text-amber-500">{openIssues.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Open PRs</p>
                      <p className="text-2xl font-display font-bold mt-1 text-green-500">{openPRs.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <GitPullRequest className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Total Stars</p>
                      <p className="text-2xl font-display font-bold mt-1 text-yellow-500">-</p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Recent Repositories</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <Input
                        placeholder="Search repositories..."
                        className="pl-10 rounded-full glass border-white/5 bg-background/50 h-9 w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
                      <button
                        className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-white/10"}`}
                        onClick={() => setViewMode("grid")}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-white/10"}`}
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {repositories === undefined ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-xl glass-card animate-pulse" />
                    ))}
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderGit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No repositories found</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {searchQuery ? "Try a different search term" : "Import your first repository to get started"}
                    </p>
                    <Button className="rounded-full premium-gradient border-none" onClick={() => window.location.href = "/import-repo"}>
                      <Plus className="w-4 h-4 mr-2" />
                      Import Repository
                    </Button>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo._id}
                        className="group relative p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => navigate({ to: `/${repo.owner}/${repo.name}` })}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FolderGit className="w-5 h-5 text-primary" />
                            <span className="font-bold text-sm">{repo.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase">
                            {repo.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                          {repo.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-3">
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo._id}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => navigate({ to: `/${repo.owner}/${repo.name}` })}
                      >
                        <div className="flex items-center gap-4">
                          <FolderGit className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-bold text-sm">{repo.owner}/{repo.name}</p>
                            <p className="text-xs text-muted-foreground">{repo.description || "No description"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase">
                            {repo.isPublic ? "Public" : "Private"}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Open Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {openIssues.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No open issues</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {openIssues.slice(0, 5).map((issue) => (
                        <div
                          key={issue._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                          onClick={() => navigate({ to: `/${issue.repositoryId ? "owner" : "issues"}/${issue._id}` })}
                        >
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium">{issue.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase">{issue.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GitPullRequest className="w-5 h-5 text-green-500" />
                    Open Pull Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {openPRs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No open pull requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {openPRs.slice(0, 5).map((pr) => (
                        <div
                          key={pr._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <GitPullRequest className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">{pr.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">{pr.sourceBranch}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-mono">{pr.targetBranch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <UserMenu />
      </Authenticated>
      <Unauthenticated>
        <AuthContainer />
      </Unauthenticated>
    </>
  );
}
