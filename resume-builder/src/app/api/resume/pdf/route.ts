import { NextRequest, NextResponse } from "next/server";
import { renderResumePdf } from "@/lib/pdf/generatePdf";
import type { ResumeData } from "@/lib/types";

export const runtime = "nodejs";

function slugifyFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "resume";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const resumeData = body?.resumeData as ResumeData | undefined;

  if (!resumeData) {
    return NextResponse.json({ error: "Missing resumeData." }, { status: 400 });
  }

  const { buffer, pageCount } = await renderResumePdf(resumeData);
  const filename = `${slugifyFilename(resumeData.contact?.fullName || "resume")}-resume.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Page-Count": String(pageCount),
    },
  });
}
