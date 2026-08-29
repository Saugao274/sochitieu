"use client";

import { useState } from "react";
import { Expense, CATEGORIES, CAT_COLOR, PAYERS, PAYER_COLOR, toDong } from "@/lib/types";
import FormattedInput from "./FormattedInput";

export default function AddSheet({
  onClose,
  onAdd,
  initial,
}: {
  onClose: () => void;
  onAdd: (d: {
    title: string;
    amount: number;
    payer: string;
    category: string;
    note: string;
  }) => Promise<void>;
  initial?: Expense;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [payer, setPayer] = useState<string>(initial?.payer || "Mẹ");
  const [category, setCategory] = useState<string>(initial?.category || "Chợ siêu thị");
  const [note, setNote] = useState(initial?.note || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const n = Number(amount);
  const valid = title.trim() !== "" && Number.isFinite(n) && n >= 0;

  async function submit() {
    if (!valid) {
      setErr("Cần điền nội dung và số tiền.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await onAdd({ title: title.trim(), amount: n, payer, category, note: note.trim() });
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Chưa lưu được. Thử lại.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-8"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--line)]" />
        <h2 className="text-[19px] font-extrabold">Ghi khoản chi</h2>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
          Chi cho việc gì
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiền điện, xăng xe, bình ga…"
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-[16px]"
        />

        <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
          Số tiền (nghìn đồng)
        </label>
        <FormattedInput
          value={amount}
          onChange={(val) => setAmount(val)}
          placeholder="1.260"
          className="num mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-[20px] font-semibold"
        />
        {amount !== "" && Number.isFinite(n) && (
          <p className="num mt-1 text-[13px] text-[var(--muted)]">= {toDong(n)}</p>
        )}

        <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
          Ai trả
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {PAYERS.map((p) => (
            <button
              key={p}
              onClick={() => setPayer(p)}
              className="rounded-full border px-3.5 py-2 text-[14px]"
              style={
                payer === p
                  ? { background: PAYER_COLOR[p], borderColor: PAYER_COLOR[p], color: "white" }
                  : { borderColor: "var(--line)" }
              }
            >
              {p}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
          Mục chi
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CATEGORIES.map((g) => (
            <button
              key={g}
              onClick={() => setCategory(g)}
              className="rounded-full border px-3 py-1.5 text-[13px]"
              style={
                category === g
                  ? { background: CAT_COLOR[g], borderColor: CAT_COLOR[g], color: "white" }
                  : { borderColor: "var(--line)" }
              }
            >
              {g}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--muted)]">
          Ghi chú (không bắt buộc)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-[16px]"
        />

        {err && <p className="mt-3 text-[14px] text-[var(--danger)]">{err}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--line)] py-3 text-[15px] font-semibold"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-[2] rounded-lg bg-[var(--action)] py-3 text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Đang lưu…" : "Lưu khoản chi"}
          </button>
        </div>
      </div>
    </div>
  );
}
