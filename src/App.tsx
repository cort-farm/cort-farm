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
import { firebaseConfigured } from "@/lib/firebase";

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

function FirebaseSetupScreen() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>
          إعداد Firebase مطلوب
        </h1>
        <p style={{ color: "#64748b", marginBottom: 24, lineHeight: 1.7 }}>
          يحتاج التطبيق إلى بيانات اعتماد Firebase للاتصال بقاعدة البيانات.
          أضف المتغيرات التالية في قسم <strong>Secrets</strong> بإعدادات المشروع:
        </p>
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: 10,
            padding: "1rem 1.25rem",
            textAlign: "left",
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 2,
            marginBottom: 24,
            color: "#334155",
          }}
        >
          {[
            "VITE_FIREBASE_API_KEY",
            "VITE_FIREBASE_AUTH_DOMAIN",
            "VITE_FIREBASE_PROJECT_ID",
            "VITE_FIREBASE_STORAGE_BUCKET",
            "VITE_FIREBASE_MESSAGING_SENDER_ID",
            "VITE_FIREBASE_APP_ID",
          ].map((k) => (
            <div key={k}>{k}</div>
          ))}
        </div>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>
          ستجد هذه القيم في إعدادات مشروعك على{" "}
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#f97316" }}
          >
            Firebase Console
          </a>
          . بعد الإضافة، أعد تشغيل التطبيق.
        </p>
      </div>
    </div>
  );
}

function App() {
  if (!firebaseConfigured) {
    return <FirebaseSetupScreen />;
  }

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
