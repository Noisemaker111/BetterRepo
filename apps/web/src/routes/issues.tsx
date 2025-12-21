import { api } from "@BetterRepo/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthContainer } from "@/components/auth-container";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/issues")({
  component: IssuesRoute,
});

function IssuesRoute() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const issues = useQuery(api.issues.queries.list, {});
  const createIssue = useMutation(api.issues.mutations.create);
  const findDuplicates = useAction(api.issues.actions.findDuplicates);
  const { data: session } = authClient.useSession();

  // Debounced duplicate check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 5) {
        setIsCheckingDuplicates(true);
        try {
          const res = await findDuplicates({ title, body });
          setDuplicates(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingDuplicates(false);
        }
      } else {
        setDuplicates([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, body, findDuplicates]);

  const handleCreate = async () => {
    if (!title || !session?.user?.id) return;
    setIsCreating(true);
    try {
      await createIssue({
        title,
        body,
        authorId: session.user.id,
        labelIds: [],
        status: "backlog",
      });
      setTitle("");
      setBody("");
      setDuplicates([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <Authenticated>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="w-4 h-4" /> New Issue
              </Button>
            </div>

            <div className="space-y-4">
              {issues === undefined ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : issues.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No issues found. Create one to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                issues.map((issue) => (
                  <Card key={issue._id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{issue.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{issue.body}</CardDescription>
                        </div>
                        <Badge>{issue.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                      Opened by User • {new Date(issue._creationTime).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Issue</CardTitle>
                <CardDescription>Report a bug or suggest a feature.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Description"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                {isCheckingDuplicates && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking for duplicates...
                  </div>
                )}

                {duplicates.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium text-xs">
                      <AlertCircle className="w-4 h-4" />
                      Possible Duplicates Found
                    </div>
                    <ul className="text-xs space-y-1">
                      {duplicates.map(d => (
                        <li key={d._id} className="text-muted-foreground truncate">
                          • {d.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!title || isCreating}
                  onClick={handleCreate}
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Issue
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <AuthContainer />
      </Unauthenticated>
    </div>
  );
}
