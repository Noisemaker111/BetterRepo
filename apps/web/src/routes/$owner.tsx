import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FolderGit, GitPullRequest, AlertCircle, Settings, UserPlus, MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$owner")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const params = Route.useParams() as { owner: string };
  const owner = params.owner;
  const currentUser = useQuery(api.auth.getCurrentUser);
  const profile = useQuery(api.auth.getUserByGithubUsername, { githubUsername: owner });
  const userRepos = useQuery(api.repositories.queries.listByUserId, 
    profile ? { userId: profile.userId } : "skip"
  );
  const userIssues = useQuery(api.issues.queries.listByAuthor, 
    profile ? { authorId: profile.userId } : "skip"
  );
  const userPRs = useQuery(api.pullRequests.queries.listByAuthor, 
    profile ? { authorId: profile.userId } : "skip"
  );

  const [activeTab, setActiveTab] = useState<"repos" | "issues" | "prs">("repos");

  const isOwnProfile = currentUser?.userId === profile?.userId;
  const isLoading = profile === undefined || userRepos === undefined || userIssues === undefined || userPRs === undefined;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-display font-bold mb-4 text-foreground">404</h1>
          <h2 className="text-xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">The user "@{owner}" doesn"t exist or hasn"t connected their GitHub account.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-primary-foreground font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-hidden">
      <Authenticated>
        <div className="flex flex-col h-full">
          <div className="relative">
            <div className="h-32 sm:h-48 bg-gradient-to-br from-primary/20 via-background/50 to-background" />
            <div className="absolute -bottom-16 left-4 sm:left-8">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-background overflow-hidden">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                  ) : profile.githubAvatarUrl ? (
                    <img src={profile.githubAvatarUrl} alt={profile.githubUsername} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">
                        {profile.name?.charAt(0)?.toUpperCase() || profile.githubUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 border-4 border-background" />
              </div>
            </div>
          </div>

          <div className="mt-20 px-4 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{profile.name}</h1>
                <p className="text-lg text-muted-foreground">@{profile.githubUsername}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <FolderGit className="w-3 h-3 mr-1" />
                      {userRepos?.length || 0} Repositories
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {userIssues?.length || 0} Issues
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                      <GitPullRequest className="w-3 h-3 mr-1" />
                      {userPRs?.length || 0} PRs
                    </Badge>
                  </div>
              </div>
                </div>

              <div className="flex items-center gap-3">
                {isOwnProfile ? (
                  <Button variant="outline" className="rounded-full glass border-white/5">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="rounded-full glass border-white/5">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                    <Button className="rounded-full border-none">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 mt-6 border-b border-border/40">
              {(["repos", "issues", "prs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-all relative border-b-2 border-transparent",
                    activeTab === tab ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "repos" && (
                    <>
                      <FolderGit className="w-4 h-4 inline mr-2" />
                      Repositories
                    </>
                  )}
                  {tab === "issues" && (
                    <>
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Issues
                    </>
                  )}
                  {tab === "prs" && (
                    <>
                      <GitPullRequest className="w-4 h-4 inline mr-2" />
                      Pull Requests
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 pb-8">
            <div className="max-w-[1400px] mx-auto pt-4">
              {activeTab === "repos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRepos === undefined ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-xl glass-card animate-pulse" />
                    ))
                  ) : userRepos.length === 0 ? (
                    <div className="col-span-full glass-card rounded-2xl p-12 text-center border-dashed border-border/40">
                      <FolderGit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No repositories yet</h3>
                      <p className="text-muted-foreground text-sm">
                        {isOwnProfile ? "Import your first repository to get started" : "This user hasn't created any repositories yet"}
                      </p>
                    </div>
                  ) : (
                    userRepos.map((repo) => (
                      <Card key={repo._id} className="glass-card border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FolderGit className="w-5 h-5 text-primary" />
                              <Link to={`/${repo.owner}/${repo.name}` as any}>
                                <CardTitle className="text-lg hover:text-primary transition-colors">{repo.name}</CardTitle>
                              </Link>
                            </div>
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase">
                              {repo.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {repo.description || "No description"}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === "issues" && (
                <div className="space-y-4">
                  {userIssues === undefined ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-xl glass-card animate-pulse" />
                    ))
                  ) : userIssues.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center border-dashed border-border/40">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No issues yet</h3>
                      <p className="text-muted-foreground text-sm">
                        {isOwnProfile ? "Create your first issue to start tracking your work" : "This user hasn't created any issues yet"}
                      </p>
                    </div>
                  ) : (
                    userIssues.slice(0, 10).map((issue) => (
                      <Card key={issue._id} className="glass-card border-white/5 hover:border-primary/30 transition-all">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <div>
                              <div className="font-semibold">{issue.title}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className="font-mono text-primary/70">#{issue._id.slice(-4)}</span>
                                <span>{issue.status}</span>
                                {issue.priority && (
                                  <Badge variant="outline" className="text-[9px]">{issue.priority}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === "prs" && (
                <div className="space-y-4">
                  {userPRs === undefined ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-xl glass-card animate-pulse" />
                    ))
                  ) : userPRs.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center border-dashed border-border/40">
                      <GitPullRequest className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">No pull requests yet</h3>
                      <p className="text-muted-foreground text-sm">
                        {isOwnProfile ? "Open your first PR to start collaborating" : "This user hasn't opened any pull requests yet"}
                      </p>
                    </div>
                  ) : (
                    userPRs.slice(0, 10).map((pr) => (
                      <Card key={pr._id} className="glass-card border-white/5 hover:border-primary/30 transition-all">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <GitPullRequest className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="font-semibold">{pr.title}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className="font-mono text-muted-foreground">#{pr._id.slice(-4)}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-[9px]",
                                    pr.status === "merged" ? "bg-purple-500/10 text-purple-500" : "bg-green-500/10 text-green-500"
                                  )}
                                >
                                  {pr.status}
                                </Badge>
                                <span className="font-mono">{pr.sourceBranch}</span>
                                <span>→</span>
                                <span className="font-mono">{pr.targetBranch}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
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
