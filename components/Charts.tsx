"use client";

import { useMemo, useState } from "react";
import { Expense, CAT_COLOR, PAYER_COLOR, fmtK, sumBy, toDong } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export function PieChartDash({
  items,
}: {
  items: Expense[];
}) {
  const [mode, setMode] = useState<"cat" | "payer">("cat");
  const total = sumBy(items, (e) => e.amount);

  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of items) m.set(e.category, (m.get(e.category) || 0) + e.amount);
    return [...m.entries()]
      .map(([name, value]) => ({ name, value, color: CAT_COLOR[name] || "#6B7A77" }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const byPayer = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of items) m.set(e.payer, (m.get(e.payer) || 0) + e.amount);
    return [...m.entries()]
      .map(([name, value]) => ({ name, value, color: PAYER_COLOR[name] || "#6B7A77" }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const parts = mode === "cat" ? byCat : byPayer;

  if (total === 0)
    return (
      <p className="rounded-xl bg-white p-6 text-center text-[15px] text-[var(--muted)] border border-[var(--line)] shadow-sm">
        Chưa có khoản nào để vẽ biểu đồ.
      </p>
    );

  return (
    <div className="w-full rounded-xl bg-white border border-[var(--line)] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[var(--paper)] px-4 py-3 border-b border-[var(--line)]">
        <h2 className="text-[14px] font-bold uppercase text-center">Dashboard (Biểu đồ)</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="flex gap-1.5 justify-center">
          {(
            [
              ["cat", "Theo mục chi"],
              ["payer", "Theo người trả"],
            ] as const
          ).map(([k, t]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                mode === k
                  ? "bg-[var(--ink)] text-white"
                  : "border border-[var(--line)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center relative">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={parts}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {parts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => [`${fmtK(Number(value) || 0)} nghìn`, "Số tiền"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
            <span className="text-[22px] font-extrabold text-[var(--ink)]">{fmtK(total)}</span>
            <span className="text-[11px] text-[var(--muted)]">nghìn đồng</span>
          </div>
        </div>

        <ul className="mt-4 space-y-2 max-w-sm mx-auto">
          {parts.map((p) => {
            const pct = (p.value / total) * 100;
            return (
              <li key={p.name}>
                <div className="flex items-center gap-2 text-[14px]">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ background: p.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="num font-semibold">{fmtK(p.value)}</span>
                  <span className="num w-11 text-right text-[13px] text-[var(--muted)]">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--paper)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${pct}%`, background: p.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function BarChartDash({
  history,
}: {
  history: { month: string; total: number }[];
}) {
  if (history.length <= 1) return null;

  const chartHistory = history.map((h) => ({
    name: "T" + h.month.split("-")[1],
    total: h.total,
    label: fmtK(Math.round(h.total / 1000)) + "tr",
  }));

  return (
    <div className="w-full rounded-xl bg-white border border-[var(--line)] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[var(--paper)] px-4 py-3 border-b border-[var(--line)]">
        <h2 className="text-[14px] font-bold uppercase text-center">So với các tháng trước</h2>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="h-[250px] w-full text-[12px] font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartHistory} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(val) => fmtK(Math.round(val / 1000)) + "tr"} tickLine={false} axisLine={false} />
              <RechartsTooltip
                cursor={{ fill: 'transparent' }}
                formatter={(value: any) => [`${fmtK(Number(value) || 0)} nghìn`, "Tổng chi"]}
              />
              <Bar dataKey="total" fill="var(--action)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
