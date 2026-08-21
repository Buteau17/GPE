"use client";

import { Check } from "lucide-react";
import { TOKENS } from "@/lib/tokens";
import type { KeywordAnalysis, ResumeData } from "@/lib/types";

interface Props {
  resumeData: ResumeData;
  analysis: KeywordAnalysis | null;
  accent: string;
}

export function AtsMeter({ resumeData, analysis, accent }: Props) {
  const checks = [
    { label: "Full name", pass: resumeData.contact.fullName.trim().length > 0 },
    { label: "Valid email", pass: /\S+@\S+\.\S+/.test(resumeData.contact.email) },
    { label: "Phone number", pass: resumeData.contact.phone.trim().length > 0 },
    { label: "Summary (30+ chars)", pass: resumeData.summary.trim().length > 30 },
    {
      label: "1+ work experience",
      pass: resumeData.experience.some((e) => e.company.trim() || e.title.trim()),
    },
    {
      label: "Quantified impact",
      pass: resumeData.experience.some((e) => e.bullets.some((b) => /\d/.test(b))),
    },
    { label: "Skills listed", pass: resumeData.skills.length > 0 },
    { label: "Education added", pass: resumeData.education.some((e) => e.school.trim())},
  ];
  const passCount = checks.filter((c) => c.pass).length;

  return (
    <div className="px-5 pt-5 pb-1">
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: "var(--font-plex-mono)", fontSize: 11, color: TOKENS.slate, letterSpacing: "0.05em" }}>
          $ ats --check
        </span>
        <span
          style={{
            fontFamily: "var(--font-plex-mono)",
            fontSize: 11,
            color: passCount === checks.length ? TOKENS.green : TOKENS.amber,
          }}
        >
          {passCount}/{checks.length}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: TOKENS.mist, overflow: "hidden", marginBottom: 10 }}>
        <div
          style={{
            height: "100%",
            width: `${(passCount / checks.length) * 100}%`,
            background: passCount === checks.length ? TOKENS.green : accent,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-4">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c.pass ? TOKENS.green : "transparent",
                border: c.pass ? "none" : `1.5px solid ${TOKENS.mist}`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {c.pass ? <Check size={8} color="#fff" strokeWidth={3} /> : null}
            </span>
            <span style={{ fontSize: 11, color: c.pass ? TOKENS.ink : TOKENS.slate }}>{c.label}</span>
          </div>
        ))}
      </div>

      {analysis ? (
        <div className="mb-2" style={{ borderTop: `1px solid ${TOKENS.mist}`, paddingTop: 10 }}>
          <div style={{ fontFamily: "var(--font-plex-mono)", fontSize: 11, color: TOKENS.slate, marginBottom: 8 }}>
            $ keyword --match ({analysis.scoreBefore}% → {analysis.scoreAfter}%)
          </div>
          {analysis.matched.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {analysis.matched.slice(0, 20).map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-1 rounded"
                  style={{ fontSize: 11, background: "#E7F1EA", color: TOKENS.green, fontFamily: "var(--font-plex-mono)" }}
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : null}
          {analysis.missing.length > 0 ? (
            <>
              <div style={{ fontSize: 11, color: TOKENS.slate, marginBottom: 4 }}>
                Still missing (only add if truthful):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing.slice(0, 15).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-1 rounded"
                    style={{ fontSize: 11, background: "#F5EBDA", color: TOKENS.amber, fontFamily: "var(--font-plex-mono)" }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
