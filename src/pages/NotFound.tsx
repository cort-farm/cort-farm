import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-4 p-8">
        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black text-foreground">404 — الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-sm">الصفحة التي تبحث عنها غير موجودة</p>
        <Link href="/">
          <Button className="mt-2 rounded-xl">العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
