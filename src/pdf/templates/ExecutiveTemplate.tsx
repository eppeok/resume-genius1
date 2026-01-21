import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, type ResumeEntry } from "./parseResume";
import { normalizeWhitespace, prepareBullets, prepareSkills } from "./styles";

// Executive - Premium design with navy header, gold accents, sophisticated layout
const navyColor = "#0f172a";
const goldColor = "#b8860b";
const goldLight = "#d4a847";

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
    paddingBottom: 60,
  },
  // Premium header band - fixed to repeat on pages
  headerBand: {
    backgroundColor: navyColor,
    paddingHorizontal: 35,
    paddingTop: 35,
    paddingBottom: 28,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  nameBlock: {
    flex: 1,
    flexShrink: 1,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 5,
    letterSpacing: 1,
  },
  title: {
    fontSize: 11,
    color: goldColor,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  contactBlock: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 6,
    color: "#64748b",
    marginRight: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    width: 50,
    textAlign: "right",
    flexShrink: 0,
  },
  contactValue: {
    fontSize: 8,
    color: "#e2e8f0",
    textAlign: "left",
  },
  contactLink: {
    fontSize: 8,
    color: "#e2e8f0",
    textDecoration: "none",
    textAlign: "left",
  },
  // Gold accent line
  goldAccent: {
    height: 3,
    backgroundColor: goldColor,
  },
  // Body
  body: {
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 20,
  },
  // Full width summary
  summarySection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 7,
    color: goldColor,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  summaryText: {
    color: "#374151",
    lineHeight: 1.7,
    fontSize: 10,
    textAlign: "justify",
  },
  // Two column layout - allow wrapping
  twoColumn: {
    flexDirection: "row",
    gap: 25,
  },
  leftColumn: {
    width: "60%",
  },
  rightColumn: {
    width: "40%",
  },
  // Section styling
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: goldColor,
  },
  rightSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  // Experience entries with gold left border
  experienceEntry: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: goldColor,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
    gap: 6,
  },
  entryTitleBlock: {
    flex: 1,
    flexShrink: 1,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
  },
  entryOrg: {
    fontSize: 9,
    color: goldColor,
    marginTop: 1,
  },
  entryLocation: {
    fontSize: 7,
    color: "#9ca3af",
    marginTop: 1,
  },
  entryDate: {
    fontSize: 7,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
    textAlign: "right",
    flexShrink: 0,
  },
  bulletList: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 10,
    color: goldColor,
    fontSize: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 8,
    lineHeight: 1.4,
    flexShrink: 1,
  },
  // Skills as elegant tags
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 7,
    color: navyColor,
    backgroundColor: "#fef3c7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: goldLight,
  },
  // Education
  educationEntry: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  eduDegree: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
  },
  eduSchool: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  eduDate: {
    fontSize: 7,
    color: goldColor,
    marginTop: 2,
  },
  // Certifications
  certEntry: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 8,
    color: navyColor,
    fontFamily: "Helvetica-Bold",
  },
  certOrg: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 1,
  },
  // Footer - flows naturally at bottom
  footer: {
    marginTop: 20,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 35,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 6,
    color: "#9ca3af",
    paddingHorizontal: 15,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  // Other content
  otherContent: {
    color: "#4b5563",
    fontSize: 8,
    marginBottom: 2,
  },
});

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface ExecutiveTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

