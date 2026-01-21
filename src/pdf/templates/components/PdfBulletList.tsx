import { Text, View, StyleSheet } from "@react-pdf/renderer";

/**
 * Shared PDF Bullet List Component
 * 
 * Uses a single <Text> element per bullet to prevent layout fragmentation.
 * This avoids the flex-row View approach which causes text overlap and broken lines.
 */

interface PdfBulletListProps {
  bullets: string[];
  bulletSymbol?: string;
  bulletColor?: string;
  textColor?: string;
  fontSize?: number;
  lineHeight?: number;
  bulletWidth?: number;
}

const createStyles = (
  bulletColor: string,
  textColor: string,
  fontSize: number,
  lineHeight: number,
  bulletWidth: number
) =>
  StyleSheet.create({
    bulletList: {
      marginTop: 4,
    },
    bulletLine: {
      marginBottom: 3,
      paddingLeft: bulletWidth,
      position: "relative",
    },
    bulletSymbol: {
      position: "absolute",
      left: 0,
      top: 0,
      width: bulletWidth,
      color: bulletColor,
      fontSize: fontSize - 1,
    },
    bulletText: {
      color: textColor,
      fontSize: fontSize,
      lineHeight: lineHeight,
    },
  });

export function PdfBulletList({
  bullets,
  bulletSymbol = "•",
  bulletColor = "#4a6fa5",
  textColor = "#374151",
  fontSize = 8,
  lineHeight = 1.4,
  bulletWidth = 10,
}: PdfBulletListProps) {
  const styles = createStyles(bulletColor, textColor, fontSize, lineHeight, bulletWidth);

  if (!bullets || bullets.length === 0) return null;

  return (
    <View style={styles.bulletList}>
      {bullets.map((bullet, idx) => (
        <View key={idx} style={styles.bulletLine} wrap={false}>
          <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}
