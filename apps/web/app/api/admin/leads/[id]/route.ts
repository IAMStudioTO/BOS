import { NextResponse } from "next/server";

export const runtime = "nodejs";

function json(status: number, body: any) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalize(s: string) {
  return (s || "").trim();
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const leadId = Number(id);

    if (!Number.isFinite(leadId) || leadId <= 0) {
      return json(400, { ok: false, error: "Invalid id" });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ""; // stessa key che hai su Render
    const API_BASE_URL = process.env.API_BASE_URL || "";

    if (!API_BASE_URL) {
      return json(500, { ok: false, error: "API_BASE_URL not configured" });
    }
    if (!ADMIN_API_KEY) {
      return json(500, { ok: false, error: "ADMIN_API_KEY not configured" });
    }
    if (!ADMIN_PASSWORD) {
      return json(500, { ok: false, error: "ADMIN_PASSWORD not configured" });
    }

    // password inviata dal client (admin page) — non la salviamo, serve solo per autorizzare
    const pass = normalize(_req.headers.get("x-admin-pass") || "");
    if (pass !== ADMIN_PASSWORD) {
      return json(403, { ok: false, error: "Forbidden" });
    }

    const r = await fetch(`${API_BASE_URL}/admin/leads/${leadId}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": ADMIN_API_KEY,
      },
      cache: "no-store",
    });

    const text = await r.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      return json(r.status, data || { ok: false, error: "Upstream error" });
    }

    return json(200, data || { ok: true, deletedId: leadId });
  } catch (e: any) {
    return json(500, { ok: false, error: e?.message || "Server error" });
  }
}
