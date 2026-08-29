export const PAYERS = ["Bố", "Mẹ", "Chị", "Chung"] as const;
export type Payer = (typeof PAYERS)[number];

export const METHODS = ["Chuyển khoản", "Tiền mặt"] as const;
export const METHOD_COLOR: Record<string, string> = {
  "Chuyển khoản": "#2196F3",
  "Tiền mặt": "#4CAF50",
};

/** Danh mục chi — chia nhỏ để dễ soi tháng nào tăng ở đâu. */
export const CATEGORIES = [
  "Con học",
  "Điện nước nhà",
  "Đi lại xăng xe",
  "Du lịch",
  "Điện thoại",
  "Chợ siêu thị",
  "Sức khoẻ",
  "Mua sắm",
  "Hiếu hỉ",
  "Chi khác",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CAT_COLOR: Record<string, string> = {
  "Con học": "#1F5C6E",
  "Điện nước nhà": "#3E8A7C",
  "Đi lại xăng xe": "#C08A2E",
  "Du lịch": "#B5673D",
  "Điện thoại": "#6A6FA8",
  "Chợ siêu thị": "#7B4B8A",
  "Sức khoẻ": "#A33B5E",
  "Mua sắm": "#5A7247",
  "Hiếu hỉ": "#8A7B4B",
  "Chi khác": "#6B7A77",
};

export const PAYER_COLOR: Record<string, string> = {
  "Bố": "#1F5C6E",
  "Mẹ": "#7B4B8A",
  "Chị": "#5A7247",
  "Chung": "#4A6B7C",
};

/** Số tiền lưu theo NGHÌN ĐỒNG, giống bảng Excel gốc của gia đình. */
export type Expense = {
  _id: string;
  month: string;      // "2026-08"
  category: string;
  title: string;
  amount: number;     // nghìn đồng
  payer: string;
  method?: string;    // "Chuyển khoản" | "Tiền mặt"
  note: string;
  createdAt: string;
};

/** Một dòng trong sổ quỹ tiền mặt. amount âm = tiền ra. */
export type CashLine = {
  _id: string;
  month: string;
  label: string;
  amount: number;
  type?: "tm_me" | "tm_bo" | "ck_me" | "ck_bo" | "cash";
  createdAt: string;
};

export function monthLabel(m: string) {
  const [y, mm] = m.split("-");
  return `Tháng ${Number(mm)}/${y}`;
}

export function shiftMonth(m: string, delta: number) {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(y, mm - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 18081 (nghìn) -> "18.081.000 đ" */
export function toDong(nghin: number) {
  return Math.round(nghin * 1000).toLocaleString("vi-VN") + " đ";
}

export function fmtK(n: number) {
  return n.toLocaleString("vi-VN");
}

export function sumBy<T>(arr: T[], f: (x: T) => number) {
  return arr.reduce((s, x) => s + f(x), 0);
}
