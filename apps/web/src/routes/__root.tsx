import { HeadContent, Outlet, createRootRouteWithContext, useElementScrollRestoration } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useRef } from "react";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AgentSidebar } from "@/components/agent-sidebar";

import "../index.css";

export interface RouterAppContext { }

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "BetterRepo",
      },
      {
        name: "description",
        content: "BetterRepo is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useElementScrollRestoration({
    id: "root-scroll",
    getElement: () => scrollAreaRef.current,
  });

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-[100dvh] overflow-hidden">
          <Header />
          <div ref={scrollAreaRef} className="min-h-0 overflow-y-auto">
            <Outlet />
          </div>
        </div>
        <AgentSidebar />
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
