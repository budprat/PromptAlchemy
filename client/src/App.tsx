import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";

import Dashboard from "@/pages/Dashboard";
import PromptEvaluation from "@/pages/PromptEvaluation";
import PromptOptimization from "@/pages/PromptOptimization";
import PromptVault from "@/pages/PromptVault";
import WhiteboardPage from "@/pages/WhiteboardPage";
import NotFound from "@/pages/not-found";

import MobileHeader from "@/components/layout/MobileHeader";
import Sidebar from "@/components/layout/Sidebar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:pl-64">
        <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/prompt-evaluation" component={PromptEvaluation} />
            <Route path="/prompt-optimization" component={PromptOptimization} />
            <Route path="/vault" component={PromptVault} />
            <Route path="/whiteboard" component={WhiteboardPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider>
            <Router />
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
