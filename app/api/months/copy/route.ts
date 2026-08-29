import { NextRequest, NextResponse } from "next/server";
import { expensesCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Chép các khoản của tháng trước sang tháng này, ĐỂ TRỐNG SỐ TIỀN.
 * Điện, nước, rác, bình ga... tháng nào cũng có, chỉ khác con số.
 */
export async function POST(req: NextRequest) {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { from, to } = await req.json();
  if (!from || !to)
    return NextResponse.json({ error: "Thiếu tháng nguồn hoặc tháng đích" }, { status: 400 });

  const col = await expensesCol();

  const existing = await col.countDocuments({ month: to });
  if (existing > 0)
    return NextResponse.json(
      { error: `${to} đã có ${existing} khoản. Xoá hết rồi chép lại nếu cần.` },
      { status: 409 }
    );

  const src = await col.find({ month: from }).toArray();
  if (src.length === 0)
    return NextResponse.json({ error: `${from} chưa có khoản nào` }, { status: 404 });

  const docs = src.map((d) => ({
    month: to,
    category: d.category,
    title: d.title,
    amount: 0,
    payer: d.payer,
    note: "",
    createdAt: new Date().toISOString(),
  }));
  await col.insertMany(docs);
  return NextResponse.json({ inserted: docs.length });
}
