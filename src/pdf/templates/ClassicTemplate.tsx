import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, type ResumeEntry } from "./parseResume";
import { normalizeWhitespace, prepareBullets, prepareSkills } from "./styles";

// Classic Professional - Elegant serif-inspired design with navy accents
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a5f",
    paddingBottom: 14,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 11,
    color: "#4a6fa5",
    marginBottom: 10,
    letterSpacing: 0.5,
    fontFamily: "Helvetica-Oblique",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    rowGap: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "48%",
  },
  contactLabel: {
    fontSize: 7,
    color: "#6b7c93",
    marginRight: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  contactValue: {
    fontSize: 8,
    color: "#2d3748",
    flexShrink: 1,
  },
  contactLink: {
    fontSize: 8,
    color: "#4a6fa5",
    textDecoration: "none",
    flexShrink: 1,
  },
  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d9e6",
    paddingBottom: 3,
  },
  // Summary
  summaryText: {
    color: "#374151",
    lineHeight: 1.5,
    textAlign: "justify",
    fontSize: 9,
  },
  // Experience
  experienceEntry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
    gap: 8,
  },
  entryTitleBlock: {
    flex: 1,
    flexShrink: 1,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  entryOrg: {
    fontSize: 9,
    color: "#4a6fa5",
    marginTop: 1,
  },
  entryDate: {
    fontSize: 8,
    color: "#6b7c93",
    fontFamily: "Helvetica-Oblique",
    textAlign: "right",
    flexShrink: 0,
  },
  entryLocation: {
    fontSize: 7,
    color: "#8b98a8",
    marginTop: 1,
  },
  bulletList: {
    marginTop: 4,
    paddingLeft: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 10,
    color: "#4a6fa5",
    fontSize: 9,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    color: "#374151",
    fontSize: 8,
    lineHeight: 1.4,
    flexShrink: 1,
  },
  // Skills
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: "#f0f4f8",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
    fontSize: 8,
    color: "#1e3a5f",
    borderWidth: 1,
    borderColor: "#d1d9e6",
  },
  // Education
  educationEntry: {
    marginBottom: 8,
  },
  eduDegree: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  eduSchool: {
    fontSize: 8,
    color: "#4a6fa5",
    marginTop: 1,
  },
  eduDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 1,
    gap: 8,
  },
  eduLocation: {
    fontSize: 7,
    color: "#8b98a8",
    flexShrink: 1,
  },
  eduDate: {
    fontSize: 7,
    color: "#6b7c93",
    fontFamily: "Helvetica-Oblique",
    flexShrink: 0,
  },
  // Other sections
  otherContent: {
    color: "#374151",
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

interface ClassicTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

function ExperienceEntryComponent({ entry }: { entry: ResumeEntry }) {
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
  const bullets = prepareBullets(entry.bullets);
  
  return (
    <View style={styles.educationEntry} minPresenceAhead={40}>
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
      {bullets.length > 0 && (
        <View style={styles.bulletList}>
          {bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem} wrap={false}>
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
  const skills = prepareSkills(resume.skills, 15);
  const summaryText = normalizeWhitespace(resume.summary.join(' '));

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
                  {contactInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </Link>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        {resume.summary.length > 0 && (
          <View style={styles.section} minPresenceAhead={60}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={60}>Professional Experience</Text>
            {resume.experience.map((entry, index) => (
              <ExperienceEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section} minPresenceAhead={60}>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={60}>Education</Text>
            {resume.education.map((entry, index) => (
              <EducationEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={60}>Certifications</Text>
            {resume.certifications.map((entry, index) => (
              <EducationEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={60}>Projects</Text>
            {resume.projects.map((entry, index) => (
              <ExperienceEntryComponent key={index} entry={entry} />
            ))}
          </View>
        )}

        {/* Other Sections */}
        {resume.other.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={60}>{section.title}</Text>
            {section.content.map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.otherContent}>{line}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
