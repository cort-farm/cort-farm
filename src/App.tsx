import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useFinanceStore } from "@/stores/useFinanceStore";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Reports from "@/pages/Reports";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

function ProtectedRoutes({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const { user } = useAuth();
  const subscribe = useFinanceStore(s => s.subscribe);
  const unsubscribe = useFinanceStore(s => s.unsubscribe);

  useEffect(() => {
    if (user) {
      subscribe(user.uid);
    } else {
      unsubscribe();
    }
    return () => unsubscribe();
  }, [user?.uid]);

  if (!user) return <Redirect to="/login" />;

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AuthRoutes() {
  const { user } = useAuth();
  if (user) return <Redirect to="/" />;
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route><Redirect to="/login" /></Route>
    </Switch>
  );
}

function AppRouter() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (user) {
    return <ProtectedRoutes darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }
  return <AuthRoutes />;
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
