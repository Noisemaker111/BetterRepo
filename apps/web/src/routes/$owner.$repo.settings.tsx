import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Globe, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/$owner/$repo/settings")({
  component: RepoSettings,
});

function RepoSettings() {
  const { owner, repo } = Route.useParams();
  const navigate = useNavigate();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repo });

  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const updateRepo = useMutation(api.repositories.mutations.update);
  const updateVisibility = useMutation(api.repositories.mutations.updateVisibility);
  const deleteRepoMutation = useMutation(api.repositories.mutations.deleteRepo);

  if (repository === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center text-muted-foreground">Repository not found</div>
        </div>
      </div>
    );
  }

  useState(() => {
    if (repository) {
      setRepoName(repository.name);
      setDescription(repository.description || "");
      setIsPublic(repository.isPublic);
    }
  });

  const handleSave = async () => {
    if (!repoName.trim()) {
      setError("Repository name is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateRepo({
        id: repository._id,
        name: repoName,
        description,
      });

      if (repository.isPublic !== isPublic) {
        await updateVisibility({
          id: repository._id,
          isPublic,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this repository? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteRepoMutation({ id: repository._id });
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete repository");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[800px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-left">
          <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your repository settings and preferences.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold">General</CardTitle>
            <CardDescription className="text-xs">Update your repository name and description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Repository Name</label>
              <div className="flex gap-4">
                <Input
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="rounded-xl glass border-white/5 bg-background/50 h-10 flex-1"
                />
                <Button variant="outline" className="rounded-xl glass border-white/5 font-bold text-xs h-10 px-6" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rename"}
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-white/5 bg-background/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold">Visibility</CardTitle>
            <CardDescription className="text-xs">Control who can see this repository.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${isPublic ? "border-primary/20 bg-primary/5" : "border-white/5 bg-white/[0.02]"}`}
              onClick={() => setIsPublic(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone on the internet can see this repository.</p>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isPublic ? "border-primary" : "border-white/20"}`}>
                {isPublic && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${!isPublic ? "border-primary/20 bg-primary/5" : "border-white/5 bg-white/[0.02]"}`}
              onClick={() => setIsPublic(false)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Private</p>
                  <p className="text-xs text-muted-foreground">You choose who can see and commit to this repository.</p>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${!isPublic ? "border-primary" : "border-white/20"}`}>
                {!isPublic && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Visibility
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20 rounded-2xl overflow-hidden shadow-xl bg-red-500/[0.02]">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold text-red-500">Danger Zone</CardTitle>
            <CardDescription className="text-xs">Destructive actions for this repository.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-colors group cursor-pointer">
              <div className="text-left">
                <p className="text-sm font-bold">Transfer ownership</p>
                <p className="text-xs text-muted-foreground">Transfer this repository to another user or organization.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-wider h-8">Transfer</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors group cursor-pointer">
              <div className="text-left">
                <p className="text-sm font-bold text-red-500">Delete this repository</p>
                <p className="text-xs text-muted-foreground">Once you delete a repository, there is no going back. Please be certain.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold uppercase tracking-wider h-8"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
