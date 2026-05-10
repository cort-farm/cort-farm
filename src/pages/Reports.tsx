import { useMemo } from "react";
import { useFinanceStore } from "@/stores/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, ShoppingCart, Users, Wallet } from "lucide-react";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
  fontFamily: "Cairo, sans-serif",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
};

const ChartCard = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-card border border-border rounded-3xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]"
  >
    <div className="px-5 py-4 border-b border-border">
      <h2 className="font-bold text-foreground">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

export default function Reports() {
  const { transactions, debtors, derived } = useFinanceStore();

  const now = new Date();

  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTHS_AR[d.getMonth()] });
    }
    return months;
  }, []);

  const monthlyData = useMemo(() => {
    return last6Months.map(({ year, month, label }) => {
      const monthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const totalSales = monthTx.filter(t => t.type === "sale").reduce((s, t) => s + t.amount, 0);
      const totalCosts = monthTx.filter(t => t.type === "sale").reduce((s, t) => s + (t.metadata?.sellingCost ?? 0), 0);
      const totalProfit = totalSales - totalCosts;
      const collections = monthTx.filter(t => t.type === "debtor_collected").reduce((s, t) => s + t.amount, 0);
      const withdrawalsSum = monthTx.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
      return { label, totalSales, totalProfit, collections, withdrawals: withdrawalsSum };
    });
  }, [transactions, last6Months]);

  const topDebtors = useMemo(() => {
    return [...debtors].filter(d => d.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, 5)
      .map(d => ({ name: d.name, value: d.remaining }));
  }, [debtors]);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyProfit = thisMonthTx.filter(t => t.type === "sale")
    .reduce((s, t) => s + t.amount - (t.metadata?.sellingCost ?? 0), 0);
  const monthlyTotal = thisMonthTx.filter(t => t.type === "sale")
    .reduce((s, t) => s + t.amount, 0);
  const totalCollections = transactions.filter(t => t.type === "debtor_collected").reduce((s, t) => s + t.amount, 0);
  const totalSales = transactions.filter(t => t.type === "sale").reduce((s, t) => s + t.amount, 0);

  const pieData = [
    { name: "مبيعات", value: totalSales },
    { name: "تحصيلات", value: totalCollections },
    { name: "تكاليف", value: derived.sellingCostsTotal },
    { name: "سحوبات", value: derived.withdrawalsTotal },
  ].filter(d => d.value > 0);

  const summaryCards = [
    { label: "ربح هذا الشهر", value: monthlyProfit, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200/60 dark:border-emerald-800/40" },
    { label: "مبيعات هذا الشهر", value: monthlyTotal, icon: ShoppingCart, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200/60 dark:border-blue-800/40" },
    { label: "إجمالي التحصيلات", value: totalCollections, icon: Users, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200/60 dark:border-teal-800/40" },
    { label: "إجمالي السحوبات", value: derived.withdrawalsTotal, icon: Wallet, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200/60 dark:border-amber-800/40" },
  ];

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
        <h1 className="text-2xl font-black text-foreground tracking-tight">التقارير والتحليلات</h1>
        <p className="text-muted-foreground text-sm mt-1">نظرة تحليلية شاملة على أداء مشروعك</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 24 }}
            className={`bg-card border ${border} rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]`}
          >
            <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            <p className={`text-[1.4rem] font-black ${color} tabular-nums leading-none`} dir="ltr">{formatCurrency(value)}</p>
          </motion.div>
        ))}
      </div>

      <ChartCard title="الأرباح الشهرية (آخر 6 أشهر)" delay={0.3}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "Cairo" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Cairo" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), "الربح"]} />
            <Bar dataKey="totalProfit" name="الربح" fill="hsl(214 89% 52%)" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="المبيعات والتحصيلات الشهرية" delay={0.38}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "Cairo" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Cairo" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontFamily: "Cairo", fontSize: "12px" }} />
            <Line type="monotone" dataKey="totalSales" name="المبيعات" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="collections" name="التحصيلات" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="توزيع الإجماليات" delay={0.46}>
          {pieData.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات كافية</div>
            : <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontFamily: "Cairo", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        <ChartCard title="أكبر المدينين" delay={0.54}>
          {topDebtors.length === 0
            ? <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">لا يوجد مدينون</div>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topDebtors} layout="vertical" margin={{ top: 4, right: 20, left: 60, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Cairo" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))", fontFamily: "Cairo" }} width={58} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), "المتبقي"]} />
                  <Bar dataKey="value" name="المتبقي" fill="#ef4444" radius={[0, 6, 6, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
          }
        </ChartCard>
      </div>
    </div>
  );
}
