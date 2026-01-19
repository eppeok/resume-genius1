import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 24,
    textAlign: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    backgroundColor: "#2563eb",
    width: 60,
    marginTop: 12,
    marginHorizontal: "auto",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  paragraph: {
    marginBottom: 6,
    color: "#334155",
  },
  bulletItem: {
    marginBottom: 5,
    color: "#334155",
    paddingLeft: 10,
  },
  twoColumn: {
    flexDirection: "row",
    marginTop: 4,
  },
  column: {
    flex: 1,
  },
});

interface ModernTemplateProps {
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

export function ModernTemplate({ content, fullName, targetRole }: ModernTemplateProps) {
  const sections = parseMarkdown(content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          <Text style={styles.title}>{targetRole || "Professional Title"}</Text>
          <View style={styles.divider} />
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
                {line.startsWith("-") || line.startsWith("•") ? `▸ ${line.slice(1).trim()}` : line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
