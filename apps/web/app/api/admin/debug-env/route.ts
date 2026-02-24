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

  const apiBaseUrl = (process.env.API_BASE_URL || "").trim();
  const adminPass = (process.env.ADMIN_PASSWORD || "").trim();
  const adminKey = (process.env.ADMIN_API_KEY || "").trim();

  return NextResponse.json({
    ok: true,
    hasAdminPassword: Boolean(adminPass),
    adminPasswordLength: adminPass.length,
    hasAdminApiKey: Boolean(adminKey),
    adminApiKeyLength: adminKey.length,
    hasApiBaseUrl: Boolean(apiBaseUrl),
    apiBaseUrl,
  });
}
