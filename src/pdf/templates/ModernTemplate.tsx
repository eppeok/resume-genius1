import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { parseResume, getInitials, type ResumeEntry } from "./parseResume";
import { normalizeWhitespace, prepareBullets, prepareSkills } from "./styles";
import { PdfBulletList } from "./components/PdfBulletList";

// Modern Clean - Two-column layout with teal accents and experience cards
const primaryColor = "#0d9488";
const darkColor = "#134e4a";
const sidebarBg = "#0f172a";

// Fixed sidebar width in points for stable multi-page layout
const SIDEBAR_WIDTH = 170;
const PAGE_WIDTH = 595; // A4 width in points
const MAIN_WIDTH = PAGE_WIDTH - SIDEBAR_WIDTH;

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  // Sidebar - absolutely positioned, fixed to span all pages
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: sidebarBg,
    padding: 20,
    paddingTop: 30,
    color: "#ffffff",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  avatarText: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  sidebarName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 3,
    textAlign: "center",
    lineHeight: 1.2,
  },
  sidebarTitle: {
    fontSize: 9,
    color: primaryColor,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 16,
  },
  sidebarSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: primaryColor,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 4,
  },
  // Contact items
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  contactIcon: {
    width: 18,
    fontSize: 7,
    color: primaryColor,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    flexShrink: 0,
  },
  contactText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 8,
    color: "#cbd5e1",
    lineHeight: 1.3,
  },
  contactLink: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 8,
    color: "#cbd5e1",
    textDecoration: "none",
    lineHeight: 1.3,
  },
  // Skills
  skillItem: {
    marginBottom: 6,
  },
  skillName: {
    fontSize: 8,
    color: "#ffffff",
    marginBottom: 2,
  },
  skillBarBg: {
    height: 3,
    backgroundColor: "#334155",
    borderRadius: 1,
  },
  skillBarFill: {
    height: 3,
    backgroundColor: primaryColor,
    borderRadius: 1,
  },
  // Skill tags for overflow
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  skillTag: {
    fontSize: 6,
    color: "#94a3b8",
    backgroundColor: "#1e293b",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    marginRight: 3,
    marginBottom: 3,
  },
  // Main content - offset by sidebar width
  main: {
    marginLeft: SIDEBAR_WIDTH,
    width: MAIN_WIDTH,
    padding: 25,
    paddingTop: 30,
    paddingBottom: 50,
    backgroundColor: "#ffffff",
    minHeight: "100%",
  },
  mainSection: {
    marginBottom: 14,
  },
  mainSectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 4,
  },
  // Summary
  summaryText: {
    color: "#374151",
    lineHeight: 1.6,
    textAlign: "justify",
    fontSize: 9,
  },
  // Experience cards
  experienceCard: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: primaryColor,
    paddingTop: 2,
    paddingBottom: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  cardTitleBlock: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
  },
  cardOrg: {
    fontSize: 9,
    color: primaryColor,
    marginTop: 1,
  },
  cardLocation: {
    fontSize: 7,
    color: "#9ca3af",
    marginTop: 1,
  },
  cardDate: {
    fontSize: 7,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    flexShrink: 0,
  },
  // Education
  educationEntry: {
    marginBottom: 8,
  },
  eduDegree: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: darkColor,
  },
  eduSchool: {
    fontSize: 8,
    color: primaryColor,
    marginTop: 1,
  },
  eduMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  eduLocation: {
    fontSize: 7,
    color: "#9ca3af",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 6,
  },
  eduDate: {
    fontSize: 7,
    color: "#6b7280",
    fontFamily: "Helvetica-Oblique",
    flexShrink: 0,
  },
  // Sidebar education
  sidebarEduEntry: {
    marginBottom: 8,
  },
  sidebarEduTitle: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  sidebarEduOrg: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 1,
  },
  sidebarEduDate: {
    fontSize: 6,
    color: "#64748b",
    marginTop: 1,
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

interface ModernTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

function ExperienceCard({ entry }: { entry: ResumeEntry }) {
  const bullets = prepareBullets(entry.bullets);
  
  return (
    <View style={styles.experienceCard} minPresenceAhead={50}>
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
      <PdfBulletList
        bullets={bullets}
        bulletSymbol="▸"
        bulletColor={primaryColor}
        textColor="#4b5563"
        fontSize={8}
        bulletWidth={12}
      />
    </View>
  );
}

function EducationEntry({ entry }: { entry: ResumeEntry }) {
  return (
    <View style={styles.educationEntry} minPresenceAhead={40}>
      <Text style={styles.eduDegree}>{entry.title}</Text>
      {entry.organization && (
        <Text style={styles.eduSchool}>{entry.organization}</Text>
      )}
      <View style={styles.eduMeta}>
        {entry.location && <Text style={styles.eduLocation}>{entry.location}</Text>}
        {entry.dateRange && (
          <Text style={styles.eduDate}>{entry.dateRange}</Text>
        )}
      </View>
    </View>
  );
}

export function ModernTemplate({ content, fullName, targetRole, contactInfo }: ModernTemplateProps) {
  const resume = parseResume(content);
  const initials = getInitials(fullName || "YN");
  const primarySkills = prepareSkills(resume.skills.slice(0, 5), 5);
  const secondarySkills = prepareSkills(resume.skills.slice(5, 10), 5);
  const summaryText = normalizeWhitespace(resume.summary.join(' '));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar - fixed and absolutely positioned to span all pages */}
        <View style={styles.sidebar} fixed>
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
                  {contactInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
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
                    <View style={[styles.skillBarFill, { width: `${90 - index * 10}%` }]} />
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
                <View key={index} style={styles.sidebarEduEntry}>
                  <Text style={styles.sidebarEduTitle}>{edu.title}</Text>
                  {edu.organization && (
                    <Text style={styles.sidebarEduOrg}>{edu.organization}</Text>
                  )}
                  {edu.dateRange && (
                    <Text style={styles.sidebarEduDate}>{edu.dateRange}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content - offset by sidebar width */}
        <View style={styles.main}>
          {/* Summary */}
          {resume.summary.length > 0 && (
            <View style={styles.mainSection} minPresenceAhead={60}>
              <Text style={styles.mainSectionTitle}>About Me</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle} minPresenceAhead={60}>Experience</Text>
              {resume.experience.map((entry, index) => (
                <ExperienceCard key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle} minPresenceAhead={60}>Certifications</Text>
              {resume.certifications.map((entry, index) => (
                <EducationEntry key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle} minPresenceAhead={60}>Projects</Text>
              {resume.projects.map((entry, index) => (
                <ExperienceCard key={index} entry={entry} />
              ))}
            </View>
          )}

          {/* Other Sections */}
          {resume.other.map((section, index) => (
            <View key={index} style={styles.mainSection}>
              <Text style={styles.mainSectionTitle} minPresenceAhead={60}>{section.title}</Text>
              {section.content.map((line, lineIndex) => (
                <Text key={lineIndex} style={styles.otherContent}>{line}</Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
