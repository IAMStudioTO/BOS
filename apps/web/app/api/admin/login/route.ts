import { NextResponse } from "next/server";

const COOKIE_NAME = "bos_admin";
const ONE_DAY = 60 * 60 * 24;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const pass = String(body?.password || "");

    const expected = (process.env.ADMIN_PASSWORD || "").trim();
    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_PASSWORD not configured" },
        { status: 500 }
      );
    }

    if (pass !== expected) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    // Cookie di sessione (httpOnly)
    res.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_DAY,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
