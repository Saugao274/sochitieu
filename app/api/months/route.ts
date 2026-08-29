import { NextResponse } from "next/server";
import { expensesCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isLoggedIn()))
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const col = await expensesCol();
  const months = await col.distinct("month");
  return NextResponse.json(months.sort().reverse());
}
