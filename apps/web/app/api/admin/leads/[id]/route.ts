import { NextResponse } from "next/server";
import { isAdminAuthed } from "../../_auth";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthed()) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const API_BASE_URL = (
    process.env.API_BASE_URL || "https://bos-v6cz.onrender.com"
  ).replace(/\/$/, "");

  const ADMIN_API_KEY = (process.env.ADMIN_API_KEY || "").trim();
  if (!ADMIN_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { id } = await context.params;

  const res = await fetch(`${API_BASE_URL}/admin/leads/${id}`, {
    method: "DELETE",
    headers: {
      "x-admin-key": ADMIN_API_KEY,
    },
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
