import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://bos-v6cz.onrender.com/admin/leads.csv",
    {
      headers: {
        "x-admin-key": process.env.ADMIN_API_KEY || "",
      },
    }
  );

  const csv = await res.text();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="bos-leads.csv"',
    },
  });
}
