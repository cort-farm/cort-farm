import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (password.length < 6) { setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setLocation("/");
    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(e.code === "auth/email-already-in-use" ? "البريد الإلكتروني مستخدم بالفعل" : "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-blue-500/5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/6 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-xl shadow-primary/30 mb-5"
          >
            <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-black text-foreground">إنشاء حساب</h1>
          <p className="text-muted-foreground text-sm mt-1.5">نظام إدارة المبيعات والمالية</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-7 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-bold text-foreground mb-1">حساب جديد</h2>
          <p className="text-sm text-muted-foreground mb-6">أدخل بياناتك لإنشاء حسابك</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 mb-5 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" required
                  className="pr-10 text-left h-11 rounded-xl border-border/70 bg-muted/40 focus:bg-card transition-colors"
                  data-testid="input-email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل" required
                  className="pr-10 pl-10 h-11 rounded-xl border-border/70 bg-muted/40 focus:bg-card transition-colors"
                  data-testid="input-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-semibold text-foreground">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirm" type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور" required
                  className="pr-10 pl-10 h-11 rounded-xl border-border/70 bg-muted/40 focus:bg-card transition-colors"
                  data-testid="input-confirm-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit"
              className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 mt-2"
              disabled={loading} data-testid="button-register">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    جاري الإنشاء...
                  </span>
                : "إنشاء الحساب"
              }
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">تسجيل الدخول</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
