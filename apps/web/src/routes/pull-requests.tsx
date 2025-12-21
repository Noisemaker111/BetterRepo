import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitPullRequest, Plus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pull-requests")({
  component: PullRequestsPage,
});

function PullRequestsPage() {
  const prs = useQuery(api.pullRequests.queries.list, {});

  return (
    <div className="container py-10 max-w-5xl">
      <Authenticated>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
              <p className="text-muted-foreground">Manage and review code changes.</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Pull Request
            </Button>
          </div>

          <div className="space-y-4">
            {prs === undefined ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : prs.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <GitPullRequest className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pull requests found.</p>
                </CardContent>
              </Card>
            ) : (
              prs.map((pr) => (
                <Card key={pr._id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{pr.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{pr.body}</CardDescription>
                      </div>
                      <Badge variant={pr.status === "merged" ? "secondary" : "default"}>
                        {pr.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                    {pr.sourceBranch} → {pr.targetBranch} • Opened by User
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <AuthContainer />
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AuthLoading>
    </div>
  );
}
