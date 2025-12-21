import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Send, User } from "lucide-react";
import type { Id } from "@BetterRepo/backend/convex/_generated/dataModel";

interface CommentSectionProps {
  issueId?: Id<"issues">;
  prId?: Id<"pullRequests">;
  userId: string;
}

export function CommentSection({ issueId, prId, userId }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = useQuery(
    issueId ? api.comments.queries.listForIssue : api.comments.queries.listForPR,
    issueId ? { issueId } : { prId: prId! }
  );
  
  const addComment = useMutation(api.comments.mutations.add);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({
        body: comment,
        authorId: userId,
        issueId,
        prId,
      });
      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 mt-6 border-t pt-6">
      <div className="flex items-center gap-2 font-semibold">
        <MessageSquare className="w-4 h-4" />
        Comments ({(comments || []).length})
      </div>
      
      <div className="space-y-3">
        {comments === undefined ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <Card key={c._id} className="bg-muted/30">
              <CardContent className="p-3 text-sm flex gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User size={12} />
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-xs flex items-center gap-2">
                    <span>User</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-mono text-[9px]">{c.authorId.slice(0, 8)}</span>
                    <span>•</span>
                    <span>{new Date(c._creationTime).toLocaleDateString()}</span>
                  </div>
                  <div>{c.body}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Add a comment..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button size="icon" onClick={handleSubmit} disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
