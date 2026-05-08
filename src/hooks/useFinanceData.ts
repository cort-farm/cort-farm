import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export interface Sale {
  id: string;
  productName: string;
  units: number;
  salePrice: number;
  sellingCost: number;
  costDescription: string;
  totalSale: number;
  netProfit: number;
  paymentMethod: "cash" | "debt";
  debtorName?: string;
  debtorPhone?: string;
  date: string;
  createdAt: Timestamp;
}

export interface Debt {
  id: string;
  creditorName: string;
  amount: number;
  paidAmount: number;
  status: "pending" | "partial" | "paid";
  date: string;
  notes: string;
  createdAt: Timestamp;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  amount: number;
  collectedAmount: number;
  remaining: number;
  date: string;
  notes: string;
  createdAt: Timestamp;
}

export interface Withdrawal {
  id: string;
  amount: number;
  reason: string;
  date: string;
  notes: string;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  type: "sale" | "debt_added" | "debt_paid" | "debtor_added" | "debtor_collected" | "withdrawal";
  amount: number;
  description: string;
  date: string;
  createdAt: Timestamp;
  relatedId?: string;
}

export function useFinanceData() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubs: (() => void)[] = [];

    const salesQ = query(collection(db, `users/${uid}/sales`), orderBy("createdAt", "desc"));
    unsubs.push(onSnapshot(salesQ, (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
    }));

    const debtsQ = query(collection(db, `users/${uid}/debts`), orderBy("createdAt", "desc"));
    unsubs.push(onSnapshot(debtsQ, (snap) => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Debt)));
    }));

    const debtorsQ = query(collection(db, `users/${uid}/debtors`), orderBy("createdAt", "desc"));
    unsubs.push(onSnapshot(debtorsQ, (snap) => {
      setDebtors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Debtor)));
    }));

    const withdrawalsQ = query(collection(db, `users/${uid}/withdrawals`), orderBy("createdAt", "desc"));
    unsubs.push(onSnapshot(withdrawalsQ, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal)));
    }));

    const txQ = query(collection(db, `users/${uid}/transactions`), orderBy("createdAt", "desc"));
    unsubs.push(onSnapshot(txQ, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      setLoading(false);
    }));

    return () => unsubs.forEach(u => u());
  }, [user]);

  const addTransaction = async (tx: Omit<Transaction, "id" | "createdAt">) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      ...tx,
      createdAt: Timestamp.now(),
    });
  };

  const addSale = async (data: Omit<Sale, "id" | "createdAt">) => {
    if (!user) return;
    const ref = await addDoc(collection(db, `users/${user.uid}/sales`), {
      ...data,
      createdAt: Timestamp.now(),
    });
    if (data.paymentMethod === "debt" && data.debtorName) {
      await addDoc(collection(db, `users/${user.uid}/debtors`), {
        name: data.debtorName,
        phone: data.debtorPhone || "",
        amount: data.totalSale,
        collectedAmount: 0,
        remaining: data.totalSale,
        date: data.date,
        notes: `من بيعة: ${data.productName}`,
        createdAt: Timestamp.now(),
      });
      await addTransaction({ type: "debtor_added", amount: data.totalSale, description: `مدين جديد: ${data.debtorName} - ${data.productName}`, date: data.date, relatedId: ref.id });
    } else {
      await addTransaction({ type: "sale", amount: data.totalSale, description: `بيعة: ${data.productName} (${data.units} وحدة)`, date: data.date, relatedId: ref.id });
    }
  };

  const addDebt = async (data: Omit<Debt, "id" | "createdAt" | "paidAmount" | "status">) => {
    if (!user) return;
    const ref = await addDoc(collection(db, `users/${user.uid}/debts`), {
      ...data,
      paidAmount: 0,
      status: "pending",
      createdAt: Timestamp.now(),
    });
    await addTransaction({ type: "debt_added", amount: data.amount, description: `دين جديد: ${data.creditorName}`, date: data.date, relatedId: ref.id });
  };

  const addDebtor = async (data: Omit<Debtor, "id" | "createdAt" | "collectedAmount" | "remaining">) => {
    if (!user) return;
    const ref = await addDoc(collection(db, `users/${user.uid}/debtors`), {
      ...data,
      collectedAmount: 0,
      remaining: data.amount,
      createdAt: Timestamp.now(),
    });
    await addTransaction({ type: "debtor_added", amount: data.amount, description: `مدين جديد: ${data.name}`, date: data.date, relatedId: ref.id });
  };

  const addWithdrawal = async (data: Omit<Withdrawal, "id" | "createdAt">) => {
    if (!user) return;
    const ref = await addDoc(collection(db, `users/${user.uid}/withdrawals`), {
      ...data,
      createdAt: Timestamp.now(),
    });
    await addTransaction({ type: "withdrawal", amount: data.amount, description: `سحب شخصي: ${data.reason}`, date: data.date, relatedId: ref.id });
  };

  const payDebt = async (debtId: string, amount: number, date: string) => {
    if (!user) return;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    const newPaid = debt.paidAmount + amount;
    const newStatus = newPaid >= debt.amount ? "paid" : "partial";
    await updateDoc(doc(db, `users/${user.uid}/debts/${debtId}`), {
      paidAmount: newPaid,
      status: newStatus,
    });
    await addTransaction({ type: "debt_paid", amount, description: `سداد دين: ${debt.creditorName}`, date, relatedId: debtId });
  };

  const collectDebtor = async (debtorId: string, amount: number, date: string) => {
    if (!user) return;
    const debtor = debtors.find(d => d.id === debtorId);
    if (!debtor) return;
    const newCollected = debtor.collectedAmount + amount;
    const newRemaining = Math.max(0, debtor.remaining - amount);
    await updateDoc(doc(db, `users/${user.uid}/debtors/${debtorId}`), {
      collectedAmount: newCollected,
      remaining: newRemaining,
    });
    await addTransaction({ type: "debtor_collected", amount, description: `تحصيل من: ${debtor.name}`, date, relatedId: debtorId });
  };

  const deleteDebt = async (debtId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/debts/${debtId}`));
  };

  const deleteDebtor = async (debtorId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/debtors/${debtorId}`));
  };

  const cashSalesTotal = sales.filter(s => s.paymentMethod === "cash").reduce((sum, s) => sum + s.totalSale, 0);
  const sellingCostsTotal = sales.reduce((sum, s) => sum + s.sellingCost, 0);
  const collectionsTotal = transactions.filter(t => t.type === "debtor_collected").reduce((sum, t) => sum + t.amount, 0);
  const debtPaymentsTotal = transactions.filter(t => t.type === "debt_paid").reduce((sum, t) => sum + t.amount, 0);
  const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const currentBudget = cashSalesTotal + collectionsTotal - debtPaymentsTotal - withdrawalsTotal - sellingCostsTotal;
  const totalDebtorsRemaining = debtors.reduce((sum, d) => sum + d.remaining, 0);
  const totalBudget = currentBudget + totalDebtorsRemaining;
  const totalDebts = debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  return {
    sales,
    debts,
    debtors,
    withdrawals,
    transactions,
    loading,
    currentBudget,
    totalBudget,
    totalDebts,
    totalDebtorsRemaining,
    sellingCostsTotal,
    withdrawalsTotal,
    addSale,
    addDebt,
    addDebtor,
    addWithdrawal,
    payDebt,
    collectDebtor,
    deleteDebt,
    deleteDebtor,
  };
}
