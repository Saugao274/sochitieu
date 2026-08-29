/**
 * Nap du lieu thang 08/2026 (ban da sua, moi khoan deu co nguoi tra)
 * cung so quy tien mat. Chay MOT LAN: node scripts/seed.mjs
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Thieu MONGODB_URI trong .env.local");
  process.exit(1);
}

const MONTH = "2026-08";

// [muc chi, noi dung, so tien (nghin), nguoi tra, ghi chu]
const rows = [
  ["Con học", "Tiền phòng sinh hoạt Bảo T7 — tiền phòng bố", 2433, "Bố", ""],
  ["Con học", "Tiền phòng sinh hoạt Bảo T7 — bố ck", 1000, "Bố", ""],
  ["Con học", "Tiền phòng sinh hoạt Bảo T7 — chị ck", 1500, "Bố", "Chị ck tiền bố"],
  ["Con học", "Tiền phòng sinh hoạt Bảo T7 — mẹ cho", 500, "Mẹ", ""],
  ["Con học", "Học phí Bảo", 18081, "Bố", ""],
  ["Con học", "Cho thêm gái iu", 1000, "Mẹ", ""],
  ["Con học", "Bun đồng phục, sách vở", 980, "Mẹ", ""],

  ["Điện nước nhà", "Điện", 1260, "Mẹ", ""],
  ["Điện nước nhà", "Nước", 140, "Mẹ", ""],
  ["Điện nước nhà", "Rác", 519, "Mẹ", ""],
  ["Điện nước nhà", "Bình ga", 480, "Mẹ", ""],

  ["Đi lại xăng xe", "Xăng ô tô (lần 1)", 950, "Mẹ", ""],
  ["Đi lại xăng xe", "Xăng ô tô (lần 2)", 800, "Bố", ""],
  ["Đi lại xăng xe", "Xăng ô tô (lần 3)", 900, "Mẹ", ""],
  ["Đi lại xăng xe", "Xăng xe máy", 100, "Mẹ", ""],

  ["Du lịch", "Đi Đà Nẵng — vé + ăn", 3357, "Bố", ""],
  ["Du lịch", "Đi Đà Nẵng — cầu đường bộ", 500, "Bố", ""],

  ["Điện thoại", "Điện thoại bố con", 1680, "Bố", ""],
  ["Điện thoại", "Điện thoại mẹ", 528, "Mẹ", ""],

  ["Chợ siêu thị", "BHXH, siêu thị", 2289, "Mẹ", ""],
  ["Sức khoẻ", "Răng", 6100, "Bố", ""],
  ["Mua sắm", "Loa", 150, "Bố", ""],
  ["Hiếu hỉ", "Thăm mừng", 500, "Mẹ", ""],

  ["Chi khác", "Chi tiền mặt", 2600, "Mẹ", "Bằng tổng sổ quỹ tiền mặt"],
  ["Chi khác", "Ck chi tiêu", 3349, "Mẹ", ""],
  ["Chi khác", "Dùng đồ bán", 822, "Mẹ", ""],
];

// So quy tien mat: am = tien ra
const cash = [
  ["dư tháng 7", 2500],
  ["lĩnh mượn", 4000],
  ["đổi đưa dì Quang", -1000],
  ["đổi tm Hoàng", 2000],
  ["Dung mượn", -4100],
  ["dư tháng 8", -1200],
  ["ông Tin trả nước hồng sâm", 400],
];

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "so_chi_tieu");
const now = Date.now();

const eCol = db.collection("expenses");
if ((await eCol.countDocuments({ month: MONTH })) > 0) {
  console.log(`${MONTH} da co khoan chi — bo qua.`);
} else {
  await eCol.insertMany(
    rows.map(([category, title, amount, payer, note], i) => ({
      month: MONTH, category, title, amount, payer, note,
      createdAt: new Date(now + i * 1000).toISOString(),
    }))
  );
  console.log(`Da nap ${rows.length} khoan chi. Tong ${rows.reduce((s,r)=>s+r[2],0).toLocaleString("vi-VN")} nghin.`);
}

const cCol = db.collection("cashlines");
if ((await cCol.countDocuments({ month: MONTH })) > 0) {
  console.log(`${MONTH} da co so quy — bo qua.`);
} else {
  await cCol.insertMany(
    cash.map(([label, amount], i) => ({
      month: MONTH, label, amount,
      createdAt: new Date(now + i * 1000).toISOString(),
    }))
  );
  console.log(`Da nap ${cash.length} dong so quy. Tong ${cash.reduce((s,r)=>s+r[1],0).toLocaleString("vi-VN")} nghin.`);
}

await client.close();
