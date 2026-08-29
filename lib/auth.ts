import { cookies } from "next/headers";

const COOKIE = "sct_auth";

export async function isLoggedIn() {
  const pass = process.env.APP_PASSCODE;
  if (!pass) return true;                     // chưa đặt mật khẩu -> mở
  const c = await cookies();
  return c.get(COOKIE)?.value === pass;
}

export const AUTH_COOKIE = COOKIE;
