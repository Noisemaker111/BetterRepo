import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Clock, CheckCircle, XCircle, GitCommit } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/$owner/$repo/actions")({
  component: ActionsPage,
});

function ActionsPage() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });

  if (!repository) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-left">
          <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            Actions
          </h1>
          <p className="text-muted-foreground text-sm">View and manage GitHub Actions workflows.</p>
        </div>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold">Recent Workflow Runs</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No workflow runs yet</h3>
              <p className="text-muted-foreground text-sm">
                GitHub Actions workflows will appear here once they run.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold">Available Workflows</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-center py-12">
              <GitCommit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No workflows configured</h3>
              <p className="text-muted-foreground text-sm">
                Add .github/workflows to your repository to enable CI/CD.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
