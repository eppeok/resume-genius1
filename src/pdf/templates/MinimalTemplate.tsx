import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume } from "./parseResume";

// Simple, stable layout - single column, no fixed elements, no flex rows
// Tighter spacing to prevent orphan pages
const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.35,
    color: "#1a1a1a",
  },
  // Header
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 10,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    color: "#000000",
  },
  role: {
    fontSize: 11,
    color: "#444444",
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9,
    color: "#555555",
  },
  contactLink: {
    color: "#0066cc",
    textDecoration: "none",
  },
  // Sections - use minPresenceAhead to prevent orphan headers
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#222222",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
  },
  // Entry (experience/education) - allow wrapping across pages
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  entryOrg: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 1,
  },
  entryDate: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#666666",
    marginBottom: 3,
  },
  // Bullets - allow wrapping to prevent orphan lines
  bullet: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 10,
    lineHeight: 1.3,
  },
  // Summary
  summaryText: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: "left",
  },
  // Skills
  skillsText: {
    fontSize: 9,
    lineHeight: 1.4,
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

// Simple bullet component - allow wrapping across pages to prevent orphan lines
function Bullet({ text }: { text: string }) {
  return (
    <Text style={styles.bullet}>
      • {text}
    </Text>
  );
}

// Experience/Project entry - allow content to flow across pages
// Use minPresenceAhead on header to keep title+org+date together
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
    <View style={styles.entry}>
      {/* Entry header with minPresenceAhead to prevent orphan headers */}
      <View style={styles.entryHeader} minPresenceAhead={40}>
        <Text style={styles.entryTitle}>{title}</Text>
        {orgLine && <Text style={styles.entryOrg}>{orgLine}</Text>}
        {dateRange && <Text style={styles.entryDate}>{dateRange}</Text>}
      </View>
      {/* Bullets can flow across pages */}
      {bullets.map((bullet, idx) => (
        <Bullet key={idx} text={bullet} />
      ))}
    </View>
  );
}

// Education entry - keep together since it's usually short
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
    <View style={styles.entry} minPresenceAhead={30}>
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
          
          {contactParts.length > 0 && !linkedinUrl && (
            <Text style={styles.contactLine}>{contactParts.join(" | ")}</Text>
          )}
          {contactParts.length > 0 && linkedinUrl && (
            <Text style={styles.contactLine}>
              {contactParts.join(" | ")} |{" "}
              <Link src={linkedinUrl} style={styles.contactLink}>LinkedIn</Link>
            </Text>
          )}
          {contactParts.length === 0 && linkedinUrl && (
            <Text style={styles.contactLine}>
              <Link src={linkedinUrl} style={styles.contactLink}>LinkedIn</Link>
            </Text>
          )}
        </View>

        {/* Summary - section title with minPresenceAhead to prevent orphan header */}
        {summaryText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={30}>Professional Summary</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Professional Experience</Text>
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
            <Text style={styles.sectionTitle} minPresenceAhead={20}>Skills</Text>
            <Text style={styles.skillsText}>{skillsText}</Text>
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={30}>Education</Text>
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
            <Text style={styles.sectionTitle} minPresenceAhead={25}>Certifications</Text>
            {resume.certifications.map((cert, idx) => (
              <Text key={idx} style={styles.bullet}>
                • {cert.title}{cert.organization ? ` – ${cert.organization}` : ""}
              </Text>
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>Projects</Text>
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
            <Text style={styles.sectionTitle} minPresenceAhead={25}>{section.title}</Text>
            {section.content.map((line, lIdx) => (
              <Text key={lIdx} style={styles.bullet}>
                • {line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

