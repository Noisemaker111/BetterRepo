import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldCheck, ShieldAlert, Lock, Key, Eye, EyeOff } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";

export const Route = createFileRoute("/$owner/$repo/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const { owner, repo: repoName } = Route.useParams();
  const repository = useQuery(api.repositories.queries.getByName, { owner, name: repoName });

  if (!repository) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-left">
          <h1 className="text-2xl font-display font-bold mb-1 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            Security
          </h1>
          <p className="text-muted-foreground text-sm">Manage security settings and vulnerabilities for this repository.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-white/5 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">Secure</Badge>
              </div>
              <h3 className="font-bold mb-1">Dependabot</h3>
              <p className="text-sm text-muted-foreground">Automatic security updates enabled</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">3 Alerts</Badge>
              </div>
              <h3 className="font-bold mb-1">Vulnerabilities</h3>
              <p className="text-sm text-muted-foreground">Security advisories found</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Active</Badge>
              </div>
              <h3 className="font-bold mb-1">Secret Scanning</h3>
              <p className="text-sm text-muted-foreground">Secrets detected in code</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold">Security Settings</CardTitle>
            <CardDescription className="text-xs">Configure security features for this repository.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Dependabot Security Updates</p>
                  <p className="text-xs text-muted-foreground">Automatically raise pull requests to update vulnerable dependencies.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">Enable</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Eye className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Private Vulnerability Reporting</p>
                  <p className="text-xs text-muted-foreground">Allow security researchers to report vulnerabilities privately.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">Configure</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Code Scanning</p>
                  <p className="text-xs text-muted-foreground">Automatically detect security vulnerabilities in your code.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">Set up</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
