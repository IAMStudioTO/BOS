import { NextResponse } from "next/server";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  // Admin password (Vercel)
  const adminPass = (process.env.ADMIN_PASSWORD || "").trim();

  // Header usato dai client (curl / admin page)
  const provided = (req.headers.get("x-admin-pass") || "").trim();

  if (!adminPass) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD not configured" },
      { status: 500 }
    );
  }

  if (provided !== adminPass) return unauthorized();

  const apiBaseUrl = (process.env.API_BASE_URL || "").trim();
  const apiKey = (process.env.ADMIN_API_KEY || "").trim();

  return NextResponse.json({
    ok: true,
    hasAdminPassword: true,
    adminPasswordLength: adminPass.length,
    hasApiBaseUrl: Boolean(apiBaseUrl),
    apiBaseUrl,
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey.length,
  });
}
