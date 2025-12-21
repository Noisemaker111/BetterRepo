import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/board";
import { type ColumnId, type KanbanItem } from "@/components/kanban/types";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { Filter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/kanban")({
  component: KanbanPage,
});

function KanbanPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const repositories = useQuery(api.github.queries.listSyncedRepos);
  const issues = useQuery(api.issues.queries.list, selectedRepoId ? { repositoryId: selectedRepoId as any } : {});
  const prs = useQuery(api.pullRequests.queries.list, selectedRepoId ? { repositoryId: selectedRepoId as any } : {});
  const updateIssueStatus = useMutation(api.issues.mutations.updateStatus);
  const updatePRStatus = useMutation(api.pullRequests.mutations.updateStatus);

  const handleMove = async (id: any, newStatus: ColumnId) => {
    const item = kanbanItems.find(i => i.id === id);
    if (!item) return;

    if (item.type === "pr") {
      if (newStatus === "done") {
        const confirmed = window.confirm("Are you sure you want to merge this Pull Request?");
        if (!confirmed) return;
        await updatePRStatus({ id, status: "merged" });
      } else if (newStatus === "closed") {
        await updatePRStatus({ id, status: "closed" });
      } else {
        await updatePRStatus({ id, status: "open" });
      }
    } else {
      await updateIssueStatus({ id, status: newStatus });
    }
  };

  const kanbanItems: KanbanItem[] = [
    ...(issues || []).map((issue) => ({
      id: issue._id,
      title: issue.title,
      status: issue.status as ColumnId,
      author: null,
      labels: [],
      type: "issue" as const,
    })),
    ...(prs || []).map((pr) => ({
      id: pr._id,
      title: pr.title,
      status: (pr.status === "merged" ? "done" : pr.status === "closed" ? "closed" : "todo") as ColumnId,
      author: null,
      labels: [],
      type: "pr" as const,
    })),
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-hidden">
      <Authenticated>
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b bg-background/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Flow</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Manage your repository workflow in real-time.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-48 group">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <select
                    className="w-full pl-10 pr-8 rounded-full glass border-border/40 focus-visible:ring-primary/20 bg-background/50 h-9 sm:h-10 text-sm appearance-none cursor-pointer"
                    value={selectedRepoId || ""}
                    onChange={(e) => setSelectedRepoId(e.target.value || null)}
                  >
                    <option value="">All repositories</option>
                    {repositories?.map((repo) => (
                      <option key={repo._id} value={repo._id}>
                        {repo.owner}/{repo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-2 sm:p-4 overflow-hidden">
            <KanbanBoard items={kanbanItems} onMove={handleMove} />
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="p-6">
          <AuthContainer />
        </div>
      </Unauthenticated>
    </div>
  );
}