function ExperienceEntry({ entry }: { entry: ResumeEntry }) {
  const bullets = prepareBullets(entry.bullets);
  
  return (
    <View style={styles.experienceEntry} minPresenceAhead={50}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleBlock}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          {entry.organization && (
            <Text style={styles.entryOrg}>{entry.organization}</Text>
          )}
          {entry.location && (
            <Text style={styles.entryLocation}>{entry.location}</Text>
          )}
        </View>
        {entry.dateRange && (
          <Text style={styles.entryDate}>{entry.dateRange}</Text>
        )}
      </View>
      {bullets.length > 0 && (
        <View style={styles.bulletList}>
          {bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem} wrap={false}>
              <Text style={styles.bulletPoint}>■</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EducationEntryComponent({ entry }: { entry: ResumeEntry }) {
  return (
    <View style={styles.educationEntry} minPresenceAhead={40}>
      <Text style={styles.eduDegree}>{entry.title}</Text>
      {entry.organization && (
        <Text style={styles.eduSchool}>{entry.organization}</Text>
      )}
      {entry.dateRange && (
        <Text style={styles.eduDate}>{entry.dateRange}</Text>
      )}
    </View>
  );
}

function CertificationEntry({ entry }: { entry: ResumeEntry }) {
  return (
    <View style={styles.certEntry} minPresenceAhead={30}>
      <Text style={styles.certName}>{entry.title}</Text>
      {entry.organization && (
        <Text style={styles.certOrg}>{entry.organization}</Text>
      )}
    </View>
  );
}

export function ExecutiveTemplate({ content, fullName, targetRole, contactInfo }: ExecutiveTemplateProps) {
  const resume = parseResume(content);
  const skills = prepareSkills(resume.skills, 12);
  const summaryText = normalizeWhitespace(resume.summary.join(' '));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Premium Header Band - fixed to repeat on pages */}
        <View style={styles.headerBand} fixed>
          <View style={styles.headerContent}>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>
              <Text style={styles.title}>{targetRole || "Executive Professional"}</Text>
            </View>
            <View style={styles.contactBlock}>
              {contactInfo?.email && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Link src={`mailto:${contactInfo.email}`} style={styles.contactLink}>
                    {contactInfo.email}
                  </Link>
                </View>
              )}
              {contactInfo?.phone && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{contactInfo.phone}</Text>
                </View>
              )}
              {contactInfo?.location && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Location</Text>
                  <Text style={styles.contactValue}>{contactInfo.location}</Text>
                </View>
              )}
              {contactInfo?.linkedinUrl && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>LinkedIn</Text>
                  <Link 
                    src={contactInfo.linkedinUrl.startsWith('http') ? contactInfo.linkedinUrl : `https://${contactInfo.linkedinUrl}`} 
                    style={styles.contactLink}
                  >
                    {contactInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </Link>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Gold Accent Line */}
        <View style={styles.goldAccent} fixed />

        {/* Body */}
        <View style={styles.body}>
          {/* Full-width Executive Summary */}
          {resume.summary.length > 0 && (
            <View style={styles.summarySection} minPresenceAhead={60}>
              <Text style={styles.summaryLabel}>Executive Summary</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Two Column Layout */}
          <View style={styles.twoColumn}>
            {/* Left Column - Experience & Projects */}
            <View style={styles.leftColumn}>
              {resume.experience.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle} minPresenceAhead={60}>Professional Experience</Text>
                  {resume.experience.map((entry, index) => (
                    <ExperienceEntry key={index} entry={entry} />
                  ))}
                </View>
              )}
              
              {resume.projects.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle} minPresenceAhead={60}>Key Projects</Text>
                  {resume.projects.map((entry, index) => (
                    <ExperienceEntry key={index} entry={entry} />
                  ))}
                </View>
              )}

              {/* Other sections */}
              {resume.other.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle} minPresenceAhead={60}>{section.title}</Text>
                  {section.content.map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.otherContent}>{line}</Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Right Column - Skills, Education, Certifications */}
            <View style={styles.rightColumn}>
              {skills.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle} minPresenceAhead={60}>Core Competencies</Text>
                  <View style={styles.skillsGrid}>
                    {skills.map((skill, index) => (
                      <Text key={index} style={styles.skillTag}>{skill}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {resume.education.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle} minPresenceAhead={60}>Education</Text>
                  {resume.education.map((entry, index) => (
                    <EducationEntryComponent key={index} entry={entry} />
                  ))}
                </View>
              )}
              
              {resume.certifications.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle} minPresenceAhead={60}>Certifications</Text>
                  {resume.certifications.map((entry, index) => (
                    <CertificationEntry key={index} entry={entry} />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer - flows naturally */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>References Available Upon Request</Text>
          <View style={styles.footerLine} />
        </View>
      </Page>
    </Document>
  );
}
