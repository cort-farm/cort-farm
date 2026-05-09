import { create } from "zustand";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TxMetadata, TxType } from "@/services/financeService";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  description: string;
  date: string;
  createdAt: Timestamp;
  relatedId?: string;
  metadata?: TxMetadata;
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

interface FinanceDerived {
  currentBudget: number;
  totalBudget: number;
  totalDebts: number;
  totalDebtorsRemaining: number;
  sellingCostsTotal: number;
  withdrawalsTotal: number;
}

interface FinanceStore {
  transactions: Transaction[];
  debts: Debt[];
  debtors: Debtor[];
  loading: boolean;
  derived: FinanceDerived;
  _unsubs: (() => void)[];
  subscribe: (uid: string) => void;
  unsubscribe: () => void;
}

function computeDerived(
  transactions: Transaction[],
  debtors: Debtor[]
): FinanceDerived {
  let cashSalesTotal = 0;
  let sellingCostsTotal = 0;
  let collectionsTotal = 0;
  let debtPaymentsTotal = 0;
  let withdrawalsTotal = 0;
  let debtAddedTotal = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "sale":
        cashSalesTotal += tx.amount;
        sellingCostsTotal += tx.metadata?.sellingCost ?? 0;
        break;
      case "debtor_collected":
        collectionsTotal += tx.amount;
        break;
      case "debt_paid":
        debtPaymentsTotal += tx.amount;
        break;
      case "withdrawal":
        withdrawalsTotal += tx.amount;
        break;
      case "debt_added":
        debtAddedTotal += tx.amount;
        break;
    }
  }

  const currentBudget =
    cashSalesTotal +
    collectionsTotal -
    debtPaymentsTotal -
    withdrawalsTotal -
    sellingCostsTotal;

  const totalDebtorsRemaining = debtors.reduce(
    (sum, d) => sum + d.remaining,
    0
  );
  const totalBudget = currentBudget + totalDebtorsRemaining;

  const totalDebts = debtAddedTotal - debtPaymentsTotal;

  return {
    currentBudget,
    totalBudget,
    totalDebts: Math.max(0, totalDebts),
    totalDebtorsRemaining,
    sellingCostsTotal,
    withdrawalsTotal,
  };
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  debts: [],
  debtors: [],
  loading: true,
  derived: {
    currentBudget: 0,
    totalBudget: 0,
    totalDebts: 0,
    totalDebtorsRemaining: 0,
    sellingCostsTotal: 0,
    withdrawalsTotal: 0,
  },
  _unsubs: [],

  subscribe: (uid: string) => {
    const prev = get()._unsubs;
    prev.forEach((u) => u());

    const unsubs: (() => void)[] = [];

    let txData: Transaction[] = [];
    let debtorData: Debtor[] = [];
    let debtData: Debt[] = [];
    let txLoaded = false;
    let debtorLoaded = false;
    let debtLoaded = false;

    const trySetLoaded = () => {
      if (txLoaded && debtorLoaded && debtLoaded) {
        set({ loading: false });
      }
    };

    const txQ = query(
      collection(db, `users/${uid}/transactions`),
      orderBy("createdAt", "desc")
    );
    unsubs.push(
      onSnapshot(txQ, (snap) => {
        txData = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Transaction)
        );
        txLoaded = true;
        set({
          transactions: txData,
          derived: computeDerived(txData, debtorData),
        });
        trySetLoaded();
      })
    );

    const debtQ = query(
      collection(db, `users/${uid}/debts`),
      orderBy("createdAt", "desc")
    );
    unsubs.push(
      onSnapshot(debtQ, (snap) => {
        debtData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Debt));
        debtLoaded = true;
        set({ debts: debtData });
        trySetLoaded();
      })
    );

    const debtorQ = query(
      collection(db, `users/${uid}/debtors`),
      orderBy("createdAt", "desc")
    );
    unsubs.push(
      onSnapshot(debtorQ, (snap) => {
        debtorData = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Debtor)
        );
        debtorLoaded = true;
        set({
          debtors: debtorData,
          derived: computeDerived(txData, debtorData),
        });
        trySetLoaded();
      })
    );

    set({ _unsubs: unsubs });
  },

  unsubscribe: () => {
    get()._unsubs.forEach((u) => u());
    set({
      _unsubs: [],
      transactions: [],
      debts: [],
      debtors: [],
      loading: true,
      derived: {
        currentBudget: 0,
        totalBudget: 0,
        totalDebts: 0,
        totalDebtorsRemaining: 0,
        sellingCostsTotal: 0,
        withdrawalsTotal: 0,
      },
    });
  },
}));
