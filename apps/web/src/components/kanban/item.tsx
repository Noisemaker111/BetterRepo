import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KanbanItem } from "./types";

interface SortableItemProps {
  item: KanbanItem;
}

export function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard item={item} isDragging={isDragging} />
    </div>
  );
}

import { GitBranch, ListTodo } from "lucide-react";

interface ItemCardProps {
  item: KanbanItem;
  isDragging?: boolean;
}

export function ItemCard({ item, isDragging }: ItemCardProps) {
  const isPR = item.type === "pr";

  return (
    <Card className={cn(
      "group cursor-grab active:cursor-grabbing border-border/40 bg-card/50 hover:bg-card hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-md",
      isDragging && "opacity-50 ring-2 ring-primary border-primary rotate-2 scale-95"
    )}>
      <CardHeader className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-semibold leading-relaxed group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
          <div className={cn(
            "p-1.5 rounded-lg shrink-0",
            isPR ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {isPR ? <GitBranch className="w-3.5 h-3.5" /> : <ListTodo className="w-3.5 h-3.5" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.labels.map((label) => (
              <Badge
                key={label.name}
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 font-medium rounded-md border-transparent"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  border: `1px solid ${label.color}40`
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-border/20 pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {item.author[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              {item.author}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
            #{item.id.slice(-4)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
