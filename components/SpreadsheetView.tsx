"use client";

import { Expense, CAT_COLOR, fmtK } from "@/lib/types";

export default function SpreadsheetView({
  month,
  items,
  remove,
  setAdding,
  setEditing,
}: {
  month: string;
  items: Expense[];
  remove: (id: string) => Promise<void>;
  setAdding: (b: boolean) => void;
  setEditing: (e: Expense) => void;
}) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl bg-white border border-[var(--line)] shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-[var(--line)]">
          <h2 className="text-[15px] font-bold uppercase">Các khoản chi {month}</h2>
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-[var(--action)] px-4 py-1.5 text-[14px] font-semibold text-white"
          >
            + Thêm khoản chi
          </button>
        </div>
        <table className="w-full text-left text-[14px] whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--paper)] text-[var(--muted)]">
              <th className="px-4 py-3 font-semibold">Nhóm</th>
              <th className="px-4 py-3 font-semibold">Nội dung</th>
              <th className="px-4 py-3 font-semibold text-right">Số tiền</th>
              <th className="px-4 py-3 font-semibold text-center">Người chi</th>
              <th className="px-4 py-3 font-semibold">Ghi chú gốc</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {items.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ background: CAT_COLOR[e.category] || "#6B7A77" }}
                    />
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-2.5">{e.title}</td>
                <td className="px-4 py-2.5 text-right font-semibold num">{fmtK(e.amount)}</td>
                <td className="px-4 py-2.5 text-center">{e.payer}</td>
                <td className="px-4 py-2.5 text-[var(--muted)]">{e.note}</td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => setEditing(e)}
                    className="text-[var(--action)] hover:underline mr-4 font-semibold"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xoá khoản "${e.title}"?`)) remove(e._id);
                    }}
                    className="text-[var(--danger)] hover:underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                  Chưa có khoản chi nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
