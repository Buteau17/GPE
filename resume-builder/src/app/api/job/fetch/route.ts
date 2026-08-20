import { NextRequest, NextResponse } from "next/server";
import { fetchJobDescription } from "@/lib/jobFetcher";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url = body?.url;

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "Please provide a job posting URL." }, { status: 400 });
  }

  try {
    const result = await fetchJobDescription(url.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch that job posting.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
