import { isLoggedIn } from "@/lib/auth";
import Login from "@/components/Login";
import MonthView from "@/components/MonthView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  return {
    title: `Tháng ${month} - Sổ chi tiêu`,
  };
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  if (!(await isLoggedIn())) return <Login />;
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month))
    return (
      <main className="p-8 text-center">
        <p className="text-[15px]">Đường dẫn tháng không đúng dạng 2026-08.</p>
      </main>
    );
  return <MonthView month={month} />;
}
