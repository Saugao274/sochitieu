"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Expense,
  CashLine,
} from "@/lib/types";
import SpreadsheetView from "./SpreadsheetView";
import SummaryView from "./SummaryView";
import AddSheet from "./AddSheet";
import LedgersView from "./LedgersView";

type Tab = "details" | "summary" | "ledgers";

const CASH_TITLE = "Chi tiền mặt";

export default function MonthView({ month }: { month: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Expense[] | null>(null);
  const [cash, setCash] = useState<CashLine[]>([]);
  const [tab, setTab] = useState<Tab>("details");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    const [re, rc] = await Promise.all([
      fetch(`/api/expenses?month=${month}`),
      fetch(`/api/cash?month=${month}`),
    ]);
    if (re.status === 401) {
      location.href = "/";
      return;
    }
    if (!re.ok) {
      setErr("Chưa tải được dữ liệu. Kiểm tra kết nối rồi thử lại.");
      setItems([]);
      return;
    }
    setItems(await re.json());
    setCash(rc.ok ? await rc.json() : []);
  }, [month]);

  const [history, setHistory] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { shiftMonth } = await import("@/lib/types");
      const months = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5));
      const out = await Promise.all(
        months.map(async (m) => {
          const r = await fetch(`/api/expenses?month=${m}`);
          if (!r.ok) return { month: m, total: 0 };
          const d: Expense[] = await r.json();
          // avoid importing sumBy here, just reduce
          return { month: m, total: d.reduce((acc, e) => acc + e.amount, 0) };
        })
      );
      setHistory(out);
    })();
  }, [month]);

  useEffect(() => {
    setItems(null);
    load();
  }, [load]);

  async function add(d: any) {
    const r = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, month }),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body?.error || "Chưa lưu được");
    setItems((v) => [...(v || []), body]);
  }

  async function patch(id: string, p: Partial<Expense>) {
    setItems((v) => v!.map((e) => (e._id === id ? { ...e, ...p } : e)));
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
  }

  async function remove(id: string) {
    setItems((v) => v!.filter((e) => e._id !== id));
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  }

  async function addCash(label: string, amount: number, type: string = "cash", payer: string) {
    const r = await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, label, amount, type, payer }),
    });
    if (r.ok) {
      const body = await r.json();
      setCash((v) => [...v, body.line]);
      if (body.expense) {
        setItems((v) => [...(v || []), body.expense]);
      }
    }
  }

  async function updateCash(id: string, label: string, amount: number, payer: string) {
    setCash((v) => v.map((l) => (l._id === id ? { ...l, label, amount, payer } : l)));
    await fetch(`/api/cash/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, amount, payer }),
    });
  }

  async function delCash(id: string) {
    setCash((v) => v.filter((l) => l._id !== id));
    await fetch(`/api/cash/${id}`, { method: "DELETE" });
  }

  async function handleImport() {
    if (!sheetUrl.trim()) return;
    if (!confirm(`Bạn có chắc muốn ghi đè dữ liệu tháng ${month} bằng dữ liệu từ Google Sheet này không?`)) return;
    
    setErr("");
    setItems(null); // show loading
    setImporting(false);
    
    const r = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: sheetUrl, month }),
    });
    const data = await r.json();
    if (!r.ok) {
      setErr(data.error || "Lỗi khi nhập dữ liệu");
      load(); // reload old data
    } else {
      alert(`Đã nhập thành công ${data.expenses} khoản chi và ${data.cash} khoản tiền mặt.`);
      load();
    }
    setSheetUrl("");
  }

  const cashExpense = items?.find((e) => e.title === CASH_TITLE) || null;

  const [editing, setEditing] = useState<Expense | null>(null);

  // ... (inside the component body)
  
  return (
    <main className="mx-auto min-h-dvh max-w-[1200px] pb-28">
      {/* ... header ... */}
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[17px] font-extrabold hidden sm:block">Tháng:</h1>
            <input 
              type="month" 
              value={month}
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/thang/${e.target.value}`);
                }
              }}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[16px] font-bold outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setImporting(true)}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-[14px] font-semibold"
            >
              ⬇ Nhập từ Google Sheet
            </button>
          </div>
        </div>

        <nav className="flex gap-1 px-4 pb-2 max-w-lg">
          {(
            [
              ["details", "Chi tiết"],
              ["summary", "Tổng hợp"],
              ["ledgers", "Sổ quỹ (Tiền mặt / CK)"],
            ] as const
          ).map(([k, t]) => (
            <button
              key={k}
              onClick={() => setTab(k as Tab)}
              className={`flex-1 rounded-lg py-2 text-[14px] font-semibold ${
                tab === k ? "bg-white shadow-sm border border-[var(--line)]" : "text-[var(--muted)]"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <div className="space-y-4 p-4">
        {err && (
          <p className="rounded-lg bg-white border border-[var(--danger)] p-4 text-[14px] text-[var(--danger)]">{err}</p>
        )}

        {importing && (
          <div className="rounded-xl bg-white p-4 border border-[var(--line)] shadow-sm">
            <h3 className="font-bold text-[15px] mb-2">Nhập dữ liệu từ Google Sheet</h3>
            <p className="text-[13px] text-[var(--muted)] mb-3">
              Dán link Google Sheet (đã share Anyone with the link) để thay thế dữ liệu tháng {month}.
            </p>
            <div className="flex gap-2">
              <input 
                autoFocus
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-[14px]"
              />
              <button onClick={handleImport} className="rounded-lg bg-[var(--action)] px-4 py-2 text-[14px] font-semibold text-white">
                Nhập
              </button>
              <button onClick={() => setImporting(false)} className="rounded-lg border border-[var(--line)] px-4 py-2 text-[14px] font-semibold">
                Huỷ
              </button>
            </div>
          </div>
        )}

        {items === null ? (
          <div className="rounded-xl bg-white p-6 text-center text-[15px] text-[var(--muted)]">
            Đang tải…
          </div>
        ) : tab === "details" ? (
          <SpreadsheetView
            month={month}
            items={items}
            remove={remove}
            setAdding={setAdding}
            setEditing={setEditing}
          />
        ) : tab === "summary" ? (
          <SummaryView items={items} history={history} />
        ) : (
          <LedgersView 
            items={items}
            cash={cash} 
            addCash={addCash} 
            updateCash={updateCash}
            delCash={delCash} 
          />
        )}
      </div>

      {adding && <AddSheet onClose={() => setAdding(false)} onAdd={add} />}
      {editing && (
        <AddSheet
          initial={editing}
          onClose={() => setEditing(null)}
          onAdd={async (d) => {
            await patch(editing._id, d);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}
