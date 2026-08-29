import { NextRequest, NextResponse } from "next/server";
import { expensesCol } from "@/lib/db";
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
  if (!month)
    return NextResponse.json({ error: "Thiếu tháng" }, { status: 400 });

  const col = await expensesCol();
  const docs = await col.find({ month }).sort({ createdAt: 1 }).toArray();
  return NextResponse.json(
    docs.map((d) => ({ ...d, _id: String(d._id) }))
  );
}

export async function POST(req: NextRequest) {
  const no = await guard();
  if (no) return no;

  const b = await req.json();
  if (!b.month || !b.title?.trim())
    return NextResponse.json(
      { error: "Cần có tháng và nội dung khoản chi" },
      { status: 400 }
    );

  const amount = Number(b.amount);
  if (!Number.isFinite(amount) || amount < 0)
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });

  const doc = {
    month: String(b.month),
    category: String(b.category || "Chi khác"),
    title: String(b.title).trim(),
    amount,
    payer: String(b.payer || "Chưa rõ"),
    note: String(b.note || "").trim(),
    createdAt: new Date().toISOString(),
  };

  const col = await expensesCol();
  const r = await col.insertOne(doc);
  return NextResponse.json({ ...doc, _id: String(r.insertedId) }, { status: 201 });
}
