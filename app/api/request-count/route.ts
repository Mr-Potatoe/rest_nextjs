import { NextResponse } from "next/server";
import { getRequestCount } from "@/lib/prisma"; // Reuse existing function

const MAX_REQUESTS_PER_DAY = 50;

export async function GET() {
  const count = getRequestCount(); // Get current request count
  return NextResponse.json({ count, limit: MAX_REQUESTS_PER_DAY });
}
