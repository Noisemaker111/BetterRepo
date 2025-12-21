import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Bot, User, Send, Loader2, Kanban as KanbanIcon, MessageSquare, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SortableItem, ItemCard } from "../kanban/item";
import { COLUMNS, type ColumnId, type KanbanItem } from "../kanban/types";

const INITIAL_ITEMS: KanbanItem[] = [
  {
    id: "demo-1",
    title: "Implement AI-powered issue labeling",
    status: "in_progress",
    labels: [{ name: "AI", color: "#3b82f6" }, { name: "Feature", color: "#10b981" }],
    type: "issue",
  },
  {
    id: "demo-2",
    title: "Refactor auth middleware for Convex",
    status: "todo",
    labels: [{ name: "Security", color: "#ef4444" }],
    type: "pr",
  },
  {
    id: "demo-3",
    title: "Update documentation for v1.0",
    status: "backlog",
    labels: [{ name: "Docs", color: "#8b5cf6" }],
    type: "issue",
  },
  {
    id: "demo-4",
    title: "Fix hydration mismatch in sidebar",
    status: "done",
    labels: [{ name: "Bug", color: "#f59e0b" }],
    type: "issue",
  }
];

const MOCK_RESPONSES = [
  "I can help you with that! BetterRepo integrates AI directly into your workflow.",
  "That looks like a bug in the hydration logic. Should I draft a fix for you?",
  "I've analyzed your repository. You have 3 open PRs that need review.",
  "Welcome to the future of development! How can I assist you today?",
];

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"chat" | "kanban">("kanban");
  const [items, setItems] = useState<KanbanItem[]>(INITIAL_ITEMS);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "Hi! I'm the BetterRepo AI. Try dragging tasks on the board or ask me a question here!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      setItems(items.map(item =>
        item.id === activeItem.id ? { ...item, status: overColumn as ColumnId } : item
      ));

      // Add a little AI nudge when something moves to done
      if (overColumn === "done") {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `Great job completing "${activeItem.title}"! I've updated the project status.`
          }]);
        }, 800);
      }
    }

    setActiveId(null);
  };

  const handleMagicResolve = () => {
    if (isLoading) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Initializing Magic Resolve... analyzing all pending tasks." }]);

    setTimeout(() => {
      setItems(prev => prev.map(item => ({ ...item, status: "done" })));
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "✨ Boom! I've analyzed and resolved all pending tasks, synchronized the repository, and updated the documentation. Everything is now tracked and 'done'."
      }]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    setTimeout(() => {
      const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[500px] sm:h-[600px] animate-in fade-in zoom-in-95 duration-1000">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-black/20 rounded-xl">
            <button
              onClick={() => setActiveTab("kanban")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "kanban" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <KanbanIcon size={16} />
              Board
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "chat" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare size={16} />
              AI Chat
            </button>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMagicResolve}
            disabled={isLoading}
            className="h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 font-bold group px-4"
          >
            <Sparkles size={14} className={cn("group-hover:rotate-12 transition-transform", isLoading && "animate-spin")} />
            Magic Resolve
          </Button>
          <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10 gap-1.5 px-3 py-1">
            <Zap size={12} className="text-primary" />
            Live Demo
          </Badge>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Kanban Tab */}
        <div className={cn(
          "absolute inset-0 p-6 transition-all duration-500",
          activeTab === "kanban" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
        )}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full overflow-x-auto pb-4 no-scrollbar">
              {COLUMNS.map((column) => (
                <div key={column.id} className="flex flex-col w-[280px] shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{column.title}</h3>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {items.filter(item => item.status === column.id).length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                    <SortableContext id={column.id} items={items.filter(i => i.status === column.id).map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {items.filter(item => item.status === column.id).map((item) => (
                        <SortableItem key={item.id} item={item} />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeId ? <ItemCard item={items.find((i) => i.id === activeId)!} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Chat Tab */}
        <div className={cn(
          "absolute inset-0 flex flex-col transition-all duration-500",
          activeTab === "chat" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-4", m.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                  m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-white/10 border-white/10"
                )}>
                  {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/5 border border-white/10 rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-white/5">
            <div className="relative max-w-2xl mx-auto flex gap-2">
              <Input
                placeholder="Try asking: 'Summarize my tasks'"
                className="pr-12 h-12 rounded-2xl bg-black/20 border-white/10 focus-visible:ring-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl" onClick={handleSend}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="px-6 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-primary" /> Real-time sync</span>
          <span className="flex items-center gap-1.5"><Bot size={12} className="text-primary" /> AI Integrated</span>
        </div>
        <span className="hidden sm:block">Open Source • Powered by Convex</span>
      </div>
    </div>
  );
}
