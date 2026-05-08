import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();


function AppRoutes({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/register">
        {user ? <Redirect to="/" /> : <Register />}
      </Route>
      <Route path="/">
        {!user ? <Redirect to="/login" /> : (
          <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/transactions">
        {!user ? <Redirect to="/login" /> : (
          <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Transactions />
          </Layout>
        )}
      </Route>
      <Route path="/reports">
        {!user ? <Redirect to="/login" /> : (
          <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Reports />
          </Layout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppRoutes darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster position="top-center" richColors dir="rtl" />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
