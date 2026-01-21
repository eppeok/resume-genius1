import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume } from "./parseResume";

// Simple, stable layout - single column, no fixed elements, no flex rows
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 15,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#000000",
  },
  role: {
    fontSize: 12,
    color: "#444444",
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 9,
    color: "#555555",
  },
  contactLink: {
    color: "#0066cc",
    textDecoration: "none",
  },
  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#222222",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
  },
  // Entry (experience/education)
  entry: {
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  entryOrg: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#666666",
    marginBottom: 4,
  },
  // Bullets
  bullet: {
    fontSize: 10,
    marginBottom: 3,
    paddingLeft: 12,
    lineHeight: 1.35,
  },
  // Summary
  summaryText: {
    fontSize: 10,
    lineHeight: 1.45,
    textAlign: "left",
  },
  // Skills
  skillsText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface MinimalTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

// Build contact line string
function buildContactLine(contactInfo?: ContactInfo): string[] {
  const parts: string[] = [];
  if (contactInfo?.email) parts.push(contactInfo.email);
  if (contactInfo?.phone) parts.push(contactInfo.phone);
  if (contactInfo?.location) parts.push(contactInfo.location);
  return parts;
}

// Simple bullet component - single Text, no flex rows
function Bullet({ text }: { text: string }) {
  return (
    <Text style={styles.bullet} wrap={false}>
      • {text}
    </Text>
  );
}

// Experience/Project entry
function EntryBlock({ 
  title, 
  organization, 
  location, 
  dateRange, 
  bullets 
}: { 
  title: string; 
  organization?: string; 
  location?: string;
  dateRange?: string; 
  bullets: string[];
}) {
  const orgLine = [organization, location].filter(Boolean).join(" – ");
  
  return (
    <View style={styles.entry} wrap={false}>
      <Text style={styles.entryTitle}>{title}</Text>
      {orgLine && <Text style={styles.entryOrg}>{orgLine}</Text>}
      {dateRange && <Text style={styles.entryDate}>{dateRange}</Text>}
      {bullets.map((bullet, idx) => (
        <Bullet key={idx} text={bullet} />
      ))}
    </View>
  );
}

// Education entry
function EducationBlock({ 
  degree, 
  school, 
  dateRange 
}: { 
  degree: string; 
  school?: string; 
  dateRange?: string;
}) {
  return (
    <View style={styles.entry} wrap={false}>
      <Text style={styles.entryTitle}>{degree}</Text>
      {school && <Text style={styles.entryOrg}>{school}</Text>}
      {dateRange && <Text style={styles.entryDate}>{dateRange}</Text>}
    </View>
  );
}

export function MinimalTemplate({ content, fullName, targetRole, contactInfo }: MinimalTemplateProps) {
  const resume = parseResume(content);
  
  // Build contact parts
  const contactParts = buildContactLine(contactInfo);
  const linkedinUrl = contactInfo?.linkedinUrl;
  
  // Skills as comma-separated
  const skillsText = resume.skills.join(", ");
  
  // Summary as single paragraph
  const summaryText = resume.summary.join(" ").trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          {targetRole && <Text style={styles.role}>{targetRole}</Text>}
          
          {(contactParts.length > 0 || linkedinUrl) && (
            <Text style={styles.contactLine}>
              {contactParts.join(" | ")}
              {contactParts.length > 0 && linkedinUrl && " | "}
              {linkedinUrl && (
                <Link src={linkedinUrl} style={styles.contactLink}>
                  LinkedIn
                </Link>
              )}
            </Text>
          )}
        </View>

        {/* Summary */}
        {summaryText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {resume.experience.map((entry, idx) => (
              <EntryBlock
                key={idx}
                title={entry.title}
                organization={entry.organization}
                location={entry.location}
                dateRange={entry.dateRange}
                bullets={entry.bullets}
              />
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{skillsText}</Text>
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((entry, idx) => (
              <EducationBlock
                key={idx}
                degree={entry.title}
                school={entry.organization}
                dateRange={entry.dateRange}
              />
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, idx) => (
              <Text key={idx} style={styles.bullet} wrap={false}>
                • {cert.title}{cert.organization ? ` – ${cert.organization}` : ""}
              </Text>
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((entry, idx) => (
              <EntryBlock
                key={idx}
                title={entry.title}
                organization={entry.organization}
                dateRange={entry.dateRange}
                bullets={entry.bullets}
              />
            ))}
          </View>
        )}

        {/* Other sections */}
        {resume.other.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((line, lIdx) => (
              <Text key={lIdx} style={styles.bullet} wrap={false}>
                • {line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

