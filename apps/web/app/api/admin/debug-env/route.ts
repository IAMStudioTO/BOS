import { NextResponse } from "next/server";
import { isAdminAuthed } from "../_auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const key = (process.env.ADMIN_API_KEY || "").trim();
  const apiBase = (process.env.API_BASE_URL || "").trim();

  return NextResponse.json({
    hasKey: Boolean(key),
    keyLength: key.length,
    hasApiBaseUrl: Boolean(apiBase),
    apiBaseUrl: apiBase ? "[set]" : "",
  });
}
