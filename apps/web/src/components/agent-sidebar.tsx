import { useAgentSidebar } from "@/hooks/use-agent-sidebar";
import { OpencodeChat } from "./opencode-chat";
import { Button } from "./ui/button";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentSidebar() {
    const { isOpen, setIsOpen } = useAgentSidebar();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full sm:w-[450px] bg-background border-l z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2 font-semibold">
                        <Sparkles className="w-5 h-5 text-primary fill-current" />
                        <span>Opencode Agent</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <OpencodeChat />
                </div>
            </div>
        </>
    );
}
