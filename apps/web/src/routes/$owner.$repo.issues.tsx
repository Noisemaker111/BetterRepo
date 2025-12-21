import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { Loader2, AlertCircle, Plus, Search, ArrowUpRight, MessageSquare, History, Github, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/$owner/$repo/issues")({
  component: IssuesRoute,
});

function IssuesRoute() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [syncToGitHub, setSyncToGitHub] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const issues = useQuery(api.issues.queries.list, repository ? { repositoryId: repository._id } : "skip");
  const createIssue = useMutation(api.issues.mutations.create);
  const findDuplicates = useAction(api.issues.actions.findDuplicates);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (repository?.githubId) {
      setSyncToGitHub(true);
    }
  }, [repository?.githubId]);

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 5) {
        setIsCheckingDuplicates(true);
        try {
          const res = await findDuplicates({ title, body });
          setDuplicates(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingDuplicates(false);
        }
      } else {
        setDuplicates([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, body, findDuplicates]);

  const handleCreate = async () => {
    if (!title || !session?.user?.id || !repository) return;
    setIsCreating(true);
    try {
      await createIssue({
        title,
        body,
        authorId: session.user.id,
        labelIds: [],
        repositoryId: repository._id,
        status: "backlog",
      });
      setTitle("");
      setBody("");
      setDuplicates([]);
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  const filteredIssues = issues?.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!repository) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <Authenticated>
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 border-b bg-background/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Issues</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Manage and track your project tasks.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <Input
                    placeholder="Search issues..."
                    className="pl-10 rounded-full glass border-border/40 focus-visible:ring-primary/20 bg-background/50 h-9 sm:h-10 border-white/5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full sm:w-auto rounded-full px-6 premium-gradient border-none shadow-lg shadow-primary/20 transition-all active:scale-95 text-primary-foreground font-bold h-9 sm:h-10"
                  onClick={() => (document.getElementById('issue-title') as HTMLInputElement)?.focus()}
                >
                  <Plus className="mr-2 h-4 w-4" /> New Issue
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-4">
                    {issues === undefined ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 sm:h-32 rounded-2xl glass-card animate-pulse" />
                      ))
                    ) : filteredIssues?.length === 0 ? (
                      <div className="glass-card rounded-2xl p-10 sm:p-16 text-center border-dashed border-border/40">
                        <div className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/20 text-muted-foreground mb-4 sm:mb-6">
                          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">No issues found</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-6">Create your first issue to start tracking your work.</p>
                        <Button variant="outline" className="rounded-full px-8 glass text-xs sm:text-sm" onClick={() => (document.getElementById('issue-title') as HTMLInputElement)?.focus()}>
                          Submit your first issue
                        </Button>
                      </div>
                    ) : (
                      filteredIssues?.map((issue) => (
                        <Card key={issue._id} className="group relative overflow-hidden border-border/40 glass-card rounded-xl sm:rounded-2xl transition-all hover:border-primary/40 hover:bg-white/[0.02]">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-primary/70 font-bold uppercase tracking-wider">#{issue._id.slice(-4)}</span>
                                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0">{issue.status}</Badge>
                                </div>
                                <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors text-foreground">{issue.title}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm line-clamp-2 leading-relaxed text-muted-foreground">
                                  {issue.body}
                                </CardDescription>
                              </div>
                              <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-foreground">
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5 font-medium">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">?</div>
                                <span className="text-foreground/80">Unknown</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <History className="h-3.5 w-3.5 text-primary/40" />
                                {new Date(issue._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground">
                                <MessageSquare className="h-3.5 w-3.5 text-primary/40" />
                                --
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                  <Card className="glass-card rounded-2xl sm:rounded-3xl border-white/5 bg-primary/[0.02] shadow-xl text-left border-white/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">Quick Create</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground">Instantly log a new task or bug.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-1.5 px-0.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Title</label>
                          <Input
                            id="issue-title"
                            placeholder="What's on your mind?"
                            className="rounded-xl glass border-white/5 focus-visible:ring-primary/20 h-10 text-foreground bg-background/50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5 px-0.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Description</label>
                          <textarea
                            className="flex min-h-[100px] sm:min-h-[120px] w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all resize-none text-foreground"
                            placeholder="Provide some context..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                          />
                        </div>
                      </div>

                      {isCheckingDuplicates && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse py-1 px-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          AI checking for duplicates...
                        </div>
                      )}

                      {duplicates.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 animate-in fade-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-2 text-primary font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Potential Match Found
                          </div>
                          <ul className="space-y-1.5">
                            {duplicates.slice(0, 2).map(d => (
                              <li key={d._id} className="text-xs text-muted-foreground flex items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
                                <div className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary" />
                                <span className="truncate">{d.title}</span>
                                <ArrowUpRight className="h-3 w-3 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2 space-y-3">
                      {repository?.githubId && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-2">
                            <Github className="w-4 h-4 text-primary" />
                            <Label htmlFor="sync-github" className="text-sm cursor-pointer">Sync to GitHub</Label>
                          </div>
                          <Checkbox
                            id="sync-github"
                            checked={syncToGitHub}
                            onCheckedChange={(checked) => setSyncToGitHub(checked === true)}
                          />
                        </div>
                      )}
                      <Button
                        className="w-full rounded-xl h-11 premium-gradient border-none font-bold tracking-tight shadow-md sm:shadow-lg shadow-primary/20 active:scale-95 transition-all text-primary-foreground"
                        disabled={!title || isCreating}
                        onClick={handleCreate}
                      >
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Create Issue
                      </Button>
                    </CardFooter>
                  </Card>
                </aside>
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
    </div>
  );
}
