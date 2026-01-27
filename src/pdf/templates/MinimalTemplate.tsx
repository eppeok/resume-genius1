import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume } from "./parseResume";

// Professional Template - Navy header with gold accents
// Optimized for professional formatting with excellent readability
const styles = StyleSheet.create({
  page: {
    fontSize: 10,  // Increased from 9pt for better readability
    fontFamily: "Helvetica",
    lineHeight: 1.5,  // Increased from 1.4 for better spacing
    backgroundColor: "#ffffff",
    // Standard 1-inch margins on ALL pages (72pt = 1 inch)
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
  },
  // Navy header band
  headerBand: {
    backgroundColor: "#1e3a5f",
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 8,  // Increased spacing below name
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 11,
    color: "#d4af37",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,  // Add space above title
    marginBottom: 14,  // More space before contact row
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,  // Increased from 4pt
  },
  contactItem: {
    fontSize: 9,  // Increased from 8pt
    color: "#e8e8e8",
  },
  contactSeparator: {
    fontSize: 9,  // Increased from 8pt
    color: "#7a8fa3",
    marginHorizontal: 7,  // Increased from 6pt
  },
  contactLink: {
    fontSize: 9,  // Increased from 8pt
    color: "#d4af37",
    textDecoration: "none",
  },
  // Gold accent line below header
  accentLine: {
    height: 3,
    backgroundColor: "#d4af37",
    marginBottom: 2,  // Add small margin for separation
  },
  // Main content area
  content: {
    paddingHorizontal: 0,
    paddingTop: 20,  // Increased from 18pt for better separation
    paddingBottom: 0,
  },
  // Section styling
  section: {
    marginBottom: 18,  // Increased from 16pt for better section separation
  },
  sectionTitle: {
    fontSize: 11,  // Increased from 10pt for better hierarchy
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,  // Increased from 10pt
    paddingBottom: 5,  // Increased from 4pt
    borderBottomWidth: 2,
    borderBottomColor: "#d4af37",
  },
  // Summary
  summaryText: {
    fontSize: 10,  // Increased from 9pt
    lineHeight: 1.6,  // Increased from 1.5 for better readability
    color: "#333333",
    textAlign: "left",  // Changed from "justify" to avoid awkward spacing
  },
  // Experience entry with left gold border
  experienceEntry: {
    marginBottom: 16,  // Increased from 14pt for better separation
    paddingLeft: 12,  // Increased from 10pt for better indentation
    borderLeftWidth: 2,
    borderLeftColor: "#d4af37",
  },
  entryTitle: {
    fontSize: 11,  // Increased from 10pt for better prominence
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 3,  // Increased from 2pt
  },
  entryOrg: {
    fontSize: 10,  // Increased from 9pt
    color: "#444444",
    marginBottom: 2,  // Increased from 1pt
  },
  entryDate: {
    fontSize: 9,  // Increased from 8pt
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 8,  // Increased from 6pt for better spacing before bullets
  },
  // Bullet points with gold square - improved alignment
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 4,  // Increased from 3pt for better spacing
    paddingRight: 0,  // Removed extra padding
    alignItems: "flex-start",  // Better alignment
  },
  bulletIcon: {
    width: 14,  // Increased from 12pt for better alignment
    fontSize: 7,  // Increased from 6pt
    color: "#d4af37",
    paddingTop: 2.5,  // Adjusted for better vertical alignment
    flexShrink: 0,  // Prevent icon from shrinking
  },
  bulletText: {
    flex: 1,
    fontSize: 10,  // Increased from 9pt
    lineHeight: 1.5,  // Increased from 1.4
    color: "#333333",
  },
  // Skills section
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,  // Increased from 6pt for better spacing
    rowGap: 7,  // Explicit row gap
  },
  skillTag: {
    fontSize: 9,  // Increased from 8pt
    color: "#1e3a5f",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 10,  // Increased from 8pt
    paddingVertical: 5,  // Increased from 4pt
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d4e4f0",
  },
  // Education entry
  educationEntry: {
    marginBottom: 12,  // Increased from 10pt
  },
  eduTitle: {
    fontSize: 11,  // Increased from 10pt
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 2,  // Increased from 1pt
  },
  eduOrg: {
    fontSize: 10,  // Increased from 9pt
    color: "#444444",
    marginBottom: 2,  // Increased from 1pt
  },
  eduDate: {
    fontSize: 9,  // Increased from 8pt
    color: "#666666",
    fontStyle: "italic",
  },
  // Certifications
  certItem: {
    flexDirection: "row",
    marginBottom: 5,  // Increased from 4pt
    alignItems: "flex-start",  // Better alignment
  },
  certBullet: {
    width: 14,  // Increased from 12pt
    fontSize: 7,  // Increased from 6pt
    color: "#d4af37",
    paddingTop: 2.5,  // Adjusted for alignment
    flexShrink: 0,  // Prevent shrinking
  },
  certText: {
    flex: 1,
    fontSize: 10,  // Increased from 9pt
    color: "#333333",
    lineHeight: 1.5,  // Added for better readability
  },
  certOrg: {
    fontSize: 9,  // Increased from 8pt
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

// Convert string to title case
function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Build contact parts
function buildContactParts(contactInfo?: ContactInfo): string[] {
  const parts: string[] = [];
  if (contactInfo?.email) parts.push(contactInfo.email);
  if (contactInfo?.phone) parts.push(contactInfo.phone);
  if (contactInfo?.location) parts.push(contactInfo.location);
  return parts;
}

// Bullet component with gold square - improved wrapping
function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletContainer} wrap={false}>
      <Text style={styles.bulletIcon}>■</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

