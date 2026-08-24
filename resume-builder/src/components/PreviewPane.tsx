"use client";

import { PreviewSection } from "./FormPrimitives";
import type { ResumeData } from "@/lib/types";

interface Props {
  resumeData: ResumeData;
  accent: string;
}

export function PreviewPane({ resumeData, accent }: Props) {
  const { contact, summary, experience, education, skills, projects, certifications, customSections } = resumeData;

  return (
    <div className="preview-wrap w-full lg:w-[54%] flex justify-center">
      <div
        className="preview-page w-full"
        style={{
          background: "#fff",
          maxWidth: 760,
          minHeight: 1000,
          padding: "48px 52px",
          boxShadow: "0 1px 3px rgba(20,24,31,0.08), 0 12px 32px rgba(20,24,31,0.10)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#1A1D23",
        }}
      >
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.01em" }}>{contact.fullName || "Your Name"}</div>
          {contact.title ? (
            <div style={{ fontSize: 14, color: accent, marginTop: 2, fontFamily: "Arial, sans-serif" }}>{contact.title}</div>
          ) : null}
          <div
            style={{
              fontSize: 12,
              color: "#454A52",
              marginTop: 8,
              fontFamily: "Arial, sans-serif",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "4px 10px",
            }}
          >
            {contact.email ? <span>{contact.email}</span> : null}
            {contact.phone ? <span>· {contact.phone}</span> : null}
            {contact.location ? <span>· {contact.location}</span> : null}
            {contact.linkedin ? <span>· {contact.linkedin}</span> : null}
            {contact.github ? <span>· {contact.github}</span> : null}
            {contact.website ? <span>· {contact.website}</span> : null}
          </div>
        </div>

        {summary ? (
          <PreviewSection title="Summary" accent={accent}>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, fontFamily: "Arial, sans-serif", color: "#2A2D33" }}>{summary}</p>
          </PreviewSection>
        ) : null}

        {experience.some((e) => e.company || e.title) ? (
          <PreviewSection title="Experience" accent={accent}>
            {experience
              .filter((e) => e.company || e.title)
              .map((e) => (
                <div key={e.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Arial, sans-serif" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {e.title || "Role"} — {e.company || "Company"}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#5B6472" }}>{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                  {e.location ? <div style={{ fontSize: 11.5, color: "#5B6472", fontFamily: "Arial, sans-serif" }}>{e.location}</div> : null}
                  <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                    {e.bullets
                      .filter(Boolean)
                      .map((b, i) => (
                        <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, fontFamily: "Arial, sans-serif", color: "#2A2D33", marginBottom: 2 }}>
                          {b}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </PreviewSection>
        ) : null}

        {education.some((e) => e.school) ? (
          <PreviewSection title="Education" accent={accent}>
            {education
              .filter((e) => e.school)
              .map((e) => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Arial, sans-serif" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {e.degree || "Degree"} — {e.school}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#5B6472" }}>{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                  {e.location || e.details ? (
                    <div style={{ fontSize: 11.5, color: "#5B6472", fontFamily: "Arial, sans-serif" }}>
                      {[e.location, e.details].filter(Boolean).join(" · ")}
                    </div>
                  ) : null}
                </div>
              ))}
          </PreviewSection>
        ) : null}

        {skills.trim() ? (
          <PreviewSection title="Skills" accent={accent}>
            <p
              style={{
                fontSize: 12.5,
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.7,
                color: "#2A2D33",
                whiteSpace: "pre-wrap",
              }}
            >
              {skills}
            </p>
          </PreviewSection>
        ) : null}

        {projects.some((p) => p.name) ? (
          <PreviewSection title="Projects" accent={accent}>
            {projects
              .filter((p) => p.name)
              .map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 700 }}>
                    {p.name}
                    {p.tech ? <span style={{ fontWeight: 400, color: "#5B6472" }}> — {p.tech}</span> : null}
                  </div>
                  {p.description ? (
                    <div style={{ fontSize: 12.5, fontFamily: "Arial, sans-serif", color: "#2A2D33", lineHeight: 1.5 }}>{p.description}</div>
                  ) : null}
                  {p.link ? <div style={{ fontSize: 11.5, fontFamily: "Arial, sans-serif", color: accent }}>{p.link}</div> : null}
                </div>
              ))}
          </PreviewSection>
        ) : null}

        {certifications.trim() ? (
          <PreviewSection title="Certifications" accent={accent}>
            <p
              style={{
                fontSize: 12.5,
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.7,
                color: "#2A2D33",
                whiteSpace: "pre-wrap",
              }}
            >
              {certifications}
            </p>
          </PreviewSection>
        ) : null}

        {customSections
          .filter((s) => s.title && s.content)
          .map((s) => (
            <PreviewSection key={s.id} title={s.title} accent={accent}>
              <p style={{ fontSize: 12.5, lineHeight: 1.55, fontFamily: "Arial, sans-serif", color: "#2A2D33" }}>{s.content}</p>
            </PreviewSection>
          ))}
      </div>
    </div>
  );
}
