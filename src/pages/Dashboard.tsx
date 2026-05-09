import { useState } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import {
  Wallet, TrendingUp, CreditCard, Users, ShoppingBag, PiggyBank,
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddSaleForm from "@/components/forms/AddSaleForm";
import AddDebtForm from "@/components/forms/AddDebtForm";
import AddDebtorForm from "@/components/forms/AddDebtorForm";
import AddWithdrawalForm from "@/components/forms/AddWithdrawalForm";
import PayDebtForm from "@/components/forms/PayDebtForm";
import CollectDebtorForm from "@/components/forms/CollectDebtorForm";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as svc from "@/services/financeService";

type DialogType = "sale" | "debt" | "debtor" | "withdrawal" | "payDebt" | "collect"
  | "viewDebts" | "viewDebtors" | "viewCosts" | "viewWithdrawals" | null;

const dialogTitles: Record<string, string> = {
  sale: "إضافة عملية بيع", debt: "إضافة دين علي", debtor: "إضافة مدين",
  withdrawal: "إضافة سحب شخصي", payDebt: "سداد دين", collect: "تحصيل من مدين",
  viewDebts: "الديون علي", viewDebtors: "المدينين",
  viewCosts: "تكاليف البيع", viewWithdrawals: "السحب الشخصي",
};

const txTypeMeta: Record<string, { color: string; bg: string; positive: boolean }> = {
  sale: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debt_paid: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debtor_collected: { color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400", positive: true },
  debt_added: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", positive: false },
  debtor_added: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400", positive: false },
  withdrawal: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", positive: false },
};

const txTypeLabel: Record<string, string> = {
  sale: "بيعة", debt_added: "دين مضاف", debt_paid: "سداد دين",
  debtor_added: "مدين جديد", debtor_collected: "تحصيل", withdrawal: "سحب",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, debts, debtors, derived, loading } = useFinanceStore();
  const [dialog, setDialog] = useState<DialogType>(null);
  const uid = user!.uid;

  const open = (t: DialogType) => setDialog(t);
  const close = () => setDialog(null);

  const handleAddSale = async (data: Parameters<typeof svc.addSale>[1]) => {
    await svc.addSale(uid, data);
    toast.success("تم تسجيل عملية البيع بنجاح");
  };
  const handleAddDebt = async (data: Parameters<typeof svc.addDebt>[1]) => {
    await svc.addDebt(uid, data);
    toast.success("تم إضافة الدين بنجاح");
  };
  const handleAddDebtor = async (data: Parameters<typeof svc.addDebtor>[1]) => {
    await svc.addDebtor(uid, data);
    toast.success("تم إضافة المدين بنجاح");
  };
  const handleAddWithdrawal = async (data: Parameters<typeof svc.addWithdrawal>[1]) => {
    await svc.addWithdrawal(uid, data);
    toast.success("تم تسجيل السحب بنجاح");
  };
  const handlePayDebt = async (debtId: string, amount: number, date: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    await svc.payDebt(uid, debtId, debt.creditorName, debt.paidAmount, debt.amount, amount, date);
    toast.success("تم تسجيل السداد بنجاح");
  };
  const handleCollect = async (debtorId: string, amount: number, date: string) => {
    const debtor = debtors.find(d => d.id === debtorId);
    if (!debtor) return;
    await svc.collectDebtor(uid, debtorId, debtor.name, debtor.collectedAmount, debtor.remaining, amount, date);
    toast.success("تم تسجيل التحصيل بنجاح");
  };

  const recentTx = transactions.slice(0, 6);

  const costsFromTx = transactions
    .filter(t => t.type === "sale" && (t.metadata?.sellingCost ?? 0) > 0)
    .map(t => ({
      id: t.id,
      description: t.metadata?.costDescription || "تكلفة بيع",
      productName: t.metadata?.productName || "-",
      cost: t.metadata?.sellingCost ?? 0,
      date: t.date,
    }));

  const withdrawalsFromTx = transactions
    .filter(t => t.type === "withdrawal")
    .map(t => ({
      id: t.id,
      reason: t.metadata?.reason || t.description,
      amount: t.amount,
      date: t.date,
      notes: t.metadata?.notes,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-24" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">نظرة عامة على وضعك المالي</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5" />
          <span>مباشر</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard index={0} title="الميزانية الحالية" amount={derived.currentBudget}
          icon={Wallet} color="text-primary" bgColor="bg-primary/12 dark:bg-primary/20" />
        <StatCard index={1} title="الميزانية الكلية" amount={derived.totalBudget}
          icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          subtitle="النقدي + ذمم المدينين" />
        <StatCard index={2} title="الديون علي" amount={derived.totalDebts}
          icon={CreditCard} color="text-rose-600 dark:text-rose-400"
          bgColor="bg-rose-100 dark:bg-rose-900/30"
          onClick={() => open("viewDebts")} />
        <StatCard index={3} title="المدينين" amount={derived.totalDebtorsRemaining}
          icon={Users} color="text-sky-600 dark:text-sky-400"
          bgColor="bg-sky-100 dark:bg-sky-900/30"
          onClick={() => open("viewDebtors")} />
        <StatCard index={4} title="تكاليف البيع" amount={derived.sellingCostsTotal}
          icon={ShoppingBag} color="text-violet-600 dark:text-violet-400"
          bgColor="bg-violet-100 dark:bg-violet-900/30"
          onClick={() => open("viewCosts")} />
        <StatCard index={5} title="السحب الشخصي" amount={derived.withdrawalsTotal}
          icon={PiggyBank} color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
          onClick={() => open("viewWithdrawals")} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground text-base">آخر العمليات</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {recentTx.length} عملية
          </span>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="font-medium">لا توجد عمليات بعد</p>
            <p className="text-xs mt-1.5">اضغط + لإضافة عملية جديدة</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentTx.map((tx, i) => {
              const meta = txTypeMeta[tx.type] || { color: "text-foreground", bg: "bg-muted text-foreground", positive: true };
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.positive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"}`}>
                    {meta.positive
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg}`}>
                        {txTypeLabel[tx.type] || tx.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatShortDate(tx.date)}</span>
                    </div>
                  </div>
                  <p className={`text-sm font-black tabular-nums flex-shrink-0 ${meta.color}`} dir="ltr">
                    {meta.positive ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <FloatingActionButton
        onAddSale={() => open("sale")} onAddDebt={() => open("debt")}
        onAddDebtor={() => open("debtor")} onAddWithdrawal={() => open("withdrawal")}
        onPayDebt={() => open("payDebt")} onCollectDebtor={() => open("collect")}
      />

      <Dialog open={dialog !== null} onOpenChange={close}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-lg font-bold">{dialog ? dialogTitles[dialog] : ""}</DialogTitle>
          </DialogHeader>

          {dialog === "sale" && <AddSaleForm onSubmit={handleAddSale} onClose={close} />}
          {dialog === "debt" && <AddDebtForm onSubmit={handleAddDebt} onClose={close} />}
          {dialog === "debtor" && <AddDebtorForm onSubmit={handleAddDebtor} onClose={close} />}
          {dialog === "withdrawal" && <AddWithdrawalForm onSubmit={handleAddWithdrawal} onClose={close} />}
          {dialog === "payDebt" && <PayDebtForm debts={debts} onSubmit={handlePayDebt} onClose={close} />}
          {dialog === "collect" && <CollectDebtorForm debtors={debtors} onSubmit={handleCollect} onClose={close} />}

          {dialog === "viewDebts" && (
            <div className="space-y-2.5 mt-1">
              {debts.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد ديون</p>
                : debts.map(d => (
                  <div key={d.id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{d.creditorName}</span>
                      <Badge variant={d.status === "paid" ? "default" : "destructive"} className="text-xs rounded-lg">
                        {d.status === "paid" ? "مسدّد" : d.status === "partial" ? "جزئي" : "معلق"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الإجمالي</span>
                      <span className="font-semibold" dir="ltr">{formatCurrency(d.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المتبقي</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400" dir="ltr">{formatCurrency(d.amount - d.paidAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatShortDate(d.date)}</p>
                  </div>
                ))
              }
            </div>
          )}

          {dialog === "viewDebtors" && (
            <div className="space-y-2.5 mt-1">
              {debtors.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا يوجد مدينون</p>
                : debtors.map(d => (
                  <div key={d.id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{d.name}</span>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400" dir="ltr">{formatCurrency(d.remaining)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الإجمالي</span>
                      <span className="font-semibold" dir="ltr">{formatCurrency(d.amount)}</span>
                    </div>
                    {d.phone && <p className="text-sm text-muted-foreground">📞 {d.phone}</p>}
                    <p className="text-xs text-muted-foreground">{formatShortDate(d.date)}</p>
                  </div>
                ))
              }
            </div>
          )}

          {dialog === "viewCosts" && (
            <div className="space-y-2.5 mt-1">
              {costsFromTx.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد تكاليف</p>
                : costsFromTx.map(c => (
                  <div key={c.id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{c.description}</span>
                      <span className="font-black text-violet-600 dark:text-violet-400" dir="ltr">{formatCurrency(c.cost)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">المنتج: {c.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(c.date)}</p>
                  </div>
                ))
              }
            </div>
          )}

          {dialog === "viewWithdrawals" && (
            <div className="space-y-2.5 mt-1">
              {withdrawalsFromTx.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد سحوبات</p>
                : withdrawalsFromTx.map(w => (
                  <div key={w.id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{w.reason}</span>
                      <span className="font-black text-amber-600 dark:text-amber-400" dir="ltr">{formatCurrency(w.amount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatShortDate(w.date)}</p>
                    {w.notes && <p className="text-xs text-muted-foreground italic">{w.notes}</p>}
                  </div>
                ))
              }
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
