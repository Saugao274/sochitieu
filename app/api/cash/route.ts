import { NextRequest, NextResponse } from "next/server";
import { cashCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function guard() {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const no = await guard();
  if (no) return no;
  const month = req.nextUrl.searchParams.get("month");
  if (!month) return NextResponse.json({ error: "Thiếu tháng" }, { status: 400 });

  const col = await cashCol();
  const docs = await col.find({ month }).sort({ createdAt: 1 }).toArray();
  return NextResponse.json(docs.map((d) => ({ ...d, _id: String(d._id) })));
}

export async function POST(req: NextRequest) {
  const no = await guard();
  if (no) return no;

  const b = await req.json();
  if (!b.month || !b.label?.trim())
    return NextResponse.json({ error: "Cần có tháng và nội dung" }, { status: 400 });

  const amount = Number(b.amount);
  if (!Number.isFinite(amount))
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });

  const doc = {
    month: String(b.month),
    label: String(b.label).trim(),
    amount,                       // âm = tiền ra
    type: b.type || "cash",
    payer: b.payer || "Chưa rõ",
    createdAt: new Date().toISOString(),
  };
  const col = await cashCol();
  const r = await col.insertOne(doc);
  const line = { ...doc, _id: String(r.insertedId) };

  let expense = null;
  if (amount < 0) {
    const { expensesCol } = await import("@/lib/db");
    const ecol = await expensesCol();
    const edoc = {
      month: String(b.month),
      category: "Chi khác", // Mặc định là chi khác
      title: b.type === "cash" ? "Chi tiền mặt" : String(b.label).trim(), // Nếu là tiền mặt thì tên là "Chi tiền mặt" để khớp với logic cũ
      amount: Math.abs(amount),
      payer: String(b.payer || "Chưa rõ"),
      note: `Tự động tạo từ Sổ quỹ: ${String(b.label).trim()}`,
      createdAt: new Date().toISOString(),
    };
    const er = await ecol.insertOne(edoc);
    expense = { ...edoc, _id: String(er.insertedId) };
  }

  return NextResponse.json({ line, expense }, { status: 201 });
}
