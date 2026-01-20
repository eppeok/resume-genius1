import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, type ResumeEntry } from "./parseResume";

// Classic Professional - Elegant serif-inspired design with navy accents
const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a5f",
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 12,
    color: "#4a6fa5",
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: "Helvetica-Oblique",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 8,
    color: "#6b7c93",
    marginRight: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 9,
    color: "#2d3748",
  },
  contactLink: {
    fontSize: 9,
    color: "#4a6fa5",
    textDecoration: "none",
  },
  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d9e6",
    paddingBottom: 4,
  },
  // Summary
  summaryText: {
    color: "#374151",
    lineHeight: 1.6,
    textAlign: "justify",
    fontSize: 10,
  },
  // Experience
  experienceEntry: {
    marginBottom: 14,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  entryTitleBlock: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  entryOrg: {
    fontSize: 10,
    color: "#4a6fa5",
    marginTop: 1,
  },
  entryDate: {
    fontSize: 9,
    color: "#6b7c93",
    fontFamily: "Helvetica-Oblique",
    textAlign: "right",
    minWidth: 90,
  },
  entryLocation: {
    fontSize: 8,
    color: "#8b98a8",
    marginTop: 2,
  },
  bulletList: {
    marginTop: 6,
    paddingLeft: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
    color: "#4a6fa5",
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    color: "#374151",
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Skills
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: "#f0f4f8",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    fontSize: 9,
    color: "#1e3a5f",
    borderWidth: 1,
    borderColor: "#d1d9e6",
  },
  // Education
  educationEntry: {
    marginBottom: 10,
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  eduSchool: {
    fontSize: 9,
    color: "#4a6fa5",
    marginTop: 2,
  },
  eduDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  eduLocation: {
    fontSize: 8,
    color: "#8b98a8",
  },
  eduDate: {
    fontSize: 8,
    color: "#6b7c93",
    fontFamily: "Helvetica-Oblique",
  },
  // Other sections
  otherContent: {
    color: "#374151",
    fontSize: 9,
    marginBottom: 3,
  },
});

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface ClassicTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

function ExperienceEntryComponent({ entry }: { entry: ResumeEntry }) {
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
              <Text style={styles.bulletPoint}>•</Text>
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
      <View style={styles.eduDetails}>
        {entry.location && (
          <Text style={styles.eduLocation}>{entry.location}</Text>
        )}
        {entry.dateRange && (
          <Text style={styles.eduDate}>{entry.dateRange}</Text>
        )}
      </View>
      {entry.bullets.length > 0 && (
        <View style={styles.bulletList}>
          {entry.bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function ClassicTemplate({ content, fullName, targetRole, contactInfo }: ClassicTemplateProps) {
  const resume = parseResume(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          <Text style={styles.title}>{targetRole || "Professional Title"}</Text>
          <View style={styles.contactRow}>
            {contactInfo?.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email</Text>
                <Link src={`mailto:${contactInfo.email}`} style={styles.contactLink}>
                  {contactInfo.email}
                </Link>
              </View>
            )}
            {contactInfo?.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{contactInfo.phone}</Text>
              </View>
            )}
            {contactInfo?.location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{contactInfo.location}</Text>
              </View>
            )}
            {contactInfo?.linkedinUrl && (
              <View style={styles.contactItem}>
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

        {/* Summary */}
        {resume.summary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>
              {resume.summary.join(' ')}
            </Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {resume.experience.map((entry, index) => (
              <ExperienceEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.skillsContainer}>
              {resume.skills.slice(0, 15).map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((entry, index) => (
              <EducationEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((entry, index) => (
              <EducationEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((entry, index) => (
              <ExperienceEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Other Sections */}
        {resume.other.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.otherContent}>{line}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
