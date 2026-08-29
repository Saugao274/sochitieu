"use client";

import { useState } from "react";
import { Expense, PAYERS, PAYER_COLOR, CATEGORIES, CAT_COLOR, fmtK } from "@/lib/types";

export default function ExpenseRow({
  e,
  onChange,
  onDelete,
}: {
  e: Expense;
  onChange: (patch: Partial<Expense>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(e.amount));

  return (
    <li className="border-b border-[var(--line)] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="h-8 w-1 shrink-0 rounded-full"
          style={{ background: CAT_COLOR[e.category] || "#6B7A77" }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px]">{e.title}</span>
          <span className="block text-[12px] text-[var(--muted)]">
            {e.category} · {e.payer}
            {e.note ? ` · ${e.note}` : ""}
          </span>
        </span>
        <span className="num shrink-0 text-[15px] font-semibold">
          {fmtK(e.amount)}
        </span>
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--muted)]">
              Ai trả khoản này
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYERS.map((p) => (
                <button
                  key={p}
                  onClick={() => onChange({ payer: p })}
                  className="rounded-full border px-3 py-1.5 text-[13px] transition-colors"
                  style={
                    e.payer === p
                      ? {
                          background: PAYER_COLOR[p],
                          borderColor: PAYER_COLOR[p],
                          color: "white",
                        }
                      : { borderColor: "var(--line)" }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[var(--muted)]">
              Mục chi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((g) => (
                <button
                  key={g}
                  onClick={() => onChange({ category: g })}
                  className="rounded-full border px-2.5 py-1 text-[12px]"
                  style={
                    e.category === g
                      ? { background: CAT_COLOR[g], borderColor: CAT_COLOR[g], color: "white" }
                      : { borderColor: "var(--line)" }
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block text-[12px] font-semibold text-[var(--muted)]">
                Số tiền (nghìn)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(ev) => setAmount(ev.target.value)}
                onBlur={() => {
                  const n = Number(amount);
                  if (Number.isFinite(n) && n >= 0 && n !== e.amount)
                    onChange({ amount: n });
                }}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-[15px]"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[12px] font-semibold text-[var(--muted)]">
                Ghi chú
              </label>
              <input
                defaultValue={e.note}
                onBlur={(ev) => {
                  if (ev.target.value !== e.note)
                    onChange({ note: ev.target.value });
                }}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-[15px]"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm(`Xoá "${e.title}"?`)) onDelete();
            }}
            className="text-[13px] font-semibold text-[var(--danger)]"
          >
            Xoá khoản này
          </button>
        </div>
      )}
    </li>
  );
}
