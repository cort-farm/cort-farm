import { useState } from "react";
import { useFinanceData } from "@/hooks/useFinanceData";
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

type DialogType = "sale" | "debt" | "debtor" | "withdrawal" | "payDebt" | "collect"
  | "viewDebts" | "viewDebtors" | "viewCosts" | "viewWithdrawals" | null;

const dialogTitles: Record<string, string> = {
  sale: "إضافة عملية بيع",
  debt: "إضافة دين علي",
  debtor: "إضافة مدين",
  withdrawal: "إضافة سحب شخصي",
  payDebt: "سداد دين",
  collect: "تحصيل من مدين",
  viewDebts: "الديون علي",
  viewDebtors: "المدينين",
  viewCosts: "تكاليف البيع",
  viewWithdrawals: "السحب الشخصي",
};

const txTypeLabel: Record<string, string> = {
  sale: "بيعة",
  debt_added: "دين مضاف",
  debt_paid: "سداد دين",
  debtor_added: "مدين جديد",
  debtor_collected: "تحصيل",
  withdrawal: "سحب",
};

const txTypeMeta: Record<string, { color: string; bg: string; positive: boolean }> = {
  sale: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debt_paid: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debtor_collected: { color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400", positive: true },
  debt_added: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", positive: false },
  debtor_added: { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400", positive: false },
  withdrawal: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", positive: false },
};

export default function Dashboard() {
  const data = useFinanceData();
  const [dialog, setDialog] = useState<DialogType>(null);

  const open = (type: DialogType) => setDialog(type);
  const close = () => setDialog(null);

  const handleAddSale = async (saleData: Parameters<typeof data.addSale>[0]) => {
    await data.addSale(saleData); toast.success("تم تسجيل عملية البيع بنجاح");
  };
  const handleAddDebt = async (debtData: Parameters<typeof data.addDebt>[0]) => {
    await data.addDebt(debtData); toast.success("تم إضافة الدين بنجاح");
  };
  const handleAddDebtor = async (debtorData: Parameters<typeof data.addDebtor>[0]) => {
    await data.addDebtor(debtorData); toast.success("تم إضافة المدين بنجاح");
  };
  const handleAddWithdrawal = async (wData: Parameters<typeof data.addWithdrawal>[0]) => {
    await data.addWithdrawal(wData); toast.success("تم تسجيل السحب بنجاح");
  };
  const handlePayDebt = async (id: string, amount: number, date: string) => {
    await data.payDebt(id, amount, date); toast.success("تم تسجيل السداد بنجاح");
  };
  const handleCollect = async (id: string, amount: number, date: string) => {
    await data.collectDebtor(id, amount, date); toast.success("تم تسجيل التحصيل بنجاح");
  };

  const recentTransactions = data.transactions.slice(0, 6);

  return (
    <div className="space-y-7 pb-24" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard index={0} title="الميزانية الحالية" amount={data.currentBudget}
          icon={Wallet} color="text-primary" bgColor="bg-primary/12 dark:bg-primary/20" />
        <StatCard index={1} title="الميزانية الكلية" amount={data.totalBudget}
          icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          subtitle="النقدي + ذمم المدينين" />
        <StatCard index={2} title="الديون علي" amount={data.totalDebts}
          icon={CreditCard} color="text-rose-600 dark:text-rose-400"
          bgColor="bg-rose-100 dark:bg-rose-900/30"
          onClick={() => open("viewDebts")} />
        <StatCard index={3} title="المدينين" amount={data.totalDebtorsRemaining}
          icon={Users} color="text-sky-600 dark:text-sky-400"
          bgColor="bg-sky-100 dark:bg-sky-900/30"
          onClick={() => open("viewDebtors")} />
        <StatCard index={4} title="تكاليف البيع" amount={data.sellingCostsTotal}
          icon={ShoppingBag} color="text-violet-600 dark:text-violet-400"
          bgColor="bg-violet-100 dark:bg-violet-900/30"
          onClick={() => open("viewCosts")} />
        <StatCard index={5} title="السحب الشخصي" amount={data.withdrawalsTotal}
          icon={PiggyBank} color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
          onClick={() => open("viewWithdrawals")} />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground text-base">آخر العمليات</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {recentTransactions.length} عملية
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="font-medium">لا توجد عمليات بعد</p>
            <p className="text-xs mt-1.5">اضغط + لإضافة عملية جديدة</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentTransactions.map((tx, i) => {
              const meta = txTypeMeta[tx.type] || { color: "text-foreground", bg: "bg-muted text-foreground", positive: true };
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
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

      {/* FAB */}
      <FloatingActionButton
        onAddSale={() => open("sale")}
        onAddDebt={() => open("debt")}
        onAddDebtor={() => open("debtor")}
        onAddWithdrawal={() => open("withdrawal")}
        onPayDebt={() => open("payDebt")}
        onCollectDebtor={() => open("collect")}
      />

      {/* Dialogs */}
      <Dialog open={dialog !== null} onOpenChange={close}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-lg font-bold">{dialog ? dialogTitles[dialog] : ""}</DialogTitle>
          </DialogHeader>

          {dialog === "sale" && <AddSaleForm onSubmit={handleAddSale} onClose={close} />}
          {dialog === "debt" && <AddDebtForm onSubmit={handleAddDebt} onClose={close} />}
          {dialog === "debtor" && <AddDebtorForm onSubmit={handleAddDebtor} onClose={close} />}
          {dialog === "withdrawal" && <AddWithdrawalForm onSubmit={handleAddWithdrawal} onClose={close} />}
          {dialog === "payDebt" && <PayDebtForm debts={data.debts} onSubmit={handlePayDebt} onClose={close} />}
          {dialog === "collect" && <CollectDebtorForm debtors={data.debtors} onSubmit={handleCollect} onClose={close} />}

          {dialog === "viewDebts" && (
            <div className="space-y-2.5 mt-1">
              {data.debts.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد ديون</p>
                : data.debts.map(d => (
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
              {data.debtors.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا يوجد مدينون</p>
                : data.debtors.map(d => (
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
              {data.sales.filter(s => s.sellingCost > 0).length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد تكاليف</p>
                : data.sales.filter(s => s.sellingCost > 0).map(s => (
                  <div key={s.id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{s.costDescription || "تكلفة بيع"}</span>
                      <span className="font-black text-violet-600 dark:text-violet-400" dir="ltr">{formatCurrency(s.sellingCost)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">المنتج: {s.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(s.date)}</p>
                  </div>
                ))
              }
            </div>
          )}

          {dialog === "viewWithdrawals" && (
            <div className="space-y-2.5 mt-1">
              {data.withdrawals.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-8">لا توجد سحوبات</p>
                : data.withdrawals.map(w => (
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
