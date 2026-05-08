import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getTodayString } from "@/lib/utils";

const schema = z.object({
  productName: z.string().min(1, "مطلوب"),
  units: z.coerce.number().min(1, "مطلوب"),
  salePrice: z.coerce.number().min(0, "مطلوب"),
  sellingCost: z.coerce.number().min(0),
  costDescription: z.string(),
  date: z.string().min(1, "مطلوب"),
  paymentMethod: z.enum(["cash", "debt"]),
  debtorName: z.string().optional(),
  debtorPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData & { totalSale: number; netProfit: number }) => Promise<void>;
  onClose: () => void;
}

export default function AddSaleForm({ onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productName: "", units: 1, salePrice: 0, sellingCost: 0, costDescription: "", date: getTodayString(), paymentMethod: "cash", debtorName: "", debtorPhone: "" },
  });

  const paymentMethod = form.watch("paymentMethod");
  const units = form.watch("units") || 0;
  const salePrice = form.watch("salePrice") || 0;
  const sellingCost = form.watch("sellingCost") || 0;
  const totalSale = units * salePrice;
  const netProfit = totalSale - sellingCost;

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSubmit({ ...data, totalSale, netProfit });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="productName" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>اسم المنتج</FormLabel>
              <FormControl><Input {...field} placeholder="اسم المنتج" data-testid="input-product-name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="units" render={({ field }) => (
            <FormItem>
              <FormLabel>الكمية</FormLabel>
              <FormControl><Input {...field} type="number" min="1" data-testid="input-units" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="salePrice" render={({ field }) => (
            <FormItem>
              <FormLabel>سعر البيع</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" data-testid="input-sale-price" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sellingCost" render={({ field }) => (
            <FormItem>
              <FormLabel>تكلفة البيع</FormLabel>
              <FormControl><Input {...field} type="number" min="0" step="0.01" data-testid="input-selling-cost" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="costDescription" render={({ field }) => (
            <FormItem>
              <FormLabel>وصف التكلفة</FormLabel>
              <FormControl><Input {...field} placeholder="مثال: شحن" data-testid="input-cost-description" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {totalSale > 0 && (
          <div className="bg-muted rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">إجمالي البيع</p>
              <p className="font-bold text-foreground" dir="ltr">{totalSale.toFixed(2)} ر.س</p>
            </div>
            <div>
              <p className="text-muted-foreground">صافي الربح</p>
              <p className={`font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`} dir="ltr">{netProfit.toFixed(2)} ر.س</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl><Input {...field} type="date" data-testid="input-date" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="paymentMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>طريقة الدفع</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">كاش</SelectItem>
                  <SelectItem value="debt">دين</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {paymentMethod === "debt" && (
          <div className="grid grid-cols-2 gap-3 border border-border rounded-xl p-3">
            <p className="col-span-2 text-sm font-medium text-muted-foreground">بيانات المدين</p>
            <FormField control={form.control} name="debtorName" render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المدين</FormLabel>
                <FormControl><Input {...field} placeholder="الاسم" data-testid="input-debtor-name" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="debtorPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl><Input {...field} placeholder="05xxxxxxxx" data-testid="input-debtor-phone" /></FormControl>
              </FormItem>
            )} />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1" disabled={loading} data-testid="button-submit-sale">
            {loading ? "جاري الحفظ..." : "حفظ العملية"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Form>
  );
}
