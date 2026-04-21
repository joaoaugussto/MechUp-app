import { DimensionValue, StyleSheet, View } from "react-native";
import { Card, useTheme } from "react-native-paper";

function Bar({ width, h = 12 }: { width: DimensionValue; h?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.bar, { height: h, backgroundColor: theme.colors.surfaceVariant, width }]} />
  );
}

export function CardSkeleton() {
  const theme = useTheme();
  return (
    <Card mode="outlined" style={{ borderColor: theme.colors.outlineVariant }}>
      <Card.Content style={styles.cardPad}>
        <Bar width="40%" />
        <Bar width="55%" h={22} />
        <Bar width="65%" h={10} />
      </Card.Content>
    </Card>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.row, { borderColor: theme.colors.outlineVariant }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={styles.rowText}>
            <Bar width="33%" h={10} />
            <Bar width="50%" h={10} />
          </View>
          <Bar width={56} h={22} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 4,
  },
  cardPad: {
    gap: 10,
    paddingVertical: 4,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
});
