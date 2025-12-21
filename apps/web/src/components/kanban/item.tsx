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

interface ItemCardProps {
  item: KanbanItem;
  isDragging?: boolean;
}

export function ItemCard({ item, isDragging }: ItemCardProps) {
  return (
    <Card className={cn(
      "cursor-grab active:cursor-grabbing",
      isDragging && "opacity-50 border-primary"
    )}>
      <CardHeader className="p-3 space-y-1">
        <CardTitle className="text-sm font-medium leading-none">
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex flex-wrap gap-1">
          {item.labels.map((label) => (
            <Badge
              key={label.name}
              variant="outline"
              className="text-[10px] px-1 py-0 h-4"
              style={{ borderColor: label.color, color: label.color }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground">
          by {item.author}
        </div>
      </CardContent>
    </Card>
  );
}
