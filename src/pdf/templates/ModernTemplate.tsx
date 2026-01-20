import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, getInitials, type ResumeEntry } from "./parseResume";

// Modern Clean - Two-column layout with teal accents and experience cards
const primaryColor = "#0d9488";
const darkColor = "#134e4a";
const sidebarBg = "#0f172a";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  // Sidebar
  sidebar: {
    width: "35%",
    backgroundColor: sidebarBg,
    padding: 25,
    paddingTop: 35,
    color: "#ffffff",
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    alignSelf: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  sidebarName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 1.2,
  },
  sidebarTitle: {
    fontSize: 10,
    color: primaryColor,
    marginBottom: 25,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: primaryColor,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 5,
  },
  // Contact items
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  contactIcon: {
    width: 22,
    fontSize: 8,
    color: primaryColor,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  contactText: {
    flex: 1,
    fontSize: 9,
    color: "#cbd5e1",
    lineHeight: 1.4,
  },
  contactLink: {
    flex: 1,
    fontSize: 9,
    color: "#cbd5e1",
    textDecoration: "none",
    lineHeight: 1.4,
  },
  // Skills
  skillItem: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 9,
    color: "#ffffff",
    marginBottom: 3,
  },
  skillBarBg: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
  },
  skillBarFill: {
    height: 4,
    backgroundColor: primaryColor,
    borderRadius: 2,
  },
  // Skill tags for overflow
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 8,
  },
  skillTag: {
    fontSize: 7,
    color: "#94a3b8",
    backgroundColor: "#1e293b",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  // Main content
  main: {
    width: "65%",
    padding: 30,
    paddingTop: 35,
    backgroundColor: "#ffffff",
  },
  mainSection: {
    marginBottom: 18,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 5,
  },
  // Summary
  summaryText: {
    color: "#374151",
    lineHeight: 1.7,
    textAlign: "justify",
    fontSize: 10,
  },
  // Experience cards
  experienceCard: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: primaryColor,
    paddingTop: 2,
    paddingBottom: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
  },
  cardOrg: {
    fontSize: 10,
    color: primaryColor,
    marginTop: 1,
  },
  cardLocation: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  cardDate: {
    fontSize: 8,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 14,
    color: primaryColor,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Education
  educationEntry: {
    marginBottom: 10,
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
  },
  eduSchool: {
    fontSize: 9,
    color: primaryColor,
    marginTop: 2,
  },
  eduMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  eduLocation: {
    fontSize: 8,
    color: "#9ca3af",
  },
  eduDate: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
  },
});

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface ModernTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

function ExperienceCard({ entry }: { entry: ResumeEntry }) {
  return (
    <View style={styles.experienceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{entry.title}</Text>
          {entry.organization && (
            <Text style={styles.cardOrg}>{entry.organization}</Text>
          )}
          {entry.location && (
            <Text style={styles.cardLocation}>{entry.location}</Text>
          )}
        </View>
        {entry.dateRange && (
          <Text style={styles.cardDate}>{entry.dateRange}</Text>
        )}
      </View>
      {entry.bullets.length > 0 && (
        <View style={styles.bulletList}>
          {entry.bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>▸</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EducationEntry({ entry }: { entry: ResumeEntry }) {
  return (
    <View style={styles.educationEntry}>
      <Text style={styles.eduDegree}>{entry.title}</Text>
      {entry.organization && (
        <Text style={styles.eduSchool}>{entry.organization}</Text>
      )}
      <View style={styles.eduMeta}>
        {entry.location && <Text style={styles.eduLocation}>{entry.location}</Text>}
        {entry.dateRange && <Text style={styles.eduDate}>{entry.dateRange}</Text>}
      </View>
    </View>
  );
}

export function ModernTemplate({ content, fullName, targetRole, contactInfo }: ModernTemplateProps) {
  const resume = parseResume(content);
  const initials = getInitials(fullName || "YN");
  const primarySkills = resume.skills.slice(0, 6);
  const secondarySkills = resume.skills.slice(6, 12);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Avatar with initials */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          
          <Text style={styles.sidebarName}>{fullName || "Your Name"}</Text>
          <Text style={styles.sidebarTitle}>{targetRole || "Professional Title"}</Text>
          
          {/* Contact Info */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
            {contactInfo?.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>@</Text>
                <Link src={`mailto:${contactInfo.email}`} style={styles.contactLink}>
                  {contactInfo.email}
                </Link>
              </View>
            )}
            {contactInfo?.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>T</Text>
                <Text style={styles.contactText}>{contactInfo.phone}</Text>
              </View>
            )}
            {contactInfo?.location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>L</Text>
                <Text style={styles.contactText}>{contactInfo.location}</Text>
              </View>
            )}
            {contactInfo?.linkedinUrl && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>in</Text>
                <Link 
                  src={contactInfo.linkedinUrl.startsWith('http') ? contactInfo.linkedinUrl : `https://${contactInfo.linkedinUrl}`} 
                  style={styles.contactLink}
                >
                  {contactInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                </Link>
              </View>
            )}
          </View>
          
          {/* Skills with visual bars */}
          {primarySkills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {primarySkills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill}</Text>
                  <View style={styles.skillBarBg}>
                    <View style={[styles.skillBarFill, { width: `${90 - index * 8}%` }]} />
                  </View>
                </View>
              ))}
              {secondarySkills.length > 0 && (
                <View style={styles.skillTags}>
                  {secondarySkills.map((skill, index) => (
                    <Text key={index} style={styles.skillTag}>{skill}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Education in sidebar if present */}
          {resume.education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Education</Text>
              {resume.education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 9, color: "#ffffff", fontFamily: "Helvetica-Bold" }}>
                    {edu.title}
                  </Text>
                  {edu.organization && (
                    <Text style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>
                      {edu.organization}
                    </Text>
                  )}
                  {edu.dateRange && (
                    <Text style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>
                      {edu.dateRange}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Summary */}
          {resume.summary.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>About Me</Text>
              <Text style={styles.summaryText}>
                {resume.summary.join(' ')}
              </Text>
            </View>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Experience</Text>
              {resume.experience.map((entry, index) => (
                <ExperienceCard key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Certifications</Text>
              {resume.certifications.map((entry, index) => (
                <EducationEntry key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Projects</Text>
              {resume.projects.map((entry, index) => (
                <ExperienceCard key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Other Sections */}
          {resume.other.map((section, index) => (
            <View key={index} style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>{section.title}</Text>
              {section.content.map((line, lineIndex) => (
                <Text key={lineIndex} style={{ color: "#4b5563", fontSize: 9, marginBottom: 3 }}>
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
