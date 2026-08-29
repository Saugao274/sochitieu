"use client";

import { useState } from "react";
import { CashLine, fmtK, toDong, sumBy } from "@/lib/types";
import FormattedInput from "./FormattedInput";

export default function CashLedger({
  title,
  lines,
  onAdd,
  onDelete,
  linkedAmount,
  onSync,
}: {
  title: string;
  lines: CashLine[];
  onAdd: (label: string, amount: number) => Promise<void>;
  onDelete: (id: string) => void;
  linkedAmount?: number | null;
  onSync?: (total: number) => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [out, setOut] = useState(false);   // true = tiền ra
  const [err, setErr] = useState("");

  const total = sumBy(lines, (l) => l.amount);
  let running = 0;

  async function add() {
    const n = Number(amount);
    if (!label.trim() || !Number.isFinite(n) || n === 0) {
      setErr("Cần điền nội dung và số tiền khác 0.");
      return;
    }
    setErr("");
    await onAdd(label.trim(), out ? -Math.abs(n) : Math.abs(n));
    setLabel("");
    setAmount("");
  }

  const lech = linkedAmount != null && linkedAmount !== total;

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 border border-[var(--line)] shadow-sm">
        <h2 className="text-[14px] font-bold uppercase text-[var(--muted)]">
          {title}
        </h2>
        <p className="num mt-1 text-[30px] font-extrabold leading-none">
          {fmtK(total)}
          <span className="ml-1.5 text-[15px] font-normal text-[var(--muted)]">
            nghìn
          </span>
        </p>
        <p className="num text-[13px] text-[var(--muted)]">{toDong(total)}</p>

        {lines.length > 0 && (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {lines.map((l) => {
              running += l.amount;
              const isOut = l.amount < 0;
              return (
                <li key={l._id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px]">{l.label}</span>
                    <span className="num block text-[11px] text-[var(--muted)]">
                      còn lại {fmtK(running)}
                    </span>
                  </span>
                  <span
                    className="num text-[14px] font-semibold"
                    style={{ color: isOut ? "var(--danger)" : "var(--action)" }}
                  >
                    {isOut ? "" : "+"}
                    {fmtK(l.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Xoá dòng "${l.label}"?`)) onDelete(l._id);
                    }}
                    className="px-1 text-[16px] leading-none text-[var(--muted)] hover:text-[var(--danger)]"
                    aria-label="Xoá dòng"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {lines.length === 0 && (
          <p className="mt-3 text-[14px] text-[var(--muted)]">
            Chưa có dòng nào.
          </p>
        )}
      </section>

      {linkedAmount != null && (
        <section
          className={`rounded-xl p-4 border border-[var(--line)] ${
            lech
              ? "bg-[color-mix(in_srgb,var(--danger)_10%,white)]"
              : "bg-[color-mix(in_srgb,var(--action)_10%,white)]"
          }`}
        >
          <p className="text-[14px] leading-snug">
            Tổng chi <strong>{title}</strong> trong tháng là{" "}
            <strong className="num">{fmtK(linkedAmount)}</strong>.{" "}
            {lech ? (
              <>
                Sổ quỹ tính ra thực chi <strong className="num">{fmtK(total)}</strong> — lệch{" "}
                <strong className="num text-[var(--danger)]">{fmtK(total - linkedAmount)}</strong>.
              </>
            ) : (
              <span className="text-[var(--action)] font-semibold">Khớp với sổ quỹ.</span>
            )}
          </p>
          {lech && onSync && (
            <button
              onClick={() => onSync(total)}
              className="mt-3 w-full rounded-lg bg-[var(--action)] px-4 py-2 text-[14px] font-semibold text-white"
            >
              Cập nhật khoản chi thành {fmtK(total)}
            </button>
          )}
        </section>
      )}

      <section className="rounded-xl bg-[var(--paper)] border border-[var(--line)] p-4 shadow-sm">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          Thêm dòng vào {title}
        </h3>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="dư tháng trước, lĩnh, ck..."
          className="mt-2.5 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-[15px]"
        />

        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => setOut(false)}
            className={`flex-1 rounded-lg border py-2 text-[14px] font-semibold ${
              !out
                ? "border-[var(--action)] bg-[var(--action)] text-white"
                : "border-[var(--line)] bg-white"
            }`}
          >
            Tiền vào (+)
          </button>
          <button
            onClick={() => setOut(true)}
            className={`flex-1 rounded-lg border py-2 text-[14px] font-semibold ${
              out
                ? "border-[var(--danger)] bg-[var(--danger)] text-white"
                : "border-[var(--line)] bg-white"
            }`}
          >
            Tiền ra (-)
          </button>
        </div>

        <FormattedInput
          value={amount}
          onChange={(val) => setAmount(val)}
          placeholder="Số tiền (nghìn)"
          className="num mt-2.5 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-[16px] font-semibold"
        />

        {err && <p className="mt-2 text-[14px] text-[var(--danger)]">{err}</p>}

        <button
          onClick={add}
          className="mt-3 w-full rounded-lg bg-[var(--ink)] py-3 text-[15px] font-semibold text-white"
        >
          Thêm vào sổ quỹ
        </button>
      </section>
    </div>
  );
}
