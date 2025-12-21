import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/board";
import { type ColumnId, type KanbanItem } from "@/components/kanban/types";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";

export const Route = createFileRoute("/kanban")({
  component: KanbanPage,
});

function KanbanPage() {
  const issues = useQuery(api.issues.queries.list, {});
  const prs = useQuery(api.pullRequests.queries.list, {});
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
      author: "User",
      labels: [],
      type: "issue" as const,
    })),
    ...(prs || []).map((pr) => ({
      id: pr._id,
      title: pr.title,
      status: (pr.status === "merged" ? "done" : pr.status === "closed" ? "closed" : "todo") as ColumnId,
      author: "User",
      labels: [],
      type: "pr" as const,
    })),
  ];

  return (
    <div className="p-6 h-[calc(100vh-100px)]">
      <Authenticated>
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <p className="text-muted-foreground">Manage your repository issues and PRs.</p>
          </div>
          <KanbanBoard items={kanbanItems} onMove={handleMove} />
        </div>
      </Authenticated>
      <Unauthenticated>
        <AuthContainer />
      </Unauthenticated>
    </div>
  );
}
