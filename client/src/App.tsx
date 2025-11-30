import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import Users from "@/pages/Users";
import MySchedule from "@/pages/MySchedule";
import NotFound from "@/pages/not-found";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-primary font-bold text-xl">A</span>
        </div>
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (!isAdmin) {
        setLocation("/my-schedule");
      }
    }
  }, [isLoading, user, isAdmin, setLocation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function ReceptionRoute({ children }: { children: React.ReactNode }) {
  const { user, isReception, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (!isReception) {
        setLocation("/my-schedule");
      }
    }
  }, [isLoading, user, isReception, setLocation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isReception) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isAdmin, isReception, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (isAdmin) {
        setLocation("/dashboard");
      } else if (isReception) {
        setLocation("/calendar");
      } else {
        setLocation("/my-schedule");
      }
    }
  }, [isLoading, user, isAdmin, isReception, setLocation]);

  return <LoadingScreen />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <HomeRedirect />
      </Route>
      <Route path="/dashboard">
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      </Route>
      <Route path="/calendar">
        <ReceptionRoute>
          <Calendar />
        </ReceptionRoute>
      </Route>
      <Route path="/clients">
        <ReceptionRoute>
          <Clients />
        </ReceptionRoute>
      </Route>
      <Route path="/services">
        <AdminRoute>
          <Services />
        </AdminRoute>
      </Route>
      <Route path="/users">
        <AdminRoute>
          <Users />
        </AdminRoute>
      </Route>
      <Route path="/my-schedule">
        <ProtectedRoute>
          <MySchedule />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
