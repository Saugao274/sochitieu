"use client";

import { Expense, CashLine, sumBy } from "@/lib/types";
import CashLedger from "./CashLedger";

export default function LedgersView({
  items,
  cash,
  addCash,
  delCash,
}: {
  items: Expense[];
  cash: CashLine[];
  addCash: (label: string, amount: number, type: string) => Promise<void>;
  delCash: (id: string) => Promise<void>;
}) {
  const tmMeTotal = sumBy(items.filter(e => e.payer === "Mẹ" && e.method === "Tiền mặt"), e => e.amount);
  const tmBoTotal = sumBy(items.filter(e => e.payer === "Bố" && e.method === "Tiền mặt"), e => e.amount);
  const ckMeTotal = sumBy(items.filter(e => e.payer === "Mẹ" && (!e.method || e.method === "Chuyển khoản")), e => e.amount);
  const ckBoTotal = sumBy(items.filter(e => e.payer === "Bố" && (!e.method || e.method === "Chuyển khoản")), e => e.amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      <CashLedger
        title="Tiền mặt (Mẹ)"
        lines={cash.filter((c) => c.type === "tm_me" || c.type === "cash")}
        onAdd={(l, a) => addCash(l, a, "tm_me")}
        onDelete={delCash}
        linkedAmount={tmMeTotal}
      />
      <CashLedger
        title="Tiền mặt (Bố)"
        lines={cash.filter((c) => c.type === "tm_bo")}
        onAdd={(l, a) => addCash(l, a, "tm_bo")}
        onDelete={delCash}
        linkedAmount={tmBoTotal}
      />
      <CashLedger
        title="Chuyển khoản (Mẹ)"
        lines={cash.filter((c) => c.type === "ck_me")}
        onAdd={(l, a) => addCash(l, a, "ck_me")}
        onDelete={delCash}
        linkedAmount={ckMeTotal}
      />
      <CashLedger
        title="Chuyển khoản (Bố)"
        lines={cash.filter((c) => c.type === "ck_bo")}
        onAdd={(l, a) => addCash(l, a, "ck_bo")}
        onDelete={delCash}
        linkedAmount={ckBoTotal}
      />
    </div>
  );
}
