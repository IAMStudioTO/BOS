import { NextResponse } from "next/server";
import { setAdminSession } from "../_auth";

export async function POST(req: Request) {
  const envPass = (process.env.ADMIN_PASSWORD || "").trim();
  if (!envPass) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD not configured" },
      { status: 500 }
    );
  }

  // Supporto: password da JSON oppure da header
  let password = (req.headers.get("x-admin-pass") || "").trim();
  if (!password) {
    try {
      const body = await req.json();
      password = String(body?.password || "").trim();
    } catch {}
  }

  if (!password || password !== envPass) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
