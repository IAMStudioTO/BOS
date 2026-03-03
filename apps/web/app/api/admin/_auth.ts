import { cookies } from "next/headers";

export const COOKIE_NAME = "bos_admin_session";

/**
 * True se:
 * - esiste cookie di sessione admin (set dopo login)
 * - oppure header x-admin-pass == ADMIN_PASSWORD
 * - oppure header x-admin-key  == ADMIN_API_KEY
 */
export async function isAdminAuthed(req?: Request) {
  const c = await cookies();
  const session = c.get(COOKIE_NAME)?.value;
  if (session === "1") return true;

  const passEnv = (process.env.ADMIN_PASSWORD || "").trim();
  const keyEnv = (process.env.ADMIN_API_KEY || "").trim();

  if (!req) return false;

  const pass = (req.headers.get("x-admin-pass") || "").trim();
  const key = (req.headers.get("x-admin-key") || "").trim();

  if (passEnv && pass && pass === passEnv) return true;
  if (keyEnv && key && key === keyEnv) return true;

  return false;
}

export async function setAdminSession() {
  const c = await cookies();
  c.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 giorni
  });
}

export async function clearAdminSession() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}
