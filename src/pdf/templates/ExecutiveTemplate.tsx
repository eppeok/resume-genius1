import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, type ResumeEntry } from "./parseResume";

// Executive - Premium design with navy header, gold accents, sophisticated layout
const navyColor = "#0f172a";
const goldColor = "#b8860b";
const goldLight = "#d4a847";

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  // Premium header band
  headerBand: {
    backgroundColor: navyColor,
    paddingHorizontal: 40,
    paddingTop: 45,
    paddingBottom: 35,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 12,
    color: goldColor,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  contactBlock: {
    alignItems: "flex-end",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  contactLabel: {
    fontSize: 7,
    color: "#64748b",
    marginRight: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    width: 55,
    textAlign: "right",
  },
  contactValue: {
    fontSize: 9,
    color: "#e2e8f0",
    minWidth: 120,
  },
  contactLink: {
    fontSize: 9,
    color: "#e2e8f0",
    textDecoration: "none",
    minWidth: 120,
  },
  // Gold accent line
  goldAccent: {
    height: 4,
    backgroundColor: goldColor,
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 25,
    paddingBottom: 40,
  },
  // Full width summary
  summarySection: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 8,
    color: goldColor,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  summaryText: {
    color: "#374151",
    lineHeight: 1.8,
    fontSize: 11,
    textAlign: "justify",
  },
  // Two column layout
  twoColumn: {
    flexDirection: "row",
    gap: 30,
  },
  leftColumn: {
    width: "62%",
  },
  rightColumn: {
    width: "38%",
  },
  // Section styling
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: goldColor,
  },
  rightSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  // Experience entries with gold left border
  experienceEntry: {
    marginBottom: 16,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: goldColor,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  entryTitleBlock: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
  },
  entryOrg: {
    fontSize: 10,
    color: goldColor,
    marginTop: 2,
  },
  entryLocation: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  entryDate: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
    textAlign: "right",
    minWidth: 85,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
    color: goldColor,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Skills as elegant tags
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    fontSize: 8,
    color: navyColor,
    backgroundColor: "#fef3c7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: goldLight,
  },
  // Education
  educationEntry: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: navyColor,
  },
  eduSchool: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },
  eduDate: {
    fontSize: 8,
    color: goldColor,
    marginTop: 3,
  },
  // Certifications
  certEntry: {
    marginBottom: 8,
  },
  certName: {
    fontSize: 9,
    color: navyColor,
    fontFamily: "Helvetica-Bold",
  },
  certOrg: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
    paddingHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 2,
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
  return (
    <View style={styles.experienceEntry}>
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
      {entry.bullets.length > 0 && (
        <View style={styles.bulletList}>
          {entry.bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem}>
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
    <View style={styles.educationEntry}>
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
    <View style={styles.certEntry}>
      <Text style={styles.certName}>{entry.title}</Text>
      {entry.organization && (
        <Text style={styles.certOrg}>{entry.organization}</Text>
      )}
    </View>
  );
}

export function ExecutiveTemplate({ content, fullName, targetRole, contactInfo }: ExecutiveTemplateProps) {
  const resume = parseResume(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Premium Header Band */}
        <View style={styles.headerBand}>
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
                    {contactInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </Link>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Gold Accent Line */}
        <View style={styles.goldAccent} />

        {/* Body */}
        <View style={styles.body}>
          {/* Full-width Executive Summary */}
          {resume.summary.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>Executive Summary</Text>
              <Text style={styles.summaryText}>
                {resume.summary.join(' ')}
              </Text>
            </View>
          )}

          {/* Two Column Layout */}
          <View style={styles.twoColumn}>
            {/* Left Column - Experience & Projects */}
            <View style={styles.leftColumn}>
              {resume.experience.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Professional Experience</Text>
                  {resume.experience.map((entry, index) => (
                    <ExperienceEntry key={index} entry={entry} />
                  ))}
                </View>
              )}
              
              {resume.projects.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Key Projects</Text>
                  {resume.projects.map((entry, index) => (
                    <ExperienceEntry key={index} entry={entry} />
                  ))}
                </View>
              )}

              {/* Other sections */}
              {resume.other.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.content.map((line, lineIndex) => (
                    <Text key={lineIndex} style={{ color: "#4b5563", fontSize: 9, marginBottom: 3 }}>
                      {line}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Right Column - Skills, Education, Certifications */}
            <View style={styles.rightColumn}>
              {resume.skills.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle}>Core Competencies</Text>
                  <View style={styles.skillsGrid}>
                    {resume.skills.slice(0, 15).map((skill, index) => (
                      <Text key={index} style={styles.skillTag}>{skill}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {resume.education.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle}>Education</Text>
                  {resume.education.map((entry, index) => (
                    <EducationEntryComponent key={index} entry={entry} />
                  ))}
                </View>
              )}
              
              {resume.certifications.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle}>Certifications</Text>
                  {resume.certifications.map((entry, index) => (
                    <CertificationEntry key={index} entry={entry} />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>References Available Upon Request</Text>
          <View style={styles.footerLine} />
        </View>
      </Page>
    </Document>
  );
}
