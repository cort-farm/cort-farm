import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, CreditCard, Users, Wallet, Banknote, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps {
  onAddSale: () => void;
  onAddDebt: () => void;
  onAddDebtor: () => void;
  onAddWithdrawal: () => void;
  onPayDebt: () => void;
  onCollectDebtor: () => void;
}

const actions = [
  { label: "إضافة بيعة", icon: ShoppingCart, color: "bg-emerald-500", shadow: "shadow-emerald-500/40", action: "sale" },
  { label: "منح قرض", icon: Users, color: "bg-sky-500", shadow: "shadow-sky-500/40", action: "debtor" },
  { label: "إضافة دين علي", icon: CreditCard, color: "bg-rose-500", shadow: "shadow-rose-500/40", action: "debt" },
  { label: "سحب شخصي", icon: Wallet, color: "bg-amber-500", shadow: "shadow-amber-500/40", action: "withdrawal" },
  { label: "سداد دين", icon: Banknote, color: "bg-violet-500", shadow: "shadow-violet-500/40", action: "payDebt" },
  { label: "تحصيل من مدين", icon: HandCoins, color: "bg-teal-500", shadow: "shadow-teal-500/40", action: "collect" },
];

export default function FloatingActionButton({
  onAddSale, onAddDebt, onAddDebtor, onAddWithdrawal, onPayDebt, onCollectDebtor,
}: FABProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: string) => {
    setOpen(false);
    switch (action) {
      case "sale": onAddSale(); break;
      case "debt": onAddDebt(); break;
      case "debtor": onAddDebtor(); break;
      case "withdrawal": onAddWithdrawal(); break;
      case "payDebt": onPayDebt(); break;
      case "collect": onCollectDebtor(); break;
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-7 left-6 z-40 flex flex-col-reverse items-end gap-2.5" dir="rtl">
        <AnimatePresence>
          {open && actions.map((action, i) => (
            <motion.button
              key={action.action}
              initial={{ opacity: 0, x: 30, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.85 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => handleAction(action.action)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold",
                "shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
                action.color, action.shadow
              )}
            >
              <span className="whitespace-nowrap">{action.label}</span>
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <action.icon className="w-3.5 h-3.5" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setOpen(!open)}
          className="w-[60px] h-[60px] rounded-2xl bg-primary text-white shadow-xl shadow-primary/35 flex items-center justify-center hover:bg-primary/90 transition-all duration-200"
        >
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
