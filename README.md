# Sổ chi tiêu gia đình

Web ghi các khoản chi theo tháng, có biểu đồ và sổ quỹ tiền mặt. Next.js + MongoDB.

Làm cho mẹ dùng trên điện thoại hoặc máy tính: ghi một khoản trong khoảng 5 giây, nhìn biểu đồ là biết tháng này tiền đi đâu.

---

## Cần chuẩn bị (đều miễn phí)

1. **Node.js 20+** — https://nodejs.org
2. **MongoDB Atlas** — https://www.mongodb.com/cloud/atlas/register (gói M0 miễn phí vĩnh viễn)
3. **Vercel** — https://vercel.com (để đưa web lên mạng)

---

## Bước 1 — Tạo cơ sở dữ liệu

1. Vào MongoDB Atlas, tạo cluster **M0 (Free)**
2. **Database Access** → tạo user, đặt mật khẩu, nhớ lại
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`)
4. **Database** → **Connect** → **Drivers** → copy chuỗi kết nối

Chuỗi trông như:

```
mongodb+srv://user:matkhau@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

## Bước 2 — Chạy thử ở máy

```bash
npm install
```

Tạo file `.env.local` (copy từ `.env.example`):

```
MONGODB_URI="chuỗi vừa copy ở trên"
MONGODB_DB="so_chi_tieu"
APP_PASSCODE="matkhaunhaminh"
```

Nạp sẵn dữ liệu tháng 08/2026:

```bash
npm run seed
```

Chạy:

```bash
npm run dev
```

Mở http://localhost:3000 — nhập mật khẩu vừa đặt.

## Bước 3 — Đưa lên mạng

1. Đẩy thư mục này lên một repo GitHub
2. Vercel → **Add New Project** → chọn repo đó
3. Phần **Environment Variables**, thêm đúng 3 biến trong `.env.local`
4. **Deploy**

Xong sẽ có địa chỉ dạng `so-chi-tieu.vercel.app`. Gửi mẹ, bảo mẹ **Thêm vào màn hình chính** để dùng như một app.

---

## Cách dùng

| Việc | Làm thế nào |
|---|---|
| Ghi khoản chi | Nút xanh **+ Ghi khoản chi** ở giữa đáy màn hình |
| Sửa hoặc xoá | Bấm vào dòng khoản đó, nó mở ra |
| Đổi người trả hoặc mục chi | Bấm vào dòng, chọn chip màu |
| Xem biểu đồ | Tab **Biểu đồ** trên đầu |
| Ghi sổ tiền mặt | Tab **Tiền mặt** |
| Chuyển tháng | Mũi tên trái phải trên đầu |
| Tháng mới | Vào tháng đó, bấm **Chép danh sách khoản chi từ tháng trước** |

### Ba tab

| Tab | Dùng để |
|---|---|
| **Khoản chi** | Danh sách gom theo mục chi, kèm thanh Bố / Mẹ ở đầu |
| **Biểu đồ** | Vòng tròn theo mục chi hoặc theo người trả, cột so 6 tháng gần nhất |
| **Tiền mặt** | Sổ quỹ nhiều dòng cộng trừ, ra một con số cuối |

### Mười mục chi

Con học · Điện nước nhà · Đi lại xăng xe · Du lịch · Điện thoại · Chợ siêu thị · Sức khoẻ · Mua sắm · Hiếu hỉ · Chi khác

Mỗi mục một màu, dùng thống nhất từ vạch màu bên trái mỗi dòng cho tới biểu đồ tròn. Muốn thêm hoặc đổi tên mục thì sửa `CATEGORIES` và `CAT_COLOR` trong `lib/types.ts`.

### Sổ quỹ tiền mặt

Đúng như khối TIỀN MẶT trong bảng cũ: dư tháng trước, lĩnh mượn, đổi đưa dì Quang, Dung mượn... cộng dồn ra số thực chi. Mỗi dòng hiện luôn "còn lại bao nhiêu" nên dễ dò khi lệch.

Web tự **đối chiếu** tổng sổ quỹ với khoản *Chi tiền mặt* bên danh sách. Lệch thì báo đỏ kèm nút sửa cho khớp.

### Đơn vị tiền

Nhập theo **nghìn đồng**, giống bảng Excel cũ. Gõ `1260` là 1.260.000đ — web hiện luôn số đầy đủ dưới ô nhập để khỏi nhầm.

---

## Cấu trúc

```
app/
  page.tsx                    đăng nhập, rồi chuyển tới tháng hiện tại
  thang/[month]/page.tsx      màn hình một tháng
  api/expenses/               thêm, sửa, xoá, liệt kê khoản chi
  api/cash/                   sổ quỹ tiền mặt
  api/months/copy/            chép danh sách từ tháng trước
  api/auth/                   kiểm tra mật khẩu
components/
  MonthView.tsx               ghép ba tab lại
  Charts.tsx                  biểu đồ tròn và cột, vẽ bằng SVG thuần
  CashLedger.tsx              sổ quỹ, đối chiếu với khoản Chi tiền mặt
  ExpenseRow.tsx              một dòng khoản chi, bấm để mở ra sửa
  AddSheet.tsx                form ghi khoản mới
lib/
  db.ts                       kết nối MongoDB, dùng lại một kết nối
  types.ts                    mục chi, màu, định dạng tiền
  auth.ts                     kiểm tra cookie đăng nhập
scripts/seed.mjs              nạp 26 khoản chi và 7 dòng sổ quỹ tháng 08/2026
```

## Về bảo mật

Cả nhà dùng **chung một mật khẩu** (`APP_PASSCODE`), lưu trong cookie 180 ngày. Đủ để người lạ không mở được, nhưng không phải hệ thống tài khoản thật — ai biết mật khẩu là xem và sửa được hết.

Nếu sau này cần mỗi người một tài khoản riêng, hoặc phân quyền chỉ xem, thì phải làm thêm phần đăng nhập đàng hoàng.
