import { NextResponse } from "next/server";

export async function GET() {
  const key = (process.env.ADMIN_API_KEY || "").trim();

  return NextResponse.json({
    hasKey: Boolean(key),
    keyLength: key.length,
    // non logghiamo e non mostriamo la key
  });
}
