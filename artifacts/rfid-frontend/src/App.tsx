import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Tools from "@/pages/Tools";
import IssueReturn from "@/pages/IssueReturn";
import Scan from "@/pages/Scan";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

setAuthTokenGetter(() => localStorage.getItem("rfid_token"));

function Router() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem("rfid_token");
    if (!token && location !== "/login") {
      setLocation("/login");
    } else if (token && location === "/login") {
      setLocation("/");
    }
  }, [location, setLocation]);

  if (location === "/login") {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tools" component={Tools} />
        <Route path="/issue" component={IssueReturn} />
        <Route path="/scan" component={Scan} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
