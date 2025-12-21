import { useState, useEffect, useRef } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@BetterRepo/backend/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Settings as SettingsIcon,
  Github,
  Mail,
  Shield,
  Palette,
  Bell,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Camera,
  LogOut,
  RefreshCw,
  Download,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useGitHubIntegration } from "@/hooks/use-github-integration";
import { ImportGitHubRepoModal } from "@/components/github/import-repo-modal";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub Integration
  const userId = user?.userId || user?._id?.toString() || null;
  const github = useGitHubIntegration(userId);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  // Check if GitHub is connected via BetterAuth (for login) or our custom connection (for API)
  const isGithubAuthConnected = user?.email?.includes("github") || accounts.some(a => a.provider === "github");
  const isGithubApiConnected = github.isConnected;

  if (user === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Not Authenticated</h2>
        <p className="text-muted-foreground">Please sign in to access settings.</p>
        <Button onClick={() => window.location.href = "/auth"}>Sign In</Button>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ name, image });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        const error = await result.text();
        throw new Error(error || "Upload failed");
      }

      const { storageId } = await result.json();
      await updateProfile({ storageId });
      toast.success("Profile picture updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handleLinkGithub = async () => {
    try {
      // Let Better Auth handle the callback URL - don't specify it explicitly
      await authClient.linkSocial({
        provider: "github",
      });
      toast.success("Redirecting to GitHub...");
    } catch (error: any) {
      toast.error(error.message || "Failed to link GitHub");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "connections", label: "Connections", icon: LinkIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="container max-w-6xl py-10 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-display font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="flex flex-col gap-2 h-fit md:sticky md:top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <div className="pt-6 mt-6 border-t border-white/5 flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start gap-3 text-destructive hover:bg-destructive/10 rounded-xl px-4"
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/auth";
                      },
                    },
                  });
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex flex-col gap-6">
            {activeTab === "profile" && (
              <Card className="glass border-white/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your personal information. Changes can only be made once every 3 months.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                      <div
                        className={cn(
                          "w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-all bg-muted cursor-pointer relative",
                          isUploadingImage && "opacity-50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <img
                          src={image || "https://avatar.vercel.sh/user"}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-1.5 bg-background border border-white/10 rounded-lg shadow-lg hover:bg-muted transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>


                    <div className="flex-1 w-full space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="glass border-white/10 focus-visible:ring-primary/50"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="glass border-white/10 bg-white/5 opacity-60 pl-10"
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] text-muted-foreground px-1">Email cannot be changed directly.</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="image">Profile Image URL</Label>
                        <Input
                          id="image"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="glass border-white/10 focus-visible:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-white/5 border-t border-white/10 px-6 py-4 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Last updated: {(user as any).lastProfileUpdate ? new Date((user as any).lastProfileUpdate).toLocaleDateString() : "Never"}
                  </p>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="premium-gradient border-none rounded-full px-6"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "connections" && (
              <>
                <Card className="glass border-white/10 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>
                      Manage your linked social accounts for authentication and integrations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Google Connection */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-blue-500">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.47-1.92 4.64-1.2 1.2-3.08 2.58-5.92 2.58-4.79 0-8.34-3.89-8.34-8.67Q4.14 8.07 8.34 3.33c2.84 0 4.72 1.38 5.92 2.58l2.31-2.31C14.61 1.65 11.96 0 8.34 0 3.73 0 0 3.73 0 8.34s3.73 8.34 8.34 8.34c2.54 0 4.46-.83 5.97-2.4 1.54-1.54 2.03-3.71 2.03-5.59 0-.58-.05-1.12-.13-1.63l-4.07.01z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold">Google</p>
                          <p className="text-xs text-muted-foreground">Used for login and sync</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 px-3 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected
                      </Badge>
                    </div>

                    {/* GitHub Connection - Enhanced */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-zinc-500/10">
                          <Github className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold">GitHub</p>
                          <p className="text-xs text-muted-foreground">
                            {isGithubApiConnected
                              ? `Connected as @${github.connection?.githubUsername}`
                              : "Connect to import repositories and enable two-way sync"}
                          </p>
                        </div>
                      </div>
                      {isGithubApiConnected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 px-3 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Connected
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              github.disconnectGitHub();
                              toast.success("GitHub disconnected");
                            }}
                          >
                            <Unlink className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : isConnecting ? (
                        <Button disabled className="gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={github.connectGitHub}
                          className="rounded-full border-white/10 hover:bg-white/5 gap-2"
                        >
                          Connect
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* GitHub Repositories Section */}
                {isGithubApiConnected && (
                  <Card className="glass border-white/10 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Github className="w-5 h-5" />
                            Synced Repositories
                          </CardTitle>
                          <CardDescription>
                            Repositories synced from GitHub with two-way real-time updates.
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => setShowImportModal(true)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Import Repository
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {github.syncedRepos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">No repositories synced yet</p>
                          <p className="text-sm">Import a repository from GitHub to get started</p>
                          <Button
                            variant="outline"
                            onClick={() => setShowImportModal(true)}
                            className="mt-4 gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Import from GitHub
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {github.syncedRepos.map((repo) => (
                            <div
                              key={repo._id}
                              className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{repo.name}</span>
                                  <span className="text-muted-foreground text-sm">/{repo.owner}</span>
                                  {repo.syncEnabled && (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                      Sync Active
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last synced: {repo.lastSyncedAt
                                    ? new Date(repo.lastSyncedAt).toLocaleString()
                                    : "Never"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() => {
                                    github.syncRepository(repo._id)
                                      .then((result) => {
                                        toast.success(`Synced ${result.issuesSynced} issues and ${result.prsSynced} PRs`);
                                      })
                                      .catch((error) => {
                                        toast.error(error.message || "Sync failed");
                                      });
                                  }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Sync Now
                                </Button>
                                {repo.githubUrl && (
                                  <a
                                    href={repo.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Import Modal */}
                <ImportGitHubRepoModal
                  open={showImportModal}
                  onOpenChange={setShowImportModal}
                  availableRepos={github.availableRepos}
                  syncedRepoIds={github.syncedRepos.map(r => r.githubId).filter((id): id is number => id != null)}
                  isLoading={github.isLoadingRepos}
                  onRefresh={github.fetchAvailableRepos}
                  onImport={github.importRepository}
                />
              </>
            )}

            {activeTab === "appearance" && (
              <Card className="glass border-white/10 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how BetterRepo looks on your device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="space-y-0.5">
                      <p className="font-bold">Theme Mode</p>
                      <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                    </div>
                    <ModeToggle />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 opacity-50 cursor-not-allowed">
                    <div className="space-y-0.5">
                      <p className="font-bold">Accent Color</p>
                      <p className="text-xs text-muted-foreground">Choose your interface brand color (Coming soon)</p>
                    </div>
                    <div className="flex gap-2">
                      {["#3b82f6", "#a855f7", "#22c55e", "#ef4444"].map((color) => (
                        <div key={color} className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(activeTab === "security" || activeTab === "notifications") && (
              <Card className="glass border-white/10 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader>
                  <CardTitle className="capitalize">{activeTab}</CardTitle>
                  <CardDescription>
                    These settings are currently under development.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <SettingsIcon className="w-8 h-8 text-primary animate-spin-[20s_linear_infinite]" />
                  </div>
                  <h3 className="text-lg font-bold">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    We're working hard to bring you more control over your {activeTab}. Stay tuned!
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
