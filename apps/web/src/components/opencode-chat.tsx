import { useState, useRef, useEffect } from "react";
import { useOpencodeChat } from "@/hooks/use-opencode-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function OpencodeChat() {
  const { messages, isLoading, sendMessage } = useOpencodeChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    await sendMessage(currentInput);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 scroll-smooth" ref={scrollRef}>
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Welcome to BetterRepo AI</p>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Ask me anything about your repository, issues, or pull requests.
                  </p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                  }`}>
                  {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/50 border rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-muted/50 border rounded-2xl rounded-tl-none p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 bg-background border-t">
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder="Ask Opencode..."
            className="pr-12 h-11 rounded-xl bg-muted/30 focus-visible:ring-primary"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 h-9 w-9 rounded-lg"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
