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
  name: z.string().min(1, "مطلوب"),
  phone: z.string(),
  amount: z.coerce.number().min(0.01, "يجب أن يكون المبلغ أكبر من صفر"),
  date: z.string().min(1, "مطلوب"),
  notes: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

export default function AddDebtorForm({ onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", amount: 0, date: getTodayString(), notes: "" },
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
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المدين</FormLabel>
              <FormControl><Input {...field} placeholder="الاسم الكامل" data-testid="input-debtor-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl><Input {...field} placeholder="05xxxxxxxx" data-testid="input-debtor-phone" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ (ر.س)</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" data-testid="input-debtor-amount" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-debtor-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>ملاحظات</FormLabel>
            <FormControl><Textarea {...field} placeholder="ملاحظات إضافية..." rows={2} data-testid="input-debtor-notes" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={loading} data-testid="button-submit-debtor">
            {loading ? "جاري الحفظ..." : "إضافة المدين"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Form>
  );
}
