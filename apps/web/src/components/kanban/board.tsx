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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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
      <div className="flex gap-4 sm:gap-6 h-full overflow-x-auto pb-6 sm:pb-8 snap-x snap-mandatory px-2 sm:px-4 no-scrollbar">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col w-[280px] xs:w-[320px] sm:w-[350px] shrink-0 glass-card rounded-2xl p-3 sm:p-4 gap-3 sm:gap-4 snap-center relative group/column"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                <h3 className="font-display font-bold text-xs sm:text-sm tracking-wide text-foreground">
                  {column.title}
                </h3>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px]">
                {column.items.length}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-[300px]">
              <SortableContext
                id={column.id}
                items={column.items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3 py-1">
                  {column.items.map((item) => (
                    <SortableItem key={item.id} item={item} />
                  ))}
                  {column.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/10 rounded-xl text-muted-foreground/30 text-[10px] sm:text-xs gap-2">
                      <span>No items</span>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>

            {/* Subtle column highlight on hover */}
            <div className="absolute inset-x-0 -bottom-1 h-1 bg-primary/20 scale-x-0 group-hover/column:scale-x-100 transition-transform duration-500 rounded-full" />
          </div>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="z-50 pointer-events-none">
            <ItemCard item={items.find((i) => i.id === activeId)!} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
