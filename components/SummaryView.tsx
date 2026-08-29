"use client";

import { Expense, fmtK, sumBy, PAYERS, CATEGORIES } from "@/lib/types";
import { useMemo } from "react";
import { PieChartDash, BarChartDash } from "./Charts";

export default function SummaryView({
  items,
  history,
}: {
  items: Expense[];
  history: { month: string; total: number }[];
}) {
  const total = sumBy(items, (e) => e.amount);

  const byPayer = useMemo(() => {
    const stats: Record<string, { amount: number; count: number }> = {};
    for (const p of PAYERS) stats[p] = { amount: 0, count: 0 };
    for (const e of items) {
      if (!stats[e.payer]) stats[e.payer] = { amount: 0, count: 0 };
      stats[e.payer].amount += e.amount;
      stats[e.payer].count += 1;
    }
    return stats;
  }, [items]);

  const byCat = useMemo(() => {
    const stats: Record<string, { total: number; [payer: string]: number }> = {};
    for (const c of CATEGORIES) stats[c] = { total: 0 };
    for (const e of items) {
      if (!stats[e.category]) stats[e.category] = { total: 0 };
      stats[e.category].total += e.amount;
      stats[e.category][e.payer] = (stats[e.category][e.payer] || 0) + e.amount;
    }
    return Object.entries(stats)
      .filter(([_, s]) => s.total > 0)
      .sort((a, b) => b[1].total - a[1].total);
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      {/* Hàng 1: Dashboard Pie chart bên trái, Bar chart bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PieChartDash items={items} />
        {history.length > 1 ? (
          <BarChartDash history={history} />
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>

      {/* Hàng 2: Ai chi bao nhiêu bên trái, Theo nhóm bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Bảng 1: Ai chi bao nhiêu */}
        <div className="w-full rounded-xl bg-white border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="bg-[var(--paper)] px-4 py-3 border-b border-[var(--line)]">
            <h2 className="text-[14px] font-bold uppercase text-center">Ai chi bao nhiêu</h2>
          </div>
          <table className="w-full text-center text-[14px]">
            <thead>
              <tr className="bg-[#B4C6E7] text-black">
                <th className="px-4 py-2 border-r border-white">Người chi</th>
                <th className="px-4 py-2 border-r border-white">Số tiền</th>
                <th className="px-4 py-2 border-r border-white">Tỷ lệ</th>
                <th className="px-4 py-2">Số khoản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {PAYERS.map((p) => {
                const amount = byPayer[p]?.amount || 0;
                const pct = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <tr key={p}>
                    <td className="px-4 py-2 font-semibold border-r border-[var(--line)] text-left">{p}</td>
                    <td className="px-4 py-2 num border-r border-[var(--line)]">{fmtK(amount)}</td>
                    <td className="px-4 py-2 num border-r border-[var(--line)]">{pct.toFixed(1)}%</td>
                    <td className="px-4 py-2 num">{byPayer[p]?.count || 0}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#E2EFDA] font-bold">
              <tr>
                <td className="px-4 py-2 border-r border-white text-left">TỔNG</td>
                <td className="px-4 py-2 num border-r border-white">{fmtK(total)}</td>
                <td className="px-4 py-2 num border-r border-white">100.0%</td>
                <td className="px-4 py-2 num">{items.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bảng 2: Theo nhóm */}
        <div className="w-full rounded-xl bg-white border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="bg-[var(--paper)] px-4 py-3 border-b border-[var(--line)]">
            <h2 className="text-[14px] font-bold uppercase text-center">Theo nhóm</h2>
          </div>
          <table className="w-full text-center text-[14px]">
            <thead>
              <tr className="bg-[#B4C6E7] text-black">
                <th className="px-4 py-2 border-r border-white">Nhóm</th>
                <th className="px-4 py-2 border-r border-white">Tổng</th>
                {PAYERS.map((p) => (
                  <th key={p} className="px-4 py-2 border-r border-white last:border-r-0">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {byCat.map(([cat, s]) => (
                <tr key={cat}>
                  <td className="px-4 py-2 font-semibold border-r border-[var(--line)] text-left">{cat}</td>
                  <td className="px-4 py-2 num font-semibold border-r border-[var(--line)]">{fmtK(s.total)}</td>
                  {PAYERS.map((p) => (
                    <td key={p} className="px-4 py-2 num border-r border-[var(--line)] last:border-r-0">
                      {s[p] ? fmtK(s[p]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
