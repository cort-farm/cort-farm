import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TxType =
  | "sale"
  | "debt_added"
  | "debt_paid"
  | "debtor_added"
  | "debtor_collected"
  | "withdrawal"
  | "loan_given";

export interface TxMetadata {
  sellingCost?: number;
  paymentMethod?: "cash" | "debt";
  costDescription?: string;
  productName?: string;
  units?: number;
  salePrice?: number;
  netProfit?: number;
  creditorName?: string;
  debtorName?: string;
  debtorPhone?: string;
  phone?: string;
  notes?: string;
  reason?: string;
}

export interface AddSaleInput {
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
}

export interface AddDebtInput {
  creditorName: string;
  amount: number;
  date: string;
  notes: string;
}

export interface AddDebtorInput {
  name: string;
  phone: string;
  amount: number;
  date: string;
  notes: string;
}

export interface AddWithdrawalInput {
  amount: number;
  reason: string;
  date: string;
  notes: string;
}

function txCol(uid: string, sub: string) {
  return collection(db, `users/${uid}/${sub}`);
}

async function addTx(uid: string, tx: {
  type: TxType;
  amount: number;
  description: string;
  date: string;
  relatedId?: string;
  metadata?: TxMetadata;
}) {
  await addDoc(txCol(uid, "transactions"), { ...tx, createdAt: Timestamp.now() });
}

export async function addSale(uid: string, data: AddSaleInput) {
  if (data.paymentMethod === "debt" && data.debtorName) {
    const debtorRef = await addDoc(txCol(uid, "debtors"), {
      name: data.debtorName,
      phone: data.debtorPhone || "",
      amount: data.totalSale,
      collectedAmount: 0,
      remaining: data.totalSale,
      date: data.date,
      notes: `من بيعة: ${data.productName}`,
      createdAt: Timestamp.now(),
    });
    await addTx(uid, {
      type: "debtor_added",
      amount: data.totalSale,
      description: `مدين جديد: ${data.debtorName} - ${data.productName}`,
      date: data.date,
      relatedId: debtorRef.id,
      metadata: {
        sellingCost: data.sellingCost,
        paymentMethod: "debt",
        productName: data.productName,
        units: data.units,
        salePrice: data.salePrice,
        netProfit: data.netProfit,
        costDescription: data.costDescription,
        debtorName: data.debtorName,
        debtorPhone: data.debtorPhone,
      },
    });
  } else {
    const saleRef = await addDoc(txCol(uid, "sales"), {
      ...data,
      createdAt: Timestamp.now(),
    });
    await addTx(uid, {
      type: "sale",
      amount: data.totalSale,
      description: `بيعة: ${data.productName} (${data.units} وحدة)`,
      date: data.date,
      relatedId: saleRef.id,
      metadata: {
        sellingCost: data.sellingCost,
        paymentMethod: "cash",
        productName: data.productName,
        units: data.units,
        salePrice: data.salePrice,
        netProfit: data.netProfit,
        costDescription: data.costDescription,
      },
    });
  }
}

export async function addDebt(uid: string, data: AddDebtInput) {
  const debtRef = await addDoc(txCol(uid, "debts"), {
    ...data,
    paidAmount: 0,
    status: "pending",
    createdAt: Timestamp.now(),
  });
  await addTx(uid, {
    type: "debt_added",
    amount: data.amount,
    description: `دين جديد: ${data.creditorName}`,
    date: data.date,
    relatedId: debtRef.id,
    metadata: { creditorName: data.creditorName, notes: data.notes },
  });
}

export async function addDebtor(uid: string, data: AddDebtorInput) {
  const debtorRef = await addDoc(txCol(uid, "debtors"), {
    ...data,
    collectedAmount: 0,
    remaining: data.amount,
    createdAt: Timestamp.now(),
  });
  await addTx(uid, {
    type: "debtor_added",
    amount: data.amount,
    description: `مدين جديد: ${data.name}`,
    date: data.date,
    relatedId: debtorRef.id,
    metadata: { debtorName: data.name, phone: data.phone, notes: data.notes },
  });
}

export async function giveLoan(uid: string, data: AddDebtorInput) {
  const debtorRef = await addDoc(txCol(uid, "debtors"), {
    name: data.name,
    phone: data.phone,
    amount: data.amount,
    collectedAmount: 0,
    remaining: data.amount,
    date: data.date,
    notes: data.notes,
    createdAt: Timestamp.now(),
  });
  await addTx(uid, {
    type: "loan_given",
    amount: data.amount,
    description: `قرض لـ: ${data.name}`,
    date: data.date,
    relatedId: debtorRef.id,
    metadata: { debtorName: data.name, phone: data.phone, notes: data.notes },
  });
}

export async function addWithdrawal(uid: string, data: AddWithdrawalInput) {
  const wRef = await addDoc(txCol(uid, "withdrawals"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  await addTx(uid, {
    type: "withdrawal",
    amount: data.amount,
    description: `سحب شخصي: ${data.reason}`,
    date: data.date,
    relatedId: wRef.id,
    metadata: { reason: data.reason, notes: data.notes },
  });
}

export async function payDebt(
  uid: string,
  debtId: string,
  creditorName: string,
  currentPaid: number,
  totalAmount: number,
  amount: number,
  date: string
) {
  const newPaid = currentPaid + amount;
  const newStatus = newPaid >= totalAmount ? "paid" : "partial";
  await updateDoc(doc(db, `users/${uid}/debts/${debtId}`), {
    paidAmount: newPaid,
    status: newStatus,
  });
  await addTx(uid, {
    type: "debt_paid",
    amount,
    description: `سداد دين: ${creditorName}`,
    date,
    relatedId: debtId,
    metadata: { creditorName },
  });
}

export async function collectDebtor(
  uid: string,
  debtorId: string,
  debtorName: string,
  currentCollected: number,
  currentRemaining: number,
  amount: number,
  date: string
) {
  const newCollected = currentCollected + amount;
  const newRemaining = Math.max(0, currentRemaining - amount);
  await updateDoc(doc(db, `users/${uid}/debtors/${debtorId}`), {
    collectedAmount: newCollected,
    remaining: newRemaining,
  });
  await addTx(uid, {
    type: "debtor_collected",
    amount,
    description: `تحصيل من: ${debtorName}`,
    date,
    relatedId: debtorId,
    metadata: { debtorName },
  });
}

export async function deleteDebtById(uid: string, debtId: string) {
  await deleteDoc(doc(db, `users/${uid}/debts/${debtId}`));
}

export async function deleteDebtorById(uid: string, debtorId: string) {
  await deleteDoc(doc(db, `users/${uid}/debtors/${debtorId}`));
}
