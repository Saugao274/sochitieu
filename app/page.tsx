import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { currentMonth } from "@/lib/types";
import Login from "@/components/Login";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isLoggedIn())) return <Login />;
  redirect(`/thang/${currentMonth()}`);
}
