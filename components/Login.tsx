"use client";

import { useState } from "react";

export default function Login() {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: pass }),
    });
    if (r.ok) location.reload();
    else {
      setErr("Mật khẩu chưa đúng. Nhập lại giúp mình.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-[26px] font-extrabold leading-tight">
          Sổ chi tiêu gia đình
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          Nhập mật khẩu chung của nhà để vào.
        </p>

        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          className="mt-5 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-[16px]"
          placeholder="Mật khẩu"
          autoFocus
        />
        {err && <p className="mt-2 text-[14px] text-[var(--danger)]">{err}</p>}

        <button
          onClick={go}
          disabled={busy}
          className="mt-4 w-full rounded-lg bg-[var(--action)] py-3 text-[15px] font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Đang vào…" : "Vào sổ"}
        </button>
      </div>
    </main>
  );
}
