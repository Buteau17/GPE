import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "../types";
import { resumeDataToText } from "../resumeText";

interface FontTier {
  base: number;
  small: number;
  name: number;
  header: number;
  gap: number;
  lineHeight: number;
}

// Font tiers used to fit content compactly. We only shrink down to a size
// that stays comfortably readable (9pt) — beyond that, longer resumes are
// simply allowed to flow onto additional pages rather than being crammed
// into unreadably small text.
export const TIERS: FontTier[] = [
  { base: 10, small: 9, name: 20, header: 11, gap: 10, lineHeight: 1.35 },
  { base: 9.5, small: 8.5, name: 18, header: 10.5, gap: 8, lineHeight: 1.3 },
  { base: 9, small: 8, name: 17, header: 10, gap: 7, lineHeight: 1.25 },
];

export function pickFontTierIndex(resume: ResumeData): number {
  const length = resumeDataToText(resume).length;
  if (length < 1800) return 0;
  if (length < 2600) return 1;
  return 2;
}

function buildStyles(tier: FontTier) {
  return StyleSheet.create({
    page: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 40,
      fontFamily: "Helvetica",
      fontSize: tier.base,
      lineHeight: tier.lineHeight,
      color: "#1a1a1a",
    },
    name: {
      fontSize: tier.name,
      fontFamily: "Helvetica-Bold",
      marginBottom: 2,
    },
    contactRow: {
      fontSize: tier.small,
      color: "#333333",
      marginBottom: tier.gap,
    },
    section: {
      marginBottom: tier.gap,
    },
    sectionHeader: {
      fontSize: tier.header,
      fontFamily: "Helvetica-Bold",
      textTransform: "uppercase",
      borderBottom: "1pt solid #1a1a1a",
      paddingBottom: 2,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    entry: {
      marginBottom: 6,
    },
    entryHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    entryTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: tier.base,
    },
    entrySubtitle: {
      fontSize: tier.small,
      color: "#333333",
      marginBottom: 2,
    },
    dates: {
      fontSize: tier.small,
      color: "#333333",
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 1.5,
    },
    bulletMarker: {
      width: 10,
    },
    bulletText: {
      flex: 1,
    },
    skillsText: {
      fontSize: tier.base,
    },
  });
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} – ${end}`;
}

export function ResumeDocument({ resume, tierIndex }: { resume: ResumeData; tierIndex?: number }) {
  const tier = TIERS[tierIndex ?? pickFontTierIndex(resume)] ?? TIERS[TIERS.length - 1];
  const styles = buildStyles(tier);
  const { contact } = resume;

  const contactParts = [
    contact.location,
    contact.email,
    contact.phone,
    contact.linkedin,
    contact.github,
    contact.website,
  ].filter(Boolean);

  return (
    <Document title={contact.fullName ? `${contact.fullName} - Resume` : "Resume"}>
      <Page size="LETTER" style={styles.page}>
        {contact.fullName ? <Text style={styles.name}>{contact.fullName}</Text> : null}
        {contact.title ? <Text style={styles.entrySubtitle}>{contact.title}</Text> : null}
        {contactParts.length > 0 ? (
          <Text style={styles.contactRow}>{contactParts.join("  |  ")}</Text>
        ) : null}

        {resume.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Summary</Text>
            <Text>{resume.summary}</Text>
          </View>
        ) : null}

        {resume.skills.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <Text style={styles.skillsText}>{resume.skills}</Text>
          </View>
        ) : null}

        {resume.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            {resume.experience.map((job, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    {job.title}
                    {job.company ? ` — ${job.company}` : ""}
                  </Text>
                  <Text style={styles.dates}>{formatDateRange(job.startDate, job.endDate)}</Text>
                </View>
                {job.location ? <Text style={styles.entrySubtitle}>{job.location}</Text> : null}
                {job.bullets.map((bullet, bi) => (
                  <View key={bi} style={styles.bullet}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {resume.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {resume.education.map((edu, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    {edu.school}
                    {edu.degree ? ` — ${edu.degree}` : ""}
                  </Text>
                  <Text style={styles.dates}>{formatDateRange(edu.startDate, edu.endDate)}</Text>
                </View>
                {edu.location ? <Text style={styles.entrySubtitle}>{edu.location}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {resume.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {resume.projects.map((project, idx) => (
              <View key={idx} style={styles.entry} wrap={false}>
                <Text style={styles.entryTitle}>
                  {project.name}
                  {project.tech ? ` — ${project.tech}` : ""}
                </Text>
                {project.description ? <Text>{project.description}</Text> : null}
                {project.link ? <Text style={styles.entrySubtitle}>{project.link}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {resume.certifications.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>
            <Text>{resume.certifications}</Text>
          </View>
        ) : null}

        {resume.customSections
          .filter((s) => s.title && s.content)
          .map((section) => (
            <View key={section.id} style={styles.section} wrap={false}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              <Text>{section.content}</Text>
            </View>
          ))}
      </Page>
    </Document>
  );
}
