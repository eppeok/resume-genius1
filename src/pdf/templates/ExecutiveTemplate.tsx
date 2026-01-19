import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  headerBand: {
    backgroundColor: "#1a1a2e",
    padding: 35,
    paddingTop: 45,
    paddingBottom: 30,
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
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 13,
    color: "#c9a227",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  contactBlock: {
    alignItems: "flex-end",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 8,
    color: "#8b8b9e",
    marginRight: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 9,
    color: "#ffffff",
  },
  goldAccent: {
    height: 4,
    backgroundColor: "#c9a227",
  },
  body: {
    padding: 35,
    paddingTop: 25,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 25,
  },
  leftColumn: {
    width: "65%",
  },
  rightColumn: {
    width: "35%",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#c9a227",
  },
  rightSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  summaryText: {
    color: "#4a4a4a",
    lineHeight: 1.7,
    textAlign: "justify",
    marginBottom: 4,
    fontSize: 10,
  },
  experienceItem: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#c9a227",
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  expTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  expDate: {
    fontSize: 8,
    color: "#888888",
    fontStyle: "italic",
  },
  expCompany: {
    fontSize: 9,
    color: "#c9a227",
    marginBottom: 5,
  },
  bulletItem: {
    marginBottom: 3,
    color: "#4a4a4a",
    paddingLeft: 10,
    fontSize: 9,
  },
  paragraph: {
    marginBottom: 4,
    color: "#4a4a4a",
    fontSize: 9,
  },
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    color: "#4a4a4a",
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  educationItem: {
    marginBottom: 8,
  },
  eduDegree: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  eduSchool: {
    fontSize: 8,
    color: "#666666",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
  },
  footerText: {
    fontSize: 7,
    color: "#999999",
    paddingHorizontal: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
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

interface ParsedSection {
  title: string;
  content: string[];
  type: "summary" | "experience" | "education" | "skills" | "other";
}

function parseMarkdown(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { title: "", content: [], type: "other" };
  
  const lines = markdown.split("\n");
  
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection.title || currentSection.content.length) {
        sections.push(currentSection);
      }
      const title = line.replace("## ", "").replace(/\*\*/g, "").trim();
      const lowerTitle = title.toLowerCase();
      let type: ParsedSection["type"] = "other";
      
      if (lowerTitle.includes("summary") || lowerTitle.includes("objective") || lowerTitle.includes("profile")) {
        type = "summary";
      } else if (lowerTitle.includes("experience") || lowerTitle.includes("work") || lowerTitle.includes("employment")) {
        type = "experience";
      } else if (lowerTitle.includes("education") || lowerTitle.includes("academic")) {
        type = "education";
      } else if (lowerTitle.includes("skill") || lowerTitle.includes("competenc") || lowerTitle.includes("technical")) {
        type = "skills";
      }
      
      currentSection = { title, content: [], type };
    } else if (line.startsWith("# ")) {
      // Skip main title
    } else if (line.trim()) {
      currentSection.content.push(line.replace(/\*\*/g, "").replace(/\*/g, "").trim());
    }
  }
  
  if (currentSection.title || currentSection.content.length) {
    sections.push(currentSection);
  }
  
  return sections;
}

function extractSkills(content: string[]): string[] {
  const skills: string[] = [];
  for (const line of content) {
    const parts = line.split(/[,;|•·]/);
    for (const part of parts) {
      const cleaned = part.replace(/^[-•]\s*/, "").trim();
      if (cleaned && cleaned.length < 35) {
        skills.push(cleaned);
      }
    }
  }
  return skills.slice(0, 12);
}

export function ExecutiveTemplate({ content, fullName, targetRole, contactInfo }: ExecutiveTemplateProps) {
  const sections = parseMarkdown(content);
  const summarySection = sections.find(s => s.type === "summary");
  const experienceSection = sections.find(s => s.type === "experience");
  const educationSection = sections.find(s => s.type === "education");
  const skillsSection = sections.find(s => s.type === "skills");
  const otherSections = sections.filter(s => !["summary", "experience", "education", "skills"].includes(s.type));
  
  const skills = skillsSection ? extractSkills(skillsSection.content) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Band */}
        <View style={styles.headerBand}>
          <View style={styles.headerContent}>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>
              <Text style={styles.title}>{targetRole || "Executive Professional"}</Text>
            </View>
            <View style={styles.contactBlock}>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{contactInfo?.email || "email@example.com"}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{contactInfo?.phone || "(555) 123-4567"}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{contactInfo?.location || "City, State"}</Text>
              </View>
              {contactInfo?.linkedinUrl && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>LinkedIn</Text>
                  <Text style={styles.contactValue}>{contactInfo.linkedinUrl}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Gold Accent Line */}
        <View style={styles.goldAccent} />

        {/* Body */}
        <View style={styles.body}>
          {/* Summary at top - full width */}
          {summarySection && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              {summarySection.content.map((line, lineIndex) => (
                <Text key={lineIndex} style={styles.summaryText}>
                  {line.replace(/^[-•]\s*/, "")}
                </Text>
              ))}
            </View>
          )}

          {/* Two Column Layout */}
          <View style={styles.twoColumn}>
            {/* Left Column - Experience */}
            <View style={styles.leftColumn}>
              {experienceSection && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{experienceSection.title}</Text>
                  {experienceSection.content.map((line, lineIndex) => {
                    const isBullet = line.startsWith("-") || line.startsWith("•");
                    return (
                      <Text 
                        key={lineIndex} 
                        style={isBullet ? styles.bulletItem : styles.paragraph}
                      >
                        {isBullet ? `▪ ${line.slice(1).trim()}` : line}
                      </Text>
                    );
                  })}
                </View>
              )}
              
              {otherSections.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.content.map((line, lineIndex) => {
                    const isBullet = line.startsWith("-") || line.startsWith("•");
                    return (
                      <Text 
                        key={lineIndex} 
                        style={isBullet ? styles.bulletItem : styles.paragraph}
                      >
                        {isBullet ? `▪ ${line.slice(1).trim()}` : line}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Right Column - Skills & Education */}
            <View style={styles.rightColumn}>
              {skills.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle}>Core Competencies</Text>
                  <View style={styles.skillTags}>
                    {skills.map((skill, index) => (
                      <Text key={index} style={styles.skillTag}>{skill}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {educationSection && (
                <View style={styles.section}>
                  <Text style={styles.rightSectionTitle}>{educationSection.title}</Text>
                  {educationSection.content.map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.paragraph}>
                      {line.replace(/^[-•]\s*/, "")}
                    </Text>
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
