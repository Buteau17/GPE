import { heuristicParseResume } from "./heuristicParser";
import { emptyResumeData, type ResumeData } from "./types";

export function parseResumeText(rawText: string): ResumeData {
  return heuristicParseResume(rawText) ?? emptyResumeData();
}
