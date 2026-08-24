"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Field, IconBtn, SectionShell, TextArea } from "./FormPrimitives";
import { TOKENS } from "@/lib/tokens";
import { emptyCustomSection, emptyEducation, emptyExperience, emptyProject, type ResumeData } from "@/lib/types";

interface Props {
  resumeData: ResumeData;
  setResumeData: Dispatch<SetStateAction<ResumeData>>;
}

export function EditorPanel({ resumeData, setResumeData }: Props) {
  const { contact, summary, experience, education, skills, projects, certifications, customSections } = resumeData;

  const updateContact = (field: keyof ResumeData["contact"], value: string) =>
    setResumeData((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));

  const setSummary = (value: string) => setResumeData((d) => ({ ...d, summary: value }));

  const updateExperience = (id: string, field: keyof ResumeData["experience"][number], value: string) =>
    setResumeData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  const updateBullet = (expId: string, idx: number, value: string) =>
    setResumeData((d) => ({
      ...d,
      experience: d.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? value : b)) } : e,
      ),
    }));
  const addBullet = (expId: string) =>
    setResumeData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e)),
    }));
  const removeBullet = (expId: string, idx: number) =>
    setResumeData((d) => ({
      ...d,
      experience: d.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e,
      ),
    }));
  const addExperience = () => setResumeData((d) => ({ ...d, experience: [...d.experience, emptyExperience()] }));
  const removeExperience = (id: string) =>
    setResumeData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));

  const updateEducation = (id: string, field: keyof ResumeData["education"][number], value: string) =>
    setResumeData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  const addEducation = () => setResumeData((d) => ({ ...d, education: [...d.education, emptyEducation()] }));
  const removeEducation = (id: string) =>
    setResumeData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));

  const setSkills = (value: string) => setResumeData((d) => ({ ...d, skills: value }));

  const setCertifications = (value: string) => setResumeData((d) => ({ ...d, certifications: value }));

  const updateCustomSection = (id: string, field: keyof ResumeData["customSections"][number], value: string) =>
    setResumeData((d) => ({
      ...d,
      customSections: d.customSections.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  const addCustomSection = () =>
    setResumeData((d) => ({ ...d, customSections: [...d.customSections, emptyCustomSection()] }));
  const removeCustomSection = (id: string) =>
    setResumeData((d) => ({ ...d, customSections: d.customSections.filter((s) => s.id !== id) }));

  const updateProject = (id: string, field: keyof ResumeData["projects"][number], value: string) =>
    setResumeData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));
  const addProject = () => setResumeData((d) => ({ ...d, projects: [...d.projects, emptyProject()] }));
  const removeProject = (id: string) =>
    setResumeData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  return (
    <div className="px-5">
      <SectionShell number="01" title="Contact">
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Full name" value={contact.fullName} onChange={(e) => updateContact("fullName", e.target.value)} />
          <Field label="Title" value={contact.title} onChange={(e) => updateContact("title", e.target.value)} />
          <Field label="Email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} />
          <Field label="Phone" value={contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
          <Field label="Location" value={contact.location} onChange={(e) => updateContact("location", e.target.value)} />
          <Field label="LinkedIn" value={contact.linkedin} onChange={(e) => updateContact("linkedin", e.target.value)} />
          <Field label="GitHub" value={contact.github} onChange={(e) => updateContact("github", e.target.value)} />
          <Field label="Website" value={contact.website} onChange={(e) => updateContact("website", e.target.value)} />
        </div>
      </SectionShell>

      <SectionShell number="02" title="Summary" subtitle="2–3 sentences, tailored to the role">
        <TextArea label="Professional summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
      </SectionShell>

      <SectionShell number="03" title="Experience" subtitle="Most recent first">
        {experience.map((exp, i) => (
          <div key={exp.id} className="mb-4 pb-4" style={{ borderBottom: i < experience.length - 1 ? `1px dashed ${TOKENS.mist}` : "none" }}>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
              <Field label="Role" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} />
              <Field label="Location" value={exp.location} onChange={(e) => updateExperience(exp.id, "location", e.target.value)} />
              <div className="grid grid-cols-2 gap-x-2">
                <Field label="Start" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                <Field label="End" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-plex-mono)",
                color: TOKENS.slate,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Bullets
            </span>
            {exp.bullets.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-1.5">
                <input
                  value={b}
                  onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                  className="w-full px-3 py-2 rounded outline-none"
                  style={{ border: `1px solid ${TOKENS.mist}`, fontSize: 13 }}
                />
                {exp.bullets.length > 1 ? (
                  <button type="button" onClick={() => removeBullet(exp.id, idx)}>
                    <Trash2 size={14} color={TOKENS.slate} />
                  </button>
                ) : null}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <IconBtn onClick={() => addBullet(exp.id)}>
                <Plus size={12} /> Bullet
              </IconBtn>
              {experience.length > 1 ? (
                <IconBtn danger onClick={() => removeExperience(exp.id)}>
                  <Trash2 size={12} /> Remove role
                </IconBtn>
              ) : null}
            </div>
          </div>
        ))}
        <IconBtn onClick={addExperience}>
          <Plus size={12} /> Add role
        </IconBtn>
      </SectionShell>

      <SectionShell number="04" title="Education">
        {education.map((edu, i) => (
          <div key={edu.id} className="mb-4 pb-4" style={{ borderBottom: i < education.length - 1 ? `1px dashed ${TOKENS.mist}` : "none" }}>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="School" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
              <Field label="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
              <Field label="Location" value={edu.location} onChange={(e) => updateEducation(edu.id, "location", e.target.value)} />
              <div className="grid grid-cols-2 gap-x-2">
                <Field label="Start" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                <Field label="End" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
              </div>
            </div>
            <Field
              label="Details (optional)"
              placeholder="GPA, Dean's List, relevant coursework"
              value={edu.details}
              onChange={(e) => updateEducation(edu.id, "details", e.target.value)}
            />
            {education.length > 1 ? (
              <IconBtn danger onClick={() => removeEducation(edu.id)}>
                <Trash2 size={12} /> Remove
              </IconBtn>
            ) : null}
          </div>
        ))}
        <IconBtn onClick={addEducation}>
          <Plus size={12} /> Add education
        </IconBtn>
      </SectionShell>

      <SectionShell number="05" title="Skills" subtitle="Write freely — however you'd like to format it">
        <TextArea label="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} rows={2} />
      </SectionShell>

      <SectionShell number="06" title="Projects" subtitle="Optional — great for early-career candidates" defaultOpen={false}>
        {projects.map((p, i) => (
          <div key={p.id} className="mb-4 pb-4" style={{ borderBottom: i < projects.length - 1 ? `1px dashed ${TOKENS.mist}` : "none" }}>
            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Project name" value={p.name} onChange={(e) => updateProject(p.id, "name", e.target.value)} />
              <Field label="Tech used" value={p.tech} onChange={(e) => updateProject(p.id, "tech", e.target.value)} />
            </div>
            <Field label="Link (optional)" value={p.link} onChange={(e) => updateProject(p.id, "link", e.target.value)} />
            <TextArea label="Description" value={p.description} onChange={(e) => updateProject(p.id, "description", e.target.value)} rows={2} />
            {projects.length > 1 ? (
              <IconBtn danger onClick={() => removeProject(p.id)}>
                <Trash2 size={12} /> Remove
              </IconBtn>
            ) : null}
          </div>
        ))}
        <IconBtn onClick={addProject}>
          <Plus size={12} /> Add project
        </IconBtn>
      </SectionShell>

      <SectionShell number="07" title="Certifications" subtitle="Optional — write freely" defaultOpen={false}>
        <TextArea
          label="Certifications"
          placeholder={"AWS Certified Solutions Architect\nCertified Kubernetes Administrator"}
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          rows={2}
        />
      </SectionShell>

      <SectionShell
        number="08"
        title="Additional sections"
        subtitle="Optional — coursework, awards, languages, volunteer work, publications..."
        defaultOpen={false}
      >
        {customSections.map((section, i) => (
          <div
            key={section.id}
            className="mb-4 pb-4"
            style={{ borderBottom: i < customSections.length - 1 ? `1px dashed ${TOKENS.mist}` : "none" }}
          >
            <Field
              label="Section title"
              placeholder="Relevant Coursework"
              value={section.title}
              onChange={(e) => updateCustomSection(section.id, "title", e.target.value)}
            />
            <TextArea
              label="Content"
              placeholder="Data Structures, Algorithms, Distributed Systems, Machine Learning"
              value={section.content}
              onChange={(e) => updateCustomSection(section.id, "content", e.target.value)}
              rows={2}
            />
            <IconBtn danger onClick={() => removeCustomSection(section.id)}>
              <Trash2 size={12} /> Remove section
            </IconBtn>
          </div>
        ))}
        <IconBtn onClick={addCustomSection}>
          <Plus size={12} /> Add section
        </IconBtn>
      </SectionShell>
    </div>
  );
}
