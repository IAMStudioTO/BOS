import { NextResponse } from "next/server";
import { isAdminAuthed } from "../_auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const API_BASE_URL = (
    process.env.API_BASE_URL || "https://bos-v6cz.onrender.com"
  ).replace(/\/$/, "");

  const adminKey = (process.env.ADMIN_API_KEY || "").trim();
  if (!adminKey) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_KEY not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${API_BASE_URL}/admin/leads`, {
    headers: { "x-admin-key": adminKey },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
