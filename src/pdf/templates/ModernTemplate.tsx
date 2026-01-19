import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const primaryColor = "#0066cc";
const accentColor = "#00a8e8";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  sidebar: {
    width: "32%",
    backgroundColor: "#1e3a5f",
    padding: 25,
    paddingTop: 40,
    color: "#ffffff",
  },
  main: {
    width: "68%",
    padding: 30,
    paddingTop: 40,
    backgroundColor: "#ffffff",
  },
  // Sidebar styles
  sidebarName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  sidebarTitle: {
    fontSize: 10,
    color: accentColor,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 18,
  },
  sidebarSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: accentColor,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a6f",
    paddingBottom: 4,
  },
  sidebarText: {
    fontSize: 9,
    color: "#d1e3f8",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 10,
    marginRight: 8,
    color: accentColor,
  },
  contactText: {
    fontSize: 9,
    color: "#d1e3f8",
  },
  skillBar: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 9,
    color: "#ffffff",
    marginBottom: 3,
  },
  skillBarBg: {
    height: 4,
    backgroundColor: "#2d4a6f",
    borderRadius: 2,
  },
  skillBarFill: {
    height: 4,
    backgroundColor: accentColor,
    borderRadius: 2,
  },
  // Main content styles
  mainSection: {
    marginBottom: 16,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  experienceItem: {
    marginBottom: 12,
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
    color: "#1e3a5f",
  },
  expDate: {
    fontSize: 8,
    color: "#718096",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  expCompany: {
    fontSize: 9,
    color: primaryColor,
    marginBottom: 4,
  },
  bulletItem: {
    marginBottom: 3,
    color: "#4a5568",
    paddingLeft: 10,
  },
  paragraph: {
    marginBottom: 4,
    color: "#4a5568",
    textAlign: "justify",
  },
  summaryText: {
    color: "#4a5568",
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 4,
  },
});

interface ModernTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
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
      if (cleaned && cleaned.length < 30) {
        skills.push(cleaned);
      }
    }
  }
  return skills.slice(0, 10);
}

export function ModernTemplate({ content, fullName, targetRole }: ModernTemplateProps) {
  const sections = parseMarkdown(content);
  const skillsSection = sections.find(s => s.type === "skills");
  const skills = skillsSection ? extractSkills(skillsSection.content) : [];
  const mainSections = sections.filter(s => s.type !== "skills");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarName}>{fullName || "Your Name"}</Text>
          <Text style={styles.sidebarTitle}>{targetRole || "Professional Title"}</Text>
          
          {/* Contact Info */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>✉</Text>
              <Text style={styles.contactText}>email@example.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>☎</Text>
              <Text style={styles.contactText}>(555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>◎</Text>
              <Text style={styles.contactText}>City, State</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>⚯</Text>
              <Text style={styles.contactText}>linkedin.com/in/profile</Text>
            </View>
          </View>
          
          {/* Skills with visual bars */}
          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {skills.slice(0, 8).map((skill, index) => (
                <View key={index} style={styles.skillBar}>
                  <Text style={styles.skillName}>{skill}</Text>
                  <View style={styles.skillBarBg}>
                    <View style={[styles.skillBarFill, { width: `${85 - index * 5}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {mainSections.map((section, index) => (
            <View key={index} style={styles.mainSection}>
              {section.title && (
                <Text style={styles.mainSectionTitle}>{section.title}</Text>
              )}
              
              {section.type === "summary" && (
                <View>
                  {section.content.map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.summaryText}>
                      {line.replace(/^[-•]\s*/, "")}
                    </Text>
                  ))}
                </View>
              )}
              
              {(section.type === "experience" || section.type === "education" || section.type === "other") && (
                <View>
                  {section.content.map((line, lineIndex) => {
                    const isBullet = line.startsWith("-") || line.startsWith("•");
                    return (
                      <Text 
                        key={lineIndex} 
                        style={isBullet ? styles.bulletItem : styles.paragraph}
                      >
                        {isBullet ? `▸ ${line.slice(1).trim()}` : line}
                      </Text>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
