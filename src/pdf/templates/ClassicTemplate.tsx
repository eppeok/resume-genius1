import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Use built-in Helvetica font - no registration needed for standard PDF fonts
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  paragraph: {
    marginBottom: 6,
    color: "#444",
  },
  bulletList: {
    paddingLeft: 15,
  },
  bulletItem: {
    marginBottom: 4,
    color: "#444",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skill: {
    backgroundColor: "#f0f0f0",
    padding: "4 8",
    borderRadius: 3,
    fontSize: 10,
  },
});

interface ClassicTemplateProps {
  content: string;
  fullName: string;
  targetRole: string;
}

function parseMarkdown(markdown: string) {
  const sections: { title: string; content: string[] }[] = [];
  let currentSection = { title: "", content: [] as string[] };
  
  const lines = markdown.split("\n");
  
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection.title || currentSection.content.length) {
        sections.push(currentSection);
      }
      currentSection = { title: line.replace("## ", "").replace(/\*\*/g, ""), content: [] };
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

export function ClassicTemplate({ content, fullName, targetRole }: ClassicTemplateProps) {
  const sections = parseMarkdown(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          <Text style={styles.title}>{targetRole || "Professional Title"}</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            {section.content.map((line, lineIndex) => (
              <Text 
                key={lineIndex} 
                style={line.startsWith("-") || line.startsWith("•") ? styles.bulletItem : styles.paragraph}
              >
                {line.startsWith("-") || line.startsWith("•") ? `• ${line.slice(1).trim()}` : line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
