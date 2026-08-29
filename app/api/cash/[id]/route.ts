import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cashCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await ctx.params;
  let _id: ObjectId;
  try {
    _id = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Mã dòng không đúng" }, { status: 400 });
  }
  const col = await cashCol();
  await col.deleteOne({ _id });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await ctx.params;
  let _id: ObjectId;
  try {
    _id = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Mã dòng không đúng" }, { status: 400 });
  }

  const b = await req.json();
  const update: any = {};
  if (b.label !== undefined) update.label = String(b.label).trim();
  if (b.amount !== undefined) update.amount = Number(b.amount);
  if (b.payer !== undefined) update.payer = String(b.payer);

  const col = await cashCol();
  await col.updateOne({ _id }, { $set: update });
  return NextResponse.json({ ok: true });
}
