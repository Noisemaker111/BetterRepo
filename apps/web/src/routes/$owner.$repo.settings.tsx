import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Globe, Lock } from "lucide-react";

export const Route = createFileRoute("/$owner/$repo/settings")({
  component: RepoSettings,
});

function RepoSettings() {
  const { owner, repo } = Route.useParams();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[800px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-left">
          <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your repository settings and preferences.</p>
        </div>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold">General</CardTitle>
            <CardDescription className="text-xs">Update your repository name and description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Repository Name</label>
              <div className="flex gap-4">
                <Input defaultValue={repo} className="rounded-xl glass border-white/5 bg-background/50 h-10 flex-1" />
                <Button variant="outline" className="rounded-xl glass border-white/5 font-bold text-xs h-10 px-6">Rename</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold">Visibility</CardTitle>
            <CardDescription className="text-xs">Control who can see this repository.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone on the internet can see this repository.</p>
                </div>
              </div>
              <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] group cursor-pointer hover:bg-white/[0.05] transition-colors opacity-50">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Private</p>
                  <p className="text-xs text-muted-foreground">You choose who can see and commit to this repository.</p>
                </div>
              </div>
              <div className="h-4 w-4 rounded-full border-2 border-white/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20 rounded-2xl overflow-hidden shadow-xl bg-red-500/[0.02]">
          <CardHeader className="p-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold text-red-500">Danger Zone</CardTitle>
            <CardDescription className="text-xs">Destructive actions for this repository.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors group cursor-pointer">
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
              <Button variant="destructive" size="sm" className="rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold uppercase tracking-wider h-8">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
