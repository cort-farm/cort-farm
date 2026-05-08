import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getTodayString } from "@/lib/utils";

const schema = z.object({
  amount: z.coerce.number().min(0.01, "يجب أن يكون المبلغ أكبر من صفر"),
  reason: z.string().min(1, "مطلوب"),
  date: z.string().min(1, "مطلوب"),
  notes: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

export default function AddWithdrawalForm({ onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, reason: "", date: getTodayString(), notes: "" },
  });

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ (ر.س)</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" data-testid="input-withdrawal-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-withdrawal-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="reason" render={({ field }) => (
          <FormItem>
            <FormLabel>سبب السحب</FormLabel>
            <FormControl><Input {...field} placeholder="مثال: مصاريف شخصية" data-testid="input-withdrawal-reason" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>ملاحظات</FormLabel>
            <FormControl><Textarea {...field} placeholder="ملاحظات إضافية..." rows={2} data-testid="input-withdrawal-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={loading} data-testid="button-submit-withdrawal">
            {loading ? "جاري الحفظ..." : "تسجيل السحب"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Form>
  );
}
