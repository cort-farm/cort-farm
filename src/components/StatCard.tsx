import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon, ChevronLeft } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  subtitle?: string;
  index?: number;
}

export default function StatCard({
  title, amount, icon: Icon, color, bgColor,
  onClick, subtitle, index = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={onClick ? { y: -3, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={cn(
        "relative bg-card border border-border rounded-2xl p-5 overflow-hidden group",
        "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)]",
        onClick && "cursor-pointer hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] hover:border-border/60 transition-all duration-300"
      )}
      data-testid={`stat-card-${title}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 opacity-60 rounded-t-2xl" style={{ background: "var(--card-accent, transparent)" }} />

      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300",
          "shadow-sm group-hover:scale-110",
          bgColor
        )}>
          <Icon className={cn("w-6 h-6", color)} strokeWidth={2} />
        </div>
        {onClick && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
            <span>تفاصيل</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <p
          className="text-[1.6rem] font-black text-foreground leading-none tabular-nums"
          dir="ltr"
          style={{ textAlign: "right", letterSpacing: "-0.02em" }}
        >
          {formatCurrency(amount)}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
