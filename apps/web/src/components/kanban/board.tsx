import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { COLUMNS, type ColumnId, type KanbanItem } from "./types";
import { SortableItem, ItemCard } from "./item";

interface KanbanBoardProps {
  items: KanbanItem[];
  onMove: (id: string, newStatus: ColumnId) => void;
}

export function KanbanBoard({ items, onMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = COLUMNS.map((col) => ({
    ...col,
    items: items.filter((item) => item.status === col.id),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((item) => item.id === active.id);
    if (!activeItem) return;

    const overId = over.id as string;
    const overColumn = COLUMNS.find((col) => col.id === overId) || 
                       items.find((item) => item.id === overId)?.status;

    if (overColumn && overColumn !== activeItem.status) {
      onMove(activeItem.id, overColumn as ColumnId);
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col w-80 bg-muted/50 rounded-lg p-2 gap-2">
            <div className="flex items-center justify-between px-2 py-1">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                {column.title}
              </h3>
              <Badge variant="secondary">{column.items.length}</Badge>
            </div>
            <SortableContext
              id={column.id}
              items={column.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2 min-h-[200px]">
                {column.items.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <ItemCard item={items.find((i) => i.id === activeId)!} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
