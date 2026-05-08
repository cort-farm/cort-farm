import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getTodayString, formatCurrency } from "@/lib/utils";
import { Debt } from "@/hooks/useFinanceData";

const schema = z.object({
  debtId: z.string().min(1, "اختر الدائن"),
  amount: z.coerce.number().min(0.01, "يجب أن يكون المبلغ أكبر من صفر"),
  date: z.string().min(1, "مطلوب"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  debts: Debt[];
  onSubmit: (debtId: string, amount: number, date: string) => Promise<void>;
  onClose: () => void;
}

export default function PayDebtForm({ debts, onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const activeDebts = debts.filter(d => d.status !== "paid");
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { debtId: "", amount: 0, date: getTodayString() },
  });

  const selectedDebtId = form.watch("debtId");
  const selectedDebt = activeDebts.find(d => d.id === selectedDebtId);
  const remaining = selectedDebt ? selectedDebt.amount - selectedDebt.paidAmount : 0;

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSubmit(data.debtId, data.amount, data.date);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="debtId" render={({ field }) => (
          <FormItem>
            <FormLabel>اختر الدائن</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-debt">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {activeDebts.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.creditorName} — متبقي {formatCurrency(d.amount - d.paidAmount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {selectedDebt && (
          <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
            <p className="text-muted-foreground">إجمالي الدين: <span className="font-medium text-foreground">{formatCurrency(selectedDebt.amount)}</span></p>
            <p className="text-muted-foreground">المدفوع: <span className="font-medium text-emerald-600">{formatCurrency(selectedDebt.paidAmount)}</span></p>
            <p className="text-muted-foreground">المتبقي: <span className="font-bold text-rose-600">{formatCurrency(remaining)}</span></p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ المدفوع (ر.س)</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" max={remaining || undefined} data-testid="input-pay-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-pay-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={loading || activeDebts.length === 0} data-testid="button-submit-pay-debt">
            {loading ? "جاري الحفظ..." : "تسجيل السداد"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Form>
  );
}
