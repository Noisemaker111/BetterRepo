import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitPullRequest, Plus, Loader2, GitBranch, Search, ArrowUpRight, Clock, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { api as convexApi } from "@BetterRepo/backend/convex/_generated/api";

export const Route = createFileRoute("/$owner/$repo/pull-requests")({
  component: PullRequestsPage,
});

function PullRequestsPage() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });

  const prs = useQuery(api.pullRequests.queries.list, repository ? { repositoryId: repository._id } : "skip");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");
  const [error, setError] = useState("");

  const createPullRequest = useAction(convexApi.github.actions.createPullRequest);
  const createLocalPR = useMutation(api.pullRequests.mutations.create);

  const filteredPrs = prs?.filter(pr =>
    pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.sourceBranch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePR = async () => {
    if (!prTitle.trim() || !sourceBranch.trim() || !targetBranch.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (!repository) return;

    setIsCreating(true);
    setError("");

    try {
      await createLocalPR({
        title: prTitle,
        body: prBody,
        authorId: "current-user",
        sourceBranch,
        targetBranch,
      });
      setIsCreateModalOpen(false);
      setPrTitle("");
      setPrBody("");
      setSourceBranch("");
      setTargetBranch("main");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PR");
    } finally {
      setIsCreating(false);
    }
  };

  if (!repository) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <AuthLoading>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthLoading>
      <Authenticated>
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 border-b bg-background/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Changes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Review code changes and manage collaboration.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <Input
                    placeholder="Filter changes..."
                    className="pl-10 rounded-full glass border-white/5 focus-visible:ring-primary/20 bg-background/50 h-9 sm:h-10 border-white/5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="w-full sm:w-auto rounded-full px-6 border-none shadow-lg shadow-primary/20 transition-all active:scale-95 text-primary-foreground font-bold h-9 sm:h-10" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New PR
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col gap-4">
                  {prs === undefined ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-2xl glass-card animate-pulse" />
                    ))
                  ) : filteredPrs?.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 sm:p-20 text-center border-dashed border-border/40">
                      <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted/20 text-muted-foreground mb-4 sm:mb-6">
                        <GitPullRequest className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">No changes found</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Everything looks reviewed and merged! High five.</p>
                    </div>
                  ) : (
                    filteredPrs?.map((pr) => (
                      <Card key={pr._id} className="group relative overflow-hidden border-border/40 glass-card rounded-xl sm:rounded-2xl transition-all hover:border-primary/40 hover:bg-white/[0.01]">
                        <div className={cn(
                          "absolute top-0 left-0 w-1 h-full transition-opacity",
                          pr.status === "merged" ? "bg-purple-500" : "bg-green-500"
                        )} />
                        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3 text-left">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-none",
                                  pr.status === "merged" ? "bg-purple-500/10 text-purple-500" : "bg-green-500/10 text-green-500"
                                )}>
                                  {pr.status}
                                </Badge>
                                <span className="text-[10px] font-mono text-muted-foreground">#{pr._id.slice(-4)}</span>
                              </div>
                              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors text-foreground">{pr.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-md bg-white/5 border border-white/5">
                                  <GitBranch className="h-3 w-3" />
                                  <span className="font-mono">{pr.sourceBranch}</span>
                                </div>
                                <ArrowUpRight className="h-3 w-3 text-primary/40" />
                                <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-md bg-white/5 border border-white/5">
                                  <GitBranch className="h-3 w-3" />
                                  <span className="font-mono">{pr.targetBranch}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-foreground">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-white/5 mt-2 pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-foreground">
                                  ?
                                </div>
                                <span className="font-medium text-foreground/80">Unknown</span>
                              </div>
                              <div className="flex items-center gap-1.5 hidden xs:flex">
                                <Clock className="h-3.5 w-3.5 text-primary/40" />
                                {new Date(pr._creationTime).toLocaleDateString()}
                              </div>
                            </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-green-500/80">Checks Passed</span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex-1 flex items-center justify-center p-6">
          <AuthContainer />
        </div>
      </Unauthenticated>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5" />
              Create Pull Request
            </DialogTitle>
            <DialogDescription>
              Submit changes from a source branch to a target branch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pr-title">Title *</Label>
              <Input
                id="pr-title"
                placeholder="Pull request title"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pr-body">Description</Label>
              <textarea
                id="pr-body"
                placeholder="Describe your changes..."
                value={prBody}
                onChange={(e) => setPrBody(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-branch" className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  Source *
                </Label>
                <Input
                  id="source-branch"
                  placeholder="feature-branch"
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-branch" className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  Target *
                </Label>
                <Input
                  id="target-branch"
                  placeholder="main"
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button className="border-none" onClick={handleCreatePR} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Create PR
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