// Experience entry component - improved page break handling
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
    <View style={styles.experienceEntry} wrap={false} minPresenceAhead={60}>
      <View>
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

// Education entry component - improved wrapping
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
    <View style={styles.educationEntry} wrap={false} minPresenceAhead={35}>
      <Text style={styles.eduTitle}>{degree}</Text>
      {school && <Text style={styles.eduOrg}>{school}</Text>}
      {dateRange && <Text style={styles.eduDate}>{dateRange}</Text>}
    </View>
  );
}

// Certification item component - improved wrapping
function CertificationItem({ title, organization }: { title: string; organization?: string }) {
  return (
    <View style={styles.certItem} wrap={false}>
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
          <Text style={styles.name}>{toTitleCase(fullName) || "Your Name"}</Text>
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
              <Text style={styles.sectionTitle} minPresenceAhead={40}>Professional Summary</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Professional Experience - title stays with first entry */}
          {resume.experience.length > 0 && (
            <View style={styles.section}>
              {/* Wrap title + first entry together to prevent orphaned heading */}
              <View minPresenceAhead={120}>
                <Text style={styles.sectionTitle}>Professional Experience</Text>
                {resume.experience.length > 0 && (
                  <ExperienceEntry
                    title={resume.experience[0].title}
                    organization={resume.experience[0].organization}
                    location={resume.experience[0].location}
                    dateRange={resume.experience[0].dateRange}
                    bullets={resume.experience[0].bullets}
                  />
                )}
              </View>
              {/* Remaining entries can wrap naturally */}
              {resume.experience.slice(1).map((entry, idx) => (
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

          {/* Core Skills - keep entire section together */}
          {resume.skills.length > 0 && (
            <View style={styles.section} wrap={false} minPresenceAhead={80}>
              <Text style={styles.sectionTitle}>Core Skills</Text>
              <View style={styles.skillsContainer}>
                {resume.skills.map((skill, idx) => (
                  <Text key={idx} style={styles.skillTag}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Education - keep entire section together */}
          {resume.education.length > 0 && (
            <View style={styles.section} wrap={false} minPresenceAhead={100}>
              <Text style={styles.sectionTitle}>Education</Text>
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

          {/* Certifications - keep entire section together */}
          {resume.certifications.length > 0 && (
            <View style={styles.section} wrap={false} minPresenceAhead={100}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {resume.certifications.map((cert, idx) => (
                <CertificationItem
                  key={idx}
                  title={cert.title}
                  organization={cert.organization}
                />
              ))}
            </View>
          )}

          {/* Projects - title stays with first entry */}
          {resume.projects.length > 0 && (
            <View style={styles.section}>
              {/* Wrap title + first entry together */}
              <View minPresenceAhead={120}>
                <Text style={styles.sectionTitle}>Key Projects</Text>
                {resume.projects.length > 0 && (
                  <ExperienceEntry
                    title={resume.projects[0].title}
                    organization={resume.projects[0].organization}
                    dateRange={resume.projects[0].dateRange}
                    bullets={resume.projects[0].bullets}
                  />
                )}
              </View>
              {/* Remaining entries can wrap naturally */}
              {resume.projects.slice(1).map((entry, idx) => (
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

          {/* Other Sections - keep title with first content item */}
          {resume.other.map((section, sIdx) => (
            <View key={sIdx} style={styles.section} wrap={false} minPresenceAhead={80}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.content.map((line, lIdx) => (
                <View key={lIdx} style={styles.certItem} wrap={false}>
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
