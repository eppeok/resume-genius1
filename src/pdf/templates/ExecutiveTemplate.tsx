import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.7,
    backgroundColor: "#fafafa",
  },
  header: {
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#1e293b",
    paddingLeft: 16,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    color: "#475569",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#1e293b",
    paddingBottom: 6,
  },
  paragraph: {
    marginBottom: 8,
    color: "#334155",
    textAlign: "justify",
  },
  bulletItem: {
    marginBottom: 6,
    color: "#334155",
    paddingLeft: 12,
  },
  highlight: {
    backgroundColor: "#fef3c7",
    padding: "2 4",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

interface ExecutiveTemplateProps {
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

export function ExecutiveTemplate({ content, fullName, targetRole }: ExecutiveTemplateProps) {
  const sections = parseMarkdown(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          <Text style={styles.title}>{targetRole || "Executive Professional"}</Text>
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
                {line.startsWith("-") || line.startsWith("•") ? `■ ${line.slice(1).trim()}` : line}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Generated with ResumeAI</Text>
        </View>
      </Page>
    </Document>
  );
}
