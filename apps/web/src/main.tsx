import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import ReactDOM from "react-dom/client";

import { authClient } from "@/lib/auth-client";

import Loader from "./components/loader";
import { RouterError } from "./components/router/route-error";
import { RouterNotFound } from "./components/router/not-found";
import { routeTree } from "./routeTree.gen";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <Loader />,
  defaultErrorComponent: RouterError,
  defaultNotFoundComponent: RouterNotFound,
  context: {},
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        {children}
      </ConvexBetterAuthProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
