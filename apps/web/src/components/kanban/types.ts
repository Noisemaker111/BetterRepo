export type ColumnId = "backlog" | "todo" | "in_progress" | "done" | "closed";

export interface KanbanItem {
  id: string;
  title: string;
  status: ColumnId;
  author: string;
  labels: { name: string; color: string }[];
  type: "issue" | "pr";
}

export interface Column {
  id: ColumnId;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];
