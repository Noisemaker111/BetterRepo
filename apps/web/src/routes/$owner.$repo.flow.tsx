import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/board";
import { type ColumnId, type KanbanItem } from "@/components/kanban/types";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";

export const Route = createFileRoute("/$owner/$repo/flow")({
  component: KanbanPage,
});

function KanbanPage() {
  const { owner, repo } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repo });

  const issues = useQuery(api.issues.queries.listWithDetails, repository ? { repositoryId: repository._id } : "skip");
  const prs = useQuery(api.pullRequests.queries.listWithDetails, repository ? { repositoryId: repository._id } : "skip");

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
      author: issue.author ? {
        name: issue.author.name || issue.author.userId,
        image: issue.author.image,
      } : null,
      labels: (issue.labels || []).map((l: any) => ({
        name: l.name,
        color: l.color,
      })),
      type: "issue" as const,
    })),
    ...(prs || []).map((pr) => ({
      id: pr._id,
      title: pr.title,
      status: (pr.status === "merged" ? "done" : pr.status === "closed" ? "closed" : "in_progress") as ColumnId,
      author: pr.author ? {
        name: pr.author.name || pr.author.userId,
        image: pr.author.image,
      } : null,
      labels: [],
      type: "pr" as const,
    })),
  ];

  if (!repository) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 overflow-hidden">
      <Authenticated>
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 border-b bg-background/50 shrink-0">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Flow</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Real-time status board for {repository.name}.</p>
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
