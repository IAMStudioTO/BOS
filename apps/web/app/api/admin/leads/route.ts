import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://bos-v6cz.onrender.com/admin/leads",
    {
      headers: {
        "x-admin-key": process.env.ADMIN_API_KEY || "",
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
