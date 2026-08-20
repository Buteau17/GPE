import { NextRequest, NextResponse } from "next/server";
import { buildKeywordAnalysis } from "@/lib/keywords";
import { optimizeResume } from "@/lib/resumeOptimizer";
import { resumeDataToText } from "@/lib/resumeText";
import type { ResumeData } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const resumeData = body?.resumeData as ResumeData | undefined;
  const jobDescription = body?.jobDescription as string | undefined;

  if (!resumeData) {
    return NextResponse.json({ error: "Missing resumeData." }, { status: 400 });
  }
  if (!jobDescription || jobDescription.trim().length < 40) {
    return NextResponse.json(
      { error: "Job description is missing or too short to analyze." },
      { status: 400 },
    );
  }

  const beforeText = resumeDataToText(resumeData);
  const { data: optimizedResumeData, usedAI } = await optimizeResume(resumeData, jobDescription);
  const afterText = resumeDataToText(optimizedResumeData);

  const keywordAnalysis = buildKeywordAnalysis(beforeText, afterText, jobDescription);

  return NextResponse.json({ optimizedResumeData, keywordAnalysis, usedAI });
}
