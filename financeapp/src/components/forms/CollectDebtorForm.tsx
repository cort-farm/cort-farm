import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getTodayString, formatCurrency } from "@/lib/utils";
import { Debtor } from "@/hooks/useFinanceData";

const schema = z.object({
  debtorId: z.string().min(1, "اختر المدين"),
  amount: z.coerce.number().min(0.01, "يجب أن يكون المبلغ أكبر من صفر"),
  date: z.string().min(1, "مطلوب"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  debtors: Debtor[];
  onSubmit: (debtorId: string, amount: number, date: string) => Promise<void>;
  onClose: () => void;
}

export default function CollectDebtorForm({ debtors, onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const activeDebtors = debtors.filter(d => d.remaining > 0);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { debtorId: "", amount: 0, date: getTodayString() },
  });

  const selectedDebtorId = form.watch("debtorId");
  const selectedDebtor = activeDebtors.find(d => d.id === selectedDebtorId);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSubmit(data.debtorId, data.amount, data.date);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="debtorId" render={({ field }) => (
          <FormItem>
            <FormLabel>اختر المدين</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-debtor">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {activeDebtors.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — متبقي {formatCurrency(d.remaining)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {selectedDebtor && (
          <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
            <p className="text-muted-foreground">إجمالي الدين: <span className="font-medium text-foreground">{formatCurrency(selectedDebtor.amount)}</span></p>
            <p className="text-muted-foreground">المحصّل: <span className="font-medium text-emerald-600">{formatCurrency(selectedDebtor.collectedAmount)}</span></p>
            <p className="text-muted-foreground">المتبقي: <span className="font-bold text-rose-600">{formatCurrency(selectedDebtor.remaining)}</span></p>
            {selectedDebtor.phone && <p className="text-muted-foreground">الهاتف: <span className="font-medium">{selectedDebtor.phone}</span></p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ المستلم (ر.س)</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" data-testid="input-collect-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-collect-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={loading || activeDebtors.length === 0} data-testid="button-submit-collect">
            {loading ? "جاري الحفظ..." : "تسجيل التحصيل"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Form>
  );
}
