import { useState, useMemo } from "react";
import { useFinanceData, Transaction } from "@/hooks/useFinanceData";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const typeLabels: Record<string, string> = {
  sale: "بيعة نقدية",
  debt_added: "دين مضاف",
  debt_paid: "سداد دين",
  debtor_added: "مدين جديد",
  debtor_collected: "تحصيل",
  withdrawal: "سحب شخصي",
};

const typeMeta: Record<string, { badgeClass: string; positive: boolean }> = {
  sale: { badgeClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debt_added: { badgeClass: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", positive: false },
  debt_paid: { badgeClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", positive: true },
  debtor_added: { badgeClass: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400", positive: false },
  debtor_collected: { badgeClass: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400", positive: true },
  withdrawal: { badgeClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", positive: false },
};

export default function Transactions() {
  const { transactions } = useFinanceData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || tx.type === filterType;
      const matchFrom = !dateFrom || tx.date >= dateFrom;
      const matchTo = !dateTo || tx.date <= dateTo;
      return matchSearch && matchType && matchFrom && matchTo;
    });
  }, [transactions, search, filterType, dateFrom, dateTo]);

  const totalIn = filtered.filter(t => typeMeta[t.type]?.positive).reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => !typeMeta[t.type]?.positive).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
        <h1 className="text-2xl font-black text-foreground tracking-tight">سجل العمليات</h1>
        <p className="text-muted-foreground text-sm mt-1">جميع العمليات المالية مرتبة زمنياً</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">إجمالي الوارد</span>
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums" dir="ltr">{formatCurrency(totalIn)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-rose-50 dark:bg-rose-900/15 border border-rose-200/60 dark:border-rose-800/40 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">إجمالي الصادر</span>
          </div>
          <p className="text-xl font-black text-rose-700 dark:text-rose-400 tabular-nums" dir="ltr">{formatCurrency(totalOut)}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-xs font-semibold">التصفية والبحث</span>
        </div>
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في العمليات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-10 rounded-xl h-10 bg-muted/40 border-border/60"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 rounded-xl h-10 bg-muted/40 border-border/60" data-testid="select-filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="sale">بيعة نقدية</SelectItem>
              <SelectItem value="debt_added">دين مضاف</SelectItem>
              <SelectItem value="debt_paid">سداد دين</SelectItem>
              <SelectItem value="debtor_added">مدين جديد</SelectItem>
              <SelectItem value="debtor_collected">تحصيل</SelectItem>
              <SelectItem value="withdrawal">سحب شخصي</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 rounded-xl h-10 bg-muted/40 border-border/60 text-sm" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 rounded-xl h-10 bg-muted/40 border-border/60 text-sm" />
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="font-bold text-foreground text-sm">العمليات</span>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{filtered.length} عملية</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="font-medium">لا توجد عمليات مطابقة</p>
            <p className="text-xs mt-1.5">جرب تعديل معايير البحث</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx, i) => {
              const meta = typeMeta[tx.type] || { badgeClass: "bg-muted text-muted-foreground", positive: true };
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.25) }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                  data-testid={`transaction-row-${tx.id}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.positive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"}`}>
                    {meta.positive
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                        {typeLabels[tx.type]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatShortDate(tx.date)}</span>
                    </div>
                  </div>
                  <p className={`text-sm font-black tabular-nums flex-shrink-0 ${meta.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`} dir="ltr">
                    {meta.positive ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
