import { NextResponse } from "next/server";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(req: Request) {
  const pass = (process.env.ADMIN_PASSWORD || "").trim();
  const key = (process.env.ADMIN_API_KEY || "").trim();

  const providedPass = (req.headers.get("x-admin-pass") || "").trim();
  const providedKey = (req.headers.get("x-admin-key") || "").trim();

  const passOk = pass && providedPass === pass;
  const keyOk = key && providedKey === key;

  return passOk || keyOk;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();

  const API_BASE_URL = (process.env.API_BASE_URL || "").trim();
  const ADMIN_API_KEY = (process.env.ADMIN_API_KEY || "").trim();

  if (!API_BASE_URL) {
    return NextResponse.json(
      { ok: false, error: "API_BASE_URL not configured" },
      { status: 500 }
    );
  }
  if (!ADMIN_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_KEY not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${API_BASE_URL}/admin/leads.csv`, {
    headers: { "x-admin-key": ADMIN_API_KEY },
    cache: "no-store",
  });

  const csv = await res.text();

  return new NextResponse(csv, {
    status: res.status,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bos-leads.csv"',
    },
  });
}

