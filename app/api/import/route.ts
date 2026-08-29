import { expensesCol, cashCol } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";
import { parse } from "csv-parse/sync";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { url, month } = await req.json();

    // Extract ID
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Link không đúng định dạng Google Sheet (thiếu ID)." },
        { status: 400 }
      );
    }
    const id = match[1];

    const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
    const res = await fetch(csvUrl);
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            "Không tải được file (có thể file chưa được cấp quyền Share 'Anyone with the link').",
        },
        { status: 400 }
      );
    }

    const text = await res.text();
    const records = parse(text, { skip_empty_lines: false });

    const expenses = [];
    const cashLines = [];

    // Tìm dòng bắt đầu (dòng có header "Nhóm", "Nội dung", "Số tiền")
    let startIndex = 4; // mặc định dòng 5 (index 4)
    for (let i = 0; i < Math.min(10, records.length); i++) {
      if (records[i][0] === "Nhóm" && records[i][1] === "Nội dung") {
        startIndex = i + 1;
        break;
      }
    }

    for (let i = startIndex; i < records.length; i++) {
      const row = records[i];
      if (
        row.length === 0 ||
        (row[0] && row[0].toUpperCase() === "TỔNG CỘNG") ||
        (row[1] && row[1].toUpperCase() === "TỔNG CỘNG")
      ) {
        // Dừng khi gặp dòng tổng cộng
        if (row[0] && row[0].toUpperCase() === "TỔNG CỘNG" || (row[1] && row[1].toUpperCase() === "TỔNG CỘNG")) {
             break;
        }
        if (row.every((c: string) => !c.trim())) continue; // Dòng trống hoàn toàn
      }

      // Parse Expense
      // Cột 0: Nhóm, Cột 1: Nội dung, Cột 2: Số tiền, Cột 3: Người chi, Cột 4: Ghi chú
      if (row[0]?.trim() && row[1]?.trim() && row[2]?.trim()) {
        const amountStr = row[2].replace(/,/g, "");
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
          expenses.push({
            month,
            category: row[0].trim(),
            title: row[1].trim(),
            amount: amount,
            payer: row[3]?.trim() || "Mẹ",
            note: row[4]?.trim() || "",
            createdAt: Date.now() + i,
          });
        }
      }

      // Parse Cash
      // Cột 7: Số tiền, Cột 8: Người chi (thực ra là nội dung/label), Cột 9: Ghi chú
      if (row.length > 8 && row[7]?.trim() && row[8]?.trim()) {
        const amountStr = row[7].replace(/,/g, "");
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
          cashLines.push({
            month,
            amount: amount,
            label: row[8].trim() + (row[9]?.trim() ? ` (${row[9].trim()})` : ""),
            createdAt: Date.now() + i,
          });
        }
      }
    }

    const ec = await expensesCol();
    const cc = await cashCol();

    // Xoá dữ liệu cũ của tháng
    await ec.deleteMany({ month });
    await cc.deleteMany({ month });

    // Thêm dữ liệu mới
    if (expenses.length > 0) {
      await ec.insertMany(expenses);
    }
    if (cashLines.length > 0) {
      await cc.insertMany(cashLines);
    }

    return NextResponse.json({
      success: true,
      expenses: expenses.length,
      cash: cashLines.length,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi phân tích file: " + e.message },
      { status: 500 }
    );
  }
}
