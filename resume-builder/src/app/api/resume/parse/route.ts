import { NextRequest, NextResponse } from "next/server";
import { detectResumeType, extractTextFromResume } from "@/lib/resumeParser";
import { parseResumeText } from "@/lib/structuredResume";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is too large (max 8MB)." }, { status: 400 });
  }

  const type = detectResumeType(file.name, file.type);
  if (!type) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rawText: string;
  try {
    rawText = await extractTextFromResume(buffer, type);
  } catch {
    return NextResponse.json(
      { error: "Couldn't read that file. Make sure it isn't password-protected or corrupted." },
      { status: 400 },
    );
  }

  if (!rawText || rawText.trim().length < 40) {
    return NextResponse.json(
      { error: "Couldn't find enough text in that file. It may be a scanned image without selectable text." },
      { status: 400 },
    );
  }

  const { data, usedAI } = await parseResumeText(rawText);

  return NextResponse.json({ resumeData: data, rawText, usedAI });
}
