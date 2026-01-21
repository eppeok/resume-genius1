import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume } from "./parseResume";

// Professional Template - Navy header with gold accents
// Single-column layout for stability, elegant typography
const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
  },
  // Navy header band
  headerBand: {
    backgroundColor: "#1e3a5f",
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 22,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 10,
    color: "#d4af37",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  contactItem: {
    fontSize: 8,
    color: "#e8e8e8",
  },
  contactSeparator: {
    fontSize: 8,
    color: "#7a8fa3",
    marginHorizontal: 6,
  },
  contactLink: {
    fontSize: 8,
    color: "#d4af37",
    textDecoration: "none",
  },
  // Gold accent line below header
  accentLine: {
    height: 3,
    backgroundColor: "#d4af37",
  },
  // Main content area
  content: {
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Section styling
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#d4af37",
  },
  // Summary
  summaryText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333333",
    textAlign: "justify",
  },
  // Experience entry with left gold border
  experienceEntry: {
    marginBottom: 14,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#d4af37",
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 2,
  },
  entryOrg: {
    fontSize: 9,
    color: "#444444",
    marginBottom: 1,
  },
  entryDate: {
    fontSize: 8,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  // Bullet points with gold square
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 10,
  },
  bulletIcon: {
    width: 12,
    fontSize: 6,
    color: "#d4af37",
    paddingTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: "#333333",
  },
  // Skills section
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    fontSize: 8,
    color: "#1e3a5f",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d4e4f0",
  },
  // Education entry
  educationEntry: {
    marginBottom: 10,
  },
  eduTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 1,
  },
  eduOrg: {
    fontSize: 9,
    color: "#444444",
    marginBottom: 1,
  },
  eduDate: {
    fontSize: 8,
    color: "#666666",
    fontStyle: "italic",
  },
  // Certifications
  certItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  certBullet: {
    width: 12,
    fontSize: 6,
    color: "#d4af37",
    paddingTop: 2,
  },
  certText: {
    flex: 1,
    fontSize: 9,
    color: "#333333",
  },
  certOrg: {
    fontSize: 8,
    color: "#666666",
    fontStyle: "italic",
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

// Build contact parts
function buildContactParts(contactInfo?: ContactInfo): string[] {
  const parts: string[] = [];
  if (contactInfo?.email) parts.push(contactInfo.email);
  if (contactInfo?.phone) parts.push(contactInfo.phone);
  if (contactInfo?.location) parts.push(contactInfo.location);
  return parts;
}

// Bullet component with gold square
function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletContainer}>
      <Text style={styles.bulletIcon}>■</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

// Experience entry component
function ExperienceEntry({ 
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
    <View style={styles.experienceEntry}>
      <View minPresenceAhead={40}>
        <Text style={styles.entryTitle}>{title}</Text>
        {orgLine && <Text style={styles.entryOrg}>{orgLine}</Text>}
        {dateRange && <Text style={styles.entryDate}>{dateRange}</Text>}
      </View>
      {bullets.map((bullet, idx) => (
        <Bullet key={idx} text={bullet} />
      ))}
    </View>
  );
}

// Education entry component
function EducationEntry({ 
  degree, 
  school, 
  dateRange 
}: { 
  degree: string; 
  school?: string; 
  dateRange?: string;
}) {
  return (
    <View style={styles.educationEntry} minPresenceAhead={30}>
      <Text style={styles.eduTitle}>{degree}</Text>
      {school && <Text style={styles.eduOrg}>{school}</Text>}
      {dateRange && <Text style={styles.eduDate}>{dateRange}</Text>}
    </View>
  );
}

// Certification item component
function CertificationItem({ title, organization }: { title: string; organization?: string }) {
  return (
    <View style={styles.certItem}>
      <Text style={styles.certBullet}>■</Text>
      <Text style={styles.certText}>
        {title}
        {organization && <Text style={styles.certOrg}> – {organization}</Text>}
      </Text>
    </View>
  );
}

export function MinimalTemplate({ content, fullName, targetRole, contactInfo }: MinimalTemplateProps) {
  const resume = parseResume(content);
  
  const contactParts = buildContactParts(contactInfo);
  const linkedinUrl = contactInfo?.linkedinUrl;
  const summaryText = resume.summary.join(" ").trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Navy Header Band */}
        <View style={styles.headerBand}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          {targetRole && <Text style={styles.title}>{targetRole}</Text>}
          
          {/* Contact Info Row */}
          <View style={styles.contactRow}>
            {contactParts.map((part, idx) => (
              <View key={idx} style={{ flexDirection: "row" }}>
                <Text style={styles.contactItem}>{part}</Text>
                {(idx < contactParts.length - 1 || linkedinUrl) && (
                  <Text style={styles.contactSeparator}>|</Text>
                )}
              </View>
            ))}
            {linkedinUrl && (
              <Link src={linkedinUrl} style={styles.contactLink}>LinkedIn</Link>
            )}
          </View>
        </View>

        {/* Gold Accent Line */}
        <View style={styles.accentLine} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Professional Summary */}
          {summaryText && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={30}>Professional Summary</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Professional Experience */}
          {resume.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={50}>Professional Experience</Text>
              {resume.experience.map((entry, idx) => (
                <ExperienceEntry
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

          {/* Core Skills */}
          {resume.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={20}>Core Skills</Text>
              <View style={styles.skillsContainer}>
                {resume.skills.map((skill, idx) => (
                  <Text key={idx} style={styles.skillTag}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={30}>Education</Text>
              {resume.education.map((entry, idx) => (
                <EducationEntry
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
                <CertificationItem
                  key={idx}
                  title={cert.title}
                  organization={cert.organization}
                />
              ))}
            </View>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={40}>Key Projects</Text>
              {resume.projects.map((entry, idx) => (
                <ExperienceEntry
                  key={idx}
                  title={entry.title}
                  organization={entry.organization}
                  dateRange={entry.dateRange}
                  bullets={entry.bullets}
                />
              ))}
            </View>
          )}

          {/* Other Sections */}
          {resume.other.map((section, sIdx) => (
            <View key={sIdx} style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={25}>{section.title}</Text>
              {section.content.map((line, lIdx) => (
                <View key={lIdx} style={styles.certItem}>
                  <Text style={styles.certBullet}>■</Text>
                  <Text style={styles.certText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
