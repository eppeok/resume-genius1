import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1a365d",
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#1a365d",
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 10,
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 15,
    fontSize: 9,
    color: "#4a5568",
  },
  contactItem: {
    color: "#4a5568",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1a365d",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e0",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  paragraph: {
    marginBottom: 5,
    color: "#2d3748",
    textAlign: "justify",
  },
  experienceBlock: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2d3748",
  },
  jobDate: {
    fontSize: 9,
    color: "#718096",
    fontStyle: "italic",
  },
  company: {
    fontSize: 10,
    color: "#4a5568",
    marginBottom: 4,
  },
  bulletItem: {
    marginBottom: 3,
    color: "#2d3748",
    paddingLeft: 12,
    position: "relative",
  },
  bullet: {
    position: "absolute",
    left: 0,
    color: "#1a365d",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: "#edf2f7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 9,
    color: "#2d3748",
  },
  summaryText: {
    color: "#2d3748",
    textAlign: "justify",
    lineHeight: 1.6,
    marginBottom: 4,
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
    // Split by common delimiters
    const parts = line.split(/[,;|•·]/);
    for (const part of parts) {
      const cleaned = part.replace(/^[-•]\s*/, "").trim();
      if (cleaned && cleaned.length < 40) {
        skills.push(cleaned);
      }
    }
  }
  return skills.slice(0, 15); // Limit to 15 skills
}

export function ClassicTemplate({ content, fullName, targetRole, contactInfo }: ClassicTemplateProps) {
  const sections = parseMarkdown(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          <Text style={styles.title}>{targetRole || "Professional Title"}</Text>
        <View style={styles.contactRow}>
            <Text style={styles.contactItem}>📧 {contactInfo?.email || "email@example.com"}</Text>
            <Text style={styles.contactItem}>📱 {contactInfo?.phone || "(555) 123-4567"}</Text>
            <Text style={styles.contactItem}>📍 {contactInfo?.location || "City, State"}</Text>
            {contactInfo?.linkedinUrl && (
              <Link src={contactInfo.linkedinUrl.startsWith('http') ? contactInfo.linkedinUrl : `https://${contactInfo.linkedinUrl}`} style={styles.contactItem}>
                🔗 {contactInfo.linkedinUrl}
              </Link>
            )}
          </View>
        </View>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
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
            
            {section.type === "skills" && (
              <View style={styles.skillsContainer}>
                {extractSkills(section.content).map((skill, skillIndex) => (
                  <Text key={skillIndex} style={styles.skillTag}>{skill}</Text>
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
                      {isBullet ? `• ${line.slice(1).trim()}` : line}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
