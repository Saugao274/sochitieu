import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { expensesCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function guard() {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  return null;
}

function oid(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const no = await guard();
  if (no) return no;

  const { id } = await ctx.params;
  const _id = oid(id);
  if (!_id)
    return NextResponse.json({ error: "Mã khoản chi không đúng" }, { status: 400 });

  const b = await req.json();
  const set: Record<string, unknown> = {};
  for (const k of ["category", "title", "payer", "note"] as const)
    if (b[k] !== undefined) set[k] = String(b[k]);
  if (b.amount !== undefined) {
    const a = Number(b.amount);
    if (!Number.isFinite(a) || a < 0)
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    set.amount = a;
  }

  const col = await expensesCol();
  await col.updateOne({ _id }, { $set: set });
  const doc = await col.findOne({ _id });
  if (!doc)
    return NextResponse.json({ error: "Không tìm thấy khoản chi" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: String(doc._id) });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const no = await guard();
  if (no) return no;

  const { id } = await ctx.params;
  const _id = oid(id);
  if (!_id)
    return NextResponse.json({ error: "Mã khoản chi không đúng" }, { status: 400 });

  const col = await expensesCol();
  await col.deleteOne({ _id });
  return NextResponse.json({ ok: true });
}
