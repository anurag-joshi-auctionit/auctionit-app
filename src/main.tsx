import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, hasRole } from "@auctionit/lib";
import { ThemeProvider, Toaster } from "@auctionit/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

// Drop per-user client state when the session changes (logout / login / 401),
// including the subscription reminder-dismissed flag and any pending-payment
// reference, so nothing leaks into the next user's session.
function onSessionReset() {
  queryClient.clear();
  if (typeof sessionStorage !== "undefined") {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("subscription:")) sessionStorage.removeItem(key);
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider
            apiUrl={apiUrl}
            appId="app"
            requireUser={(u) => {
              if (hasRole(u, "client")) return true;
              if (hasRole(u, "bidder")) return u.bidderCompId != null;
              return false;
            }}
            onSessionReset={onSessionReset}
          >
            <App />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
