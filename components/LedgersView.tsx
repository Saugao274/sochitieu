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
  addCash: (label: string, amount: number, type: string, payer: string) => Promise<void>;
  delCash: (id: string) => Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <CashLedger
        title="Tiền mặt"
        lines={cash.filter((c) => !c.type || c.type === "cash" || c.type.startsWith("tm_"))}
        onAdd={(l, a, p) => addCash(l, a, "cash", p)}
        onDelete={delCash}
      />
      <CashLedger
        title="Chuyển khoản"
        lines={cash.filter((c) => c.type === "ck" || c.type?.startsWith("ck_"))}
        onAdd={(l, a, p) => addCash(l, a, "ck", p)}
        onDelete={delCash}
      />
    </div>
  );
}
